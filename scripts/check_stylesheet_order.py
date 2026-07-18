from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import urlsplit

import yaml


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
SITE = ROOT / "site"
CONFIG = ROOT / "mkdocs.yml"
EXPECTED_STYLES = [
    "assets/styles/tokens.css?v=20260718-1",
    "assets/styles/themes/dark.css?v=20260718-1",
    "assets/styles/base.css?v=20260718-1",
    "assets/styles/pages/home.css?v=20260718-1",
    "assets/styles/components.css?v=20260718-1",
    "assets/styles/pages/notes.css?v=20260718-1",
    "assets/styles/pages/projects.css?v=20260718-1",
    "assets/styles/layout.css?v=20260718-1",
    "assets/styles/pages/chat.css?v=20260718-1",
    "assets/styles/pages/account.css?v=20260718-1",
    "assets/styles/motion.css?v=20260718-1",
    "assets/styles/themes/light.css?v=20260718-1",
    "assets/styles/responsive.css?v=20260718-1",
]
CSS_URL_RE = re.compile(r"url\(\s*([\"']?)([^\"')]+)\1\s*\)")


class StylesheetParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.hrefs: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag != "link":
            return
        values = dict(attrs)
        if "stylesheet" not in str(values.get("rel") or "").split():
            return
        href = values.get("href")
        if href:
            self.hrefs.append(href)


def asset_path(value: str) -> str:
    path = urlsplit(value).path.replace("\\", "/")
    marker = "assets/styles/"
    index = path.find(marker)
    return path[index:] if index >= 0 else ""


def fail(errors: list[str]) -> None:
    if errors:
        raise SystemExit("Stylesheet validation failed:\n- " + "\n- ".join(errors))


def main() -> None:
    errors: list[str] = []
    config = yaml.safe_load(CONFIG.read_text(encoding="utf-8")) or {}
    configured = config.get("extra_css") or []
    if configured != EXPECTED_STYLES:
        errors.append("mkdocs.yml extra_css does not match the reviewed fixed order")

    expected_paths = [asset_path(value) for value in EXPECTED_STYLES]
    for relative_path in expected_paths:
        source = DOCS / relative_path
        if not source.is_file():
            errors.append(f"missing source stylesheet: {relative_path}")
            continue
        css = source.read_text(encoding="utf-8")
        if "@import" in css:
            errors.append(f"deep CSS import is not allowed: {relative_path}")
        for match in CSS_URL_RE.finditer(css):
            value = match.group(2).strip()
            if value.startswith(("data:", "http:", "https:", "/", "#")):
                continue
            target = (source.parent / urlsplit(value).path).resolve()
            if not target.is_file():
                errors.append(
                    f"{relative_path} references a missing relative asset: {value}"
                )

    legacy = DOCS / "assets" / "styles" / "cyber.css"
    if legacy.exists():
        errors.append("legacy monolithic stylesheet still exists: assets/styles/cyber.css")

    checked_pages = 0
    for path in sorted(SITE.rglob("*.html")):
        parser = StylesheetParser()
        parser.feed(path.read_text(encoding="utf-8"))
        custom_styles = [asset_path(href) for href in parser.hrefs]
        custom_styles = [value for value in custom_styles if value]
        if not custom_styles:
            continue
        checked_pages += 1
        if custom_styles != expected_paths:
            relative = path.relative_to(SITE).as_posix()
            errors.append(f"{relative} does not load custom styles in the fixed order")

    if checked_pages < 80:
        errors.append(f"expected at least 80 generated pages with custom styles, found {checked_pages}")

    fail(errors)
    print(
        f"Stylesheet order validation passed for {len(expected_paths)} files "
        f"across {checked_pages} generated pages."
    )


if __name__ == "__main__":
    main()
