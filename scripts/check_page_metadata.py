from __future__ import annotations

from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
EXPECTED_ORIGIN = "https://www.biying.site"


class MetadataParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._inside_title = False
        self._title_parts: list[str] = []
        self.titles: list[str] = []
        self.descriptions: list[str] = []
        self.canonicals: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = {key.lower(): value or "" for key, value in attrs}
        if tag.lower() == "title":
            self._inside_title = True
            self._title_parts = []
        elif tag.lower() == "meta" and attributes.get("name", "").lower() == "description":
            self.descriptions.append(attributes.get("content", "").strip())
        elif tag.lower() == "link":
            rel = {part.lower() for part in attributes.get("rel", "").split()}
            if "canonical" in rel:
                self.canonicals.append(attributes.get("href", "").strip())

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title" and self._inside_title:
            self.titles.append("".join(self._title_parts).strip())
            self._inside_title = False
            self._title_parts = []

    def handle_data(self, data: str) -> None:
        if self._inside_title:
            self._title_parts.append(data)


def page_files() -> list[Path]:
    return sorted(
        path
        for path in SITE.rglob("*.html")
        if path.name != "404.html" and "overrides" not in path.parts
    )


def valid_canonical(value: str) -> bool:
    parsed = urlparse(value)
    return f"{parsed.scheme}://{parsed.netloc}" == EXPECTED_ORIGIN and bool(parsed.path)


def main() -> None:
    if not SITE.exists():
        raise SystemExit("site/ does not exist. Run the site build first.")

    failures: list[str] = []
    descriptions: dict[str, list[str]] = defaultdict(list)
    pages = page_files()

    for path in pages:
        parser = MetadataParser()
        parser.feed(path.read_text(encoding="utf-8", errors="replace"))
        label = str(path.relative_to(SITE)).replace("\\", "/")

        if len(parser.titles) != 1 or not parser.titles[0]:
            failures.append(f"{label}: expected exactly one non-empty <title>")
        if len(parser.descriptions) != 1 or not parser.descriptions[0]:
            failures.append(f"{label}: expected exactly one non-empty meta description")
        if len(parser.canonicals) != 1 or not valid_canonical(parser.canonicals[0]):
            failures.append(f"{label}: expected one canonical URL on {EXPECTED_ORIGIN}")

        if parser.descriptions and parser.descriptions[0]:
            descriptions[parser.descriptions[0]].append(label)

    if failures:
        print("Page metadata validation failed:")
        for failure in failures:
            print(f"- {failure}")
        raise SystemExit(1)

    duplicate_groups = [paths for paths in descriptions.values() if len(paths) > 1]
    duplicate_pages = sum(len(paths) for paths in duplicate_groups)
    print(
        f"Page metadata validation passed for {len(pages)} pages. "
        f"Duplicate-description baseline: {duplicate_pages} pages in {len(duplicate_groups)} groups."
    )


if __name__ == "__main__":
    main()
