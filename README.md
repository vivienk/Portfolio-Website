# Vivien Kong Portfolio — Independent Snapshot

Exact published-code snapshot of [vivienkong.com](https://vivienkong.com), prepared for independent deployment on Vercel.

## Included routes

- /
- /journify
- /tomo_onboarding
- /preci
- /tomoiq
- /immersive_ink
- /footprints
- /wokwalk

Each route contains its captured HTML, inline CSS, responsive rules, and hydration configuration. Images (including animated GIFs), videos, fonts, p5.js 1.9.3, icons, and the page modules are served from this repository. There are no route rewrites or proxies to the live Framer site.

The existing Framer/React/Motion runtime is retained locally to preserve the design and animation behavior. This is an independently hosted snapshot, not a rewrite without Framer code. Entrance effects, easing, timing, canvas drawing, GIF encoding, and video playback settings have not been changed. Framer's analytics loader has been removed.

`assets/manifest.json` records the original URL for each local dependency. `assets/integrity.json` contains SHA-256 checksums of the downloaded media. Byte-identical media variants share a local file. `modules/local-image-variants.mjs` resolves responsive image variants locally; a size not captured in the snapshot falls back to the original local image.

External links and embedded services such as Figma and YouTube still require those services. Optional Framer editor support, unused font catalogs, and the legacy CMS collection retain upstream references. Ordinary page assets are local; this is not a guarantee that every optional runtime feature works offline.

## Preview and maintenance

Run `python3 scripts/serve.py` (disables browser caching during local edits) and open `http://127.0.0.1:8080/`.

`python3 scripts/localize_assets.py` resumes missing dependency downloads and rewrites references only after the downloads succeed. It does not re-encode media. The original media is large, so making it local removes CDN dependencies but does not remove its transfer or decoding costs.

Source comparisons verify that layout and animation code have been preserved apart from asset references and image URL handling. Browser-based visual and interaction comparisons are still needed before claiming an exact rendered match.

## Deploy

Import this repository into Vercel with Framework Preset set to **Other** and no build command.

## TomoIQ content refresh

The TomoIQ page was refreshed from https://vivienkong.com/tomoiq on September 10, 2026, including all published text, responsive layouts, media, and interactive components. Its updated runtime is isolated in `modules/tomoiq-live/` to preserve the customized homepage and other case studies. `modules/tomoiq-navigation.mjs` performs full navigation when entering or leaving this runtime boundary.
