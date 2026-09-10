"""Serve the local portfolio without caching edited HTML, scripts, or artwork."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    handler = partial(PreviewHandler, directory=str(root))
    with ThreadingHTTPServer(("127.0.0.1", 8080), handler) as server:
        print("Portfolio preview: http://127.0.0.1:8080/ (cache disabled)", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
