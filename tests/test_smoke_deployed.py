from __future__ import annotations

from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import sys
import threading
import unittest


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts.smoke_deployed import (  # noqa: E402
    ResponseSnapshot,
    check_same_origin,
    check_stats,
    run_checks,
)


class SmokeHandler(BaseHTTPRequestHandler):
    methods: list[str] = []
    page_views: int | bool = 12

    def do_GET(self) -> None:
        type(self).methods.append(self.command)
        path = self.path.split("?", 1)[0]
        if path == "/api/stats":
            return self.respond_json(
                200,
                {
                    "available": True,
                    "pageViews": type(self).page_views,
                    "totalVisitors": 4,
                    "updatedAt": "2026-07-18T00:00:00.000Z",
                },
                {"Cache-Control": "no-store"},
            )
        if path == "/api/auth":
            return self.respond_json(401, {"user": None})

        static = {
            "/assets/styles/tokens.css": ("text/css", b":root { --test: 1; }"),
            "/assets/javascripts/dom-utils.js": (
                "text/javascript",
                b"window.BiyingDom = {};",
            ),
            "/assets/images/home-hero-rain-960.webp": (
                "image/webp",
                b"RIFF" + b"x" * 1_100,
            ),
            "/assets/images/favicon.svg": (
                "image/svg+xml",
                b'<svg xmlns="http://www.w3.org/2000/svg"></svg>',
            ),
        }
        if path in static:
            content_type, body = static[path]
            return self.respond(200, content_type, body)

        locale = "en" if path == "/en/" else "zh"
        canonical = f'<link rel="canonical" href="https://www.biying.site{path}">'
        if path == "/":
            body = (
                f"<html>{canonical}<div class=\"language-gateway\"></div></html>"
            ).encode()
        else:
            body = (
                f'<html data-biying-lang="{locale}">'
                f"{canonical}"
                '<link href="assets/styles/tokens.css?v=20260718-1">'
                '<script src="assets/javascripts/dom-utils.js?v=20260718-1"></script>'
                "</html>"
            ).encode()
        return self.respond(200, "text/html", body)

    def do_POST(self) -> None:
        type(self).methods.append(self.command)
        self.respond(500, "text/plain", b"write method used")

    def respond_json(
        self,
        status: int,
        payload: dict,
        extra_headers: dict[str, str] | None = None,
    ) -> None:
        self.respond(
            status,
            "application/json",
            json.dumps(payload).encode(),
            extra_headers,
        )

    def respond(
        self,
        status: int,
        content_type: str,
        body: bytes,
        extra_headers: dict[str, str] | None = None,
    ) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        for key, value in (extra_headers or {}).items():
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: object) -> None:
        return


class DeploymentSmokeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        SmokeHandler.methods = []
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), SmokeHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.server.server_port}"

    @classmethod
    def tearDownClass(cls) -> None:
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=5)

    def test_smoke_contract_is_read_only(self) -> None:
        output: list[str] = []
        run_checks(self.base_url, timeout=2, output=output.append)
        self.assertEqual(set(SmokeHandler.methods), {"GET"})
        self.assertIn("Deployment smoke passed: 13 read-only checks.", output)

    def test_same_origin_rejects_scheme_downgrade(self) -> None:
        response = ResponseSnapshot(
            status=200,
            content_type="text/html",
            headers={},
            body=b"",
            final_url="http://www.biying.site/zh/",
        )
        with self.assertRaisesRegex(AssertionError, "redirected outside"):
            check_same_origin("https://www.biying.site/", response, "/zh/")

    def test_stats_rejects_boolean_counts(self) -> None:
        SmokeHandler.page_views = True
        try:
            with self.assertRaisesRegex(AssertionError, "invalid pageViews"):
                check_stats(self.base_url, timeout=2)
        finally:
            SmokeHandler.page_views = 12


if __name__ == "__main__":
    unittest.main()
