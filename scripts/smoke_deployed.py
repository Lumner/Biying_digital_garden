from __future__ import annotations

import argparse
from dataclasses import dataclass
import json
import sys
from typing import Callable
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen


MAX_RESPONSE_BYTES = 2 * 1024 * 1024
CANONICAL_ORIGIN = "https://www.biying.site"
PAGE_PATHS = (
    "/",
    "/zh/",
    "/en/",
    "/zh/notes/",
    "/zh/projects/",
    "/zh/avatar/",
    "/zh/register/",
)


@dataclass(frozen=True)
class ResponseSnapshot:
    status: int
    content_type: str
    headers: dict[str, str]
    body: bytes
    final_url: str


@dataclass(frozen=True)
class StaticCheck:
    path: str
    content_type: str
    marker: bytes
    minimum_bytes: int = 1


STATIC_CHECKS = (
    StaticCheck(
        "/assets/styles/tokens.css",
        "text/css",
        b":root",
    ),
    StaticCheck(
        "/assets/javascripts/dom-utils.js",
        "javascript",
        b"window.BiyingDom",
    ),
    StaticCheck(
        "/assets/images/home-hero-rain-960.webp",
        "image/webp",
        b"RIFF",
        minimum_bytes=1_000,
    ),
    StaticCheck(
        "/assets/images/favicon.svg",
        "image/svg+xml",
        b"<svg",
    ),
)


def normalize_base_url(value: str) -> str:
    parsed = urlparse(value)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("base URL must be an absolute http(s) URL")
    return f"{parsed.scheme}://{parsed.netloc}/"


def fetch(base_url: str, path: str, timeout: float) -> ResponseSnapshot:
    url = urljoin(base_url, path.lstrip("/"))
    request = Request(
        url,
        method="GET",
        headers={
            "Accept": "*/*",
            "User-Agent": "BiyingDeploymentSmoke/1.0",
        },
    )
    try:
        response = urlopen(request, timeout=timeout)
    except HTTPError as error:
        response = error
    with response:
        body = response.read(MAX_RESPONSE_BYTES + 1)
        if len(body) > MAX_RESPONSE_BYTES:
            raise ValueError(f"{path} exceeded the {MAX_RESPONSE_BYTES}-byte smoke limit")
        return ResponseSnapshot(
            status=int(response.status),
            content_type=response.headers.get_content_type(),
            headers={key.lower(): value for key, value in response.headers.items()},
            body=body,
            final_url=response.geturl(),
        )


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def check_same_origin(base_url: str, response: ResponseSnapshot, path: str) -> None:
    base = urlparse(base_url)
    final = urlparse(response.final_url)
    require(
        (final.scheme.lower(), final.netloc.lower())
        == (base.scheme.lower(), base.netloc.lower()),
        f"{path} redirected outside the deployment origin: {response.final_url}",
    )


def check_page(base_url: str, path: str, timeout: float) -> None:
    response = fetch(base_url, path, timeout)
    check_same_origin(base_url, response, path)
    require(response.status == 200, f"{path} returned HTTP {response.status}")
    require(response.content_type == "text/html", f"{path} is not HTML")
    require(b"<html" in response.body.lower(), f"{path} has no HTML document")
    require(b"internal server error" not in response.body.lower(), f"{path} contains a server error")
    canonical = f'<link rel="canonical" href="{CANONICAL_ORIGIN}{path}">'.encode()
    require(canonical in response.body, f"{path} canonical URL is missing or incorrect")

    if path == "/":
        require(b"language-gateway" in response.body, "root language gateway is missing")
    elif path == "/zh/":
        require(b'data-biying-lang="zh"' in response.body, "Chinese locale marker is missing")
        require(b"assets/styles/tokens.css?v=20260718-1" in response.body, "phase 8 CSS is missing")
        require(b"assets/javascripts/dom-utils.js?v=20260718-1" in response.body, "phase 8 JS is missing")
        require(b"assets/styles/cyber.css" not in response.body, "legacy cyber.css is still published")
    elif path == "/en/":
        require(b'data-biying-lang="en"' in response.body, "English locale marker is missing")


def check_static(base_url: str, check: StaticCheck, timeout: float) -> None:
    response = fetch(base_url, check.path, timeout)
    check_same_origin(base_url, response, check.path)
    require(response.status == 200, f"{check.path} returned HTTP {response.status}")
    require(
        check.content_type in response.content_type,
        f"{check.path} has unexpected content type {response.content_type}",
    )
    require(len(response.body) >= check.minimum_bytes, f"{check.path} is unexpectedly small")
    require(check.marker in response.body, f"{check.path} is missing its expected marker")


def json_payload(response: ResponseSnapshot, path: str) -> dict:
    require(response.content_type == "application/json", f"{path} is not JSON")
    try:
        payload = json.loads(response.body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise AssertionError(f"{path} returned invalid JSON: {error}") from error
    require(isinstance(payload, dict), f"{path} JSON must be an object")
    return payload


def check_stats(base_url: str, timeout: float) -> None:
    path = "/api/stats"
    response = fetch(base_url, path, timeout)
    check_same_origin(base_url, response, path)
    require(response.status == 200, f"{path} returned HTTP {response.status}")
    require(response.headers.get("cache-control") == "no-store", f"{path} must disable caching")
    payload = json_payload(response, path)
    require(payload.get("available") is True, f"{path} reports that production KV is unavailable")
    for key in ("pageViews", "totalVisitors"):
        value = payload.get(key)
        require(
            not isinstance(value, bool)
            and isinstance(value, (int, float))
            and value >= 0,
            f"{path} has invalid {key}",
        )


def check_unauthenticated_auth(base_url: str, timeout: float) -> None:
    path = "/api/auth"
    response = fetch(base_url, path, timeout)
    check_same_origin(base_url, response, path)
    require(response.status == 401, f"{path} returned HTTP {response.status}, expected 401")
    payload = json_payload(response, path)
    require("user" in payload and payload["user"] is None, f"{path} did not return user: null")


def run_checks(
    base_url: str,
    timeout: float,
    output: Callable[[str], None] = print,
) -> None:
    checks: list[tuple[str, Callable[[], None]]] = []
    checks.extend(
        (path, lambda path=path: check_page(base_url, path, timeout))
        for path in PAGE_PATHS
    )
    checks.extend(
        (check.path, lambda check=check: check_static(base_url, check, timeout))
        for check in STATIC_CHECKS
    )
    checks.extend(
        (
            ("/api/stats", lambda: check_stats(base_url, timeout)),
            ("/api/auth", lambda: check_unauthenticated_auth(base_url, timeout)),
        )
    )

    failures: list[str] = []
    for label, check in checks:
        try:
            check()
        except (AssertionError, OSError, URLError, ValueError) as error:
            failures.append(f"{label}: {error}")
            output(f"[FAIL] {label}: {error}")
        else:
            output(f"[PASS] {label}")

    if failures:
        raise RuntimeError(
            f"Deployment smoke failed: {len(failures)} of {len(checks)} checks failed."
        )
    output(f"Deployment smoke passed: {len(checks)} read-only checks.")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run read-only smoke checks against a deployed site.")
    parser.add_argument("--base-url", required=True, help="Deployment origin, for example https://www.biying.site")
    parser.add_argument("--timeout", type=float, default=15.0, help="Per-request timeout in seconds")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    try:
        base_url = normalize_base_url(args.base_url)
        run_checks(base_url, args.timeout)
    except (AssertionError, RuntimeError, URLError, ValueError) as error:
        print(error, file=sys.stderr)
        raise SystemExit(1) from error


if __name__ == "__main__":
    main()
