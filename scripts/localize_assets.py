#!/usr/bin/env python3
"""Vendor the snapshot's dependencies without re-encoding media or changing motion.

Downloads are resumable. Source URL rewrites happen only after every requested
download succeeds. Run from any directory: python3 scripts/localize_assets.py
"""
from concurrent.futures import ThreadPoolExecutor, as_completed
from hashlib import sha256
from pathlib import Path
from urllib.parse import urlsplit, urljoin
import html
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://framerusercontent.com/sites/3VY1HmjlOvuRT8SOIi0Dnw/'
URL = re.compile(r'https://[^\s"\'<>`\\)]+')
IMPORT = re.compile(r'["\'`](\./[A-Za-z0-9_.-]+\.(?:mjs|js))["\'`]')
CATALOG = ('google-', 'fontshare-', 'framer-font-')
MANIFEST = ROOT / 'assets/manifest.json'


def urls(text):
    # A srcset's comma separates URLs; HTML may escape query-string ampersands.
    return {html.unescape(u.split('&quot;')[0])
            for match in URL.findall(text) for u in match.split(',') if u.startswith('https://')}


def destination(url):
    parsed = urlsplit(url)
    if url.startswith('https://framer.com/m/phosphor-icons/'):
        return '/modules/icons/' + parsed.path.rsplit('/', 1)[-1].replace('.js@0.0.57', '.mjs')
    if parsed.netloc == 'framerusercontent.com' and parsed.path.startswith('/modules/'):
        return '/modules/vendor/' + sha256(url.encode()).hexdigest()[:16] + '-' + Path(parsed.path).stem + '.mjs'
    if url.startswith(SITE):
        return '/modules/' + parsed.path.rsplit('/', 1)[-1]
    name = Path(parsed.path).name
    digest = sha256(url.encode()).hexdigest()[:16]
    return '/assets/' + digest + '-' + name


def download(url):
    local = destination(url)
    target = ROOT / local.lstrip('/')
    if target.exists() and target.stat().st_size:
        return url, local
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_name(target.name + '.part')
    result = subprocess.run([
        'curl', '--fail', '--location', '--silent', '--show-error',
        '--connect-timeout', '15', '--max-time', '120', '--retry', '1',
        '--output', str(temporary), url,
    ], capture_output=True, text=True)
    if result.returncode or not temporary.exists() or not temporary.stat().st_size:
        raise RuntimeError(f'{url}: {result.stderr.strip() or "empty response"}')
    with temporary.open('rb') as stream:
        prefix = stream.read(100).lstrip().lower()
    if prefix.startswith((b'<!doctype html', b'<html')):
        raise RuntimeError(f'{url}: unexpected HTML response')
    temporary.replace(target)
    return url, local


def batch(pending):
    result, failures = {}, []
    with ThreadPoolExecutor(max_workers=6) as pool:
        work = {pool.submit(download, url): url for url in sorted(pending)}
        for index, task in enumerate(as_completed(work), 1):
            try:
                url, local = task.result()
                result[url] = local
            except Exception as error:
                failures.append(str(error))
                print('FAILED', error, flush=True)
            if index % 20 == 0 or index == len(work):
                print(f'Completed {index}/{len(work)} downloads', flush=True)
    if failures:
        raise RuntimeError('No source files rewritten. Retry to resume.\n' + '\n'.join(failures))
    return result


def main():
    pages = [ROOT / 'index.html', *sorted(ROOT.glob('*/index.html'))]
    mapping = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    visited = set()
    while True:
        sources = pages + sorted((ROOT / 'modules').rglob('*.mjs'))
        pending = set()
        origins = {local: remote for remote, local in mapping.items()}
        for source in sources:
            text = source.read_bytes().decode()
            pending.update(u for u in urls(text) if u.startswith(SITE))
            pending.update(re.findall(r'(?:from\s*|import\(\s*)["\'`](https://framerusercontent\.com/modules/[^"\'`]+)["\'`]', text))
            if source.suffix == '.mjs':
                base = origins.get('/' + source.relative_to(ROOT).as_posix(), SITE + source.name)
                pending.update(urljoin(base, ref) for ref in IMPORT.findall(text)
                               if not (source.parent / ref).exists())
        pending -= visited
        if not pending:
            break
        print(f'Module dependency batch: {len(pending)}', flush=True)
        mapping.update(batch(pending))
        visited.update(pending)

    sources = pages + sorted((ROOT / 'modules').rglob('*.mjs'))
    pending = set()
    for source in sources:
        for name in re.findall(r'iconSelection:`([A-Za-z]+)`', source.read_text()):
            pending.add(f'https://framer.com/m/phosphor-icons/{name}.js@0.0.57')
    for source in sources:
        # Font catalogs describe fonts not used by this site. Only vendor fonts
        # actually referenced by page CSS and components, not the whole catalog.
        if source.name.startswith(CATALOG):
            continue
        for url in urls(source.read_text()):
            parsed = urlsplit(url)
            if ((parsed.netloc == 'framerusercontent.com' and not parsed.path.endswith('/') and parsed.path.startswith(('/images/', '/assets/', '/third-party-assets/')))
                    or (parsed.netloc == 'fonts.gstatic.com' and parsed.path.endswith(('.woff2', '.woff', '.ttf')))
                    or url.startswith('https://cdn.jsdelivr.net/npm/p5@1.9.3/')):
                pending.add(url)
    print(f'Media/font dependencies: {len(pending)}', flush=True)
    mapping.update(batch(pending))
    # Some CDN variants return byte-identical files. Keep a single local copy;
    # this changes no pixels, frames, compression, or playback metadata.
    redirects, hashes, canonical = {}, {}, {}
    for local in sorted(set(mapping.values())):
        if not local.startswith('/assets/'):
            continue
        path = ROOT / local.lstrip('/')
        digest = sha256(path.read_bytes()).hexdigest()
        key = (digest, path.suffix)
        if key in canonical:
            redirects[local] = canonical[key]
        else:
            canonical[key] = local
            hashes[local] = digest
    mapping = {remote: redirects.get(local, local) for remote, local in mapping.items()}
    # Preserve responsive image selection when the runtime generates a srcset.
    # Local files cannot rely on Framer's query-string image transformation API.
    from urllib.parse import parse_qsl
    groups, members = {}, {}
    for remote, local in mapping.items():
        parsed = urlsplit(remote)
        if not parsed.path.startswith('/images/'):
            continue
        query = dict(parse_qsl(parsed.query))
        scale = query.pop('scale-down-to', 'original')
        key = (parsed.path, tuple(sorted(query.items())))
        groups.setdefault(key, {})[scale] = local
        members[local] = key
    variants = {local: groups[key] for local, key in members.items()}
    (ROOT / 'modules/local-image-variants.mjs').write_text(
        'const variants = ' + json.dumps(variants, separators=(',', ':')) + ';\n'
        'export function localImageVariant(source, scale) {\n'
        '  const choices = variants[source];\n'
        '  if (!choices) return undefined;\n'
        '  return choices[scale || "original"] || choices.original || source;\n'
        '}\n')
    MANIFEST.parent.mkdir(exist_ok=True)
    MANIFEST.write_text(json.dumps(dict(sorted(mapping.items())), indent=2) + '\n')

    # Longest first avoids replacing a base image URL inside its srcset variant.
    replacements = sorted(mapping.items(), key=lambda item: len(item[0]), reverse=True)
    for source in sources:
        if source.name.startswith(CATALOG):
            continue
        before = source.read_bytes().decode()
        after = before
        for remote, local in replacements:
            after = after.replace(remote, local).replace(remote.replace('&', '&amp;'), local)
        for old, new in redirects.items():
            after = after.replace(old, new)
        if source.suffix == '.html':
            after = re.sub(r'<script\b[^>]*src="https://events\.framer\.com/[^>]*></script>', '', after)
        if source.name == 'cRmGhNP0mvrHJ1ka19RtTsqnkk2uVbV0_ZD6cy9jVPM.36hf1So1.mjs':
            after = after.replace('import(`${Ze}${v}.js@0.0.57`)', 'import(`./icons/${v}.mjs`)')
        if source.name == 'framer.CdUewQ-m.mjs' and 'import{localImageVariant}' not in after:
            after = 'import{localImageVariant}from"./local-image-variants.mjs";' + after
            after = after.replace('function eo(e,t){try{', 'function eo(e,t){let local=localImageVariant(e,t);if(local)return local;try{')
            after = after.replace('let n=new URL(t.src);', 'let n=new URL(t.src,document.baseURI);')
            after = after.replace('try{new URL(e);let r=new Image;', 'try{new URL(e,document.baseURI);let r=new Image;')
        if after != before:
            source.write_bytes(after.encode())
    for duplicate in redirects:
        (ROOT / duplicate.lstrip('/')).unlink()
    (ROOT / 'assets/integrity.json').write_text(json.dumps(hashes, indent=2) + '\n')
    print(f'Localized {len(mapping)} dependencies. Animation code and media encoding preserved.', flush=True)


if __name__ == '__main__':
    main()
