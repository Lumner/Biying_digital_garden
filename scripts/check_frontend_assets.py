from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
SITE = ROOT / "site"
JAVASCRIPTS = DOCS / "assets" / "javascripts"
FRIEND_DATA = DOCS / "assets" / "data"


class ScriptParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.sources: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag != "script":
            return
        source = dict(attrs).get("src")
        if source:
            self.sources.append(source)


def asset_path(value: str) -> str:
    path = urlsplit(value).path.replace("\\", "/")
    marker = "assets/javascripts/"
    index = path.find(marker)
    return path[index:] if index >= 0 else ""


def fail(errors: list[str]) -> None:
    if errors:
        raise SystemExit("Frontend asset validation failed:\n- " + "\n- ".join(errors))


def main() -> None:
    errors: list[str] = []
    referenced: set[str] = set()
    checked_pages = 0

    for path in sorted(SITE.rglob("*.html")):
        parser = ScriptParser()
        parser.feed(path.read_text(encoding="utf-8"))
        sources = [asset_path(value) for value in parser.sources]
        sources = [value for value in sources if value]
        if not sources:
            continue
        checked_pages += 1
        referenced.update(sources)
        duplicates = sorted({value for value in sources if sources.count(value) > 1})
        if duplicates:
            relative = path.relative_to(SITE).as_posix()
            errors.append(f"{relative} loads duplicate scripts: {', '.join(duplicates)}")

    source_scripts = {
        f"assets/javascripts/{path.name}"
        for path in JAVASCRIPTS.glob("*.js")
        if path.is_file()
    }
    unreferenced = sorted(source_scripts - referenced)
    if unreferenced:
        errors.append(f"unreferenced first-party scripts: {', '.join(unreferenced)}")

    legacy_scripts = sorted(JAVASCRIPTS.glob("friend-links-v*.js"))
    if legacy_scripts:
        errors.append("dated friend-link script aliases still exist")
    legacy_data = sorted(FRIEND_DATA.glob("friend-links.*.json"))
    if legacy_data:
        errors.append("dated friend-link data aliases still exist")

    if checked_pages < 80:
        errors.append(f"expected at least 80 generated pages with scripts, found {checked_pages}")

    fail(errors)
    print(
        f"Frontend asset validation passed for {len(source_scripts)} first-party scripts "
        f"across {checked_pages} generated pages."
    )


if __name__ == "__main__":
    main()
