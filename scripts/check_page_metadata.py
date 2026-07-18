from __future__ import annotations

from collections import defaultdict
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.parse import unquote, urlparse

import yaml


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
SITE = ROOT / "site"
EXPECTED_ORIGIN = "https://www.biying.site"
DEFAULT_DESCRIPTION = "一个双语、赛博风格、可对话的个人数字网站。"
REQUIRED_HREFLANGS = {"zh-CN", "en", "x-default"}
REQUIRED_OG_PROPERTIES = {
    "og:title",
    "og:description",
    "og:type",
    "og:url",
    "og:site_name",
    "og:locale",
    "og:locale:alternate",
    "og:image",
    "og:image:width",
    "og:image:height",
    "og:image:alt",
}
REQUIRED_TWITTER_NAMES = {
    "twitter:card",
    "twitter:title",
    "twitter:description",
    "twitter:image",
    "twitter:image:alt",
}


class MetadataParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._inside_title = False
        self._title_parts: list[str] = []
        self.titles: list[str] = []
        self.descriptions: list[str] = []
        self.canonicals: list[str] = []
        self.alternates: dict[str, list[str]] = defaultdict(list)
        self.og: dict[str, list[str]] = defaultdict(list)
        self.twitter: dict[str, list[str]] = defaultdict(list)
        self.json_ld: list[str] = []
        self._inside_json_ld = False
        self._json_ld_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = {key.lower(): value or "" for key, value in attrs}
        if tag.lower() == "title":
            self._inside_title = True
            self._title_parts = []
        elif tag.lower() == "meta" and attributes.get("name", "").lower() == "description":
            self.descriptions.append(attributes.get("content", "").strip())
        elif tag.lower() == "meta" and attributes.get("property", "").lower().startswith("og:"):
            self.og[attributes.get("property", "").lower()].append(
                attributes.get("content", "").strip()
            )
        elif tag.lower() == "meta" and attributes.get("name", "").lower().startswith("twitter:"):
            self.twitter[attributes.get("name", "").lower()].append(
                attributes.get("content", "").strip()
            )
        elif tag.lower() == "link":
            rel = {part.lower() for part in attributes.get("rel", "").split()}
            if "canonical" in rel:
                self.canonicals.append(attributes.get("href", "").strip())
            if "alternate" in rel and attributes.get("hreflang"):
                self.alternates[attributes["hreflang"]].append(
                    attributes.get("href", "").strip()
                )
        elif tag.lower() == "script" and attributes.get("type", "").lower() == "application/ld+json":
            self._inside_json_ld = True
            self._json_ld_parts = []

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title" and self._inside_title:
            self.titles.append("".join(self._title_parts).strip())
            self._inside_title = False
            self._title_parts = []
        elif tag.lower() == "script" and self._inside_json_ld:
            self.json_ld.append("".join(self._json_ld_parts).strip())
            self._inside_json_ld = False
            self._json_ld_parts = []

    def handle_data(self, data: str) -> None:
        if self._inside_title:
            self._title_parts.append(data)
        elif self._inside_json_ld:
            self._json_ld_parts.append(data)


def page_files() -> list[Path]:
    return sorted(
        path
        for path in SITE.rglob("*.html")
        if path.name != "404.html" and "overrides" not in path.parts
    )


def valid_canonical(value: str) -> bool:
    parsed = urlparse(value)
    return f"{parsed.scheme}://{parsed.netloc}" == EXPECTED_ORIGIN and bool(parsed.path)


def route_for_page(path: Path) -> str:
    relative = path.relative_to(SITE).as_posix()
    if relative == "index.html":
        return "/"
    if relative.endswith("/index.html"):
        return "/" + relative[: -len("index.html")]
    return "/" + relative


def site_file_for_url(value: str) -> Path | None:
    parsed = urlparse(value)
    if f"{parsed.scheme}://{parsed.netloc}" != EXPECTED_ORIGIN:
        return None
    route = unquote(parsed.path)
    if route == "/":
        return SITE / "index.html"
    if route.endswith("/"):
        return SITE / route.strip("/") / "index.html"
    return SITE / route.strip("/")


def source_metadata_failures() -> list[str]:
    failures: list[str] = []
    for path in sorted(DOCS.rglob("*.md")):
        text = path.read_text(encoding="utf-8")
        if not text.startswith("---\n"):
            failures.append(f"{path.relative_to(ROOT)}: expected YAML frontmatter")
            continue
        end = text.find("\n---", 4)
        if end == -1:
            failures.append(f"{path.relative_to(ROOT)}: unterminated YAML frontmatter")
            continue
        meta = yaml.safe_load(text[4:end]) or {}
        description = str(meta.get("description") or "").strip()
        if not description:
            failures.append(f"{path.relative_to(ROOT)}: missing frontmatter description")
    return failures


def structured_types(blocks: list[str], label: str, failures: list[str]) -> set[str]:
    types: set[str] = set()
    if not blocks:
        failures.append(f"{label}: expected at least one JSON-LD block")
        return types
    for index, raw in enumerate(blocks, start=1):
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError as error:
            failures.append(f"{label}: JSON-LD block {index} is invalid: {error.msg}")
            continue
        if payload.get("@context") != "https://schema.org":
            failures.append(f"{label}: JSON-LD block {index} must use schema.org context")
        value = payload.get("@type")
        if isinstance(value, str):
            types.add(value)
        elif isinstance(value, list):
            types.update(str(item) for item in value)
    return types


def main() -> None:
    if not SITE.exists():
        raise SystemExit("site/ does not exist. Run the site build first.")

    failures = source_metadata_failures()
    descriptions: dict[str, list[str]] = defaultdict(list)
    titles: dict[str, list[str]] = defaultdict(list)
    pages = page_files()

    for path in pages:
        parser = MetadataParser()
        parser.feed(path.read_text(encoding="utf-8", errors="replace"))
        label = str(path.relative_to(SITE)).replace("\\", "/")
        route = route_for_page(path)
        expected_canonical = EXPECTED_ORIGIN + route

        if len(parser.titles) != 1 or not parser.titles[0]:
            failures.append(f"{label}: expected exactly one non-empty <title>")
        if len(parser.descriptions) != 1 or not parser.descriptions[0]:
            failures.append(f"{label}: expected exactly one non-empty meta description")
        if (
            len(parser.canonicals) != 1
            or not valid_canonical(parser.canonicals[0])
            or parser.canonicals[0] != expected_canonical
        ):
            failures.append(f"{label}: expected one canonical URL on {EXPECTED_ORIGIN}")

        if parser.titles and parser.titles[0]:
            titles[parser.titles[0]].append(label)
        if parser.descriptions and parser.descriptions[0]:
            descriptions[parser.descriptions[0]].append(label)
            if parser.descriptions[0] == DEFAULT_DESCRIPTION:
                failures.append(f"{label}: must not use the site-wide default description")

        if set(parser.alternates) != REQUIRED_HREFLANGS:
            failures.append(
                f"{label}: expected hreflang links for {sorted(REQUIRED_HREFLANGS)}"
            )
        for hreflang in REQUIRED_HREFLANGS:
            values = parser.alternates.get(hreflang, [])
            if len(values) != 1 or not values[0]:
                failures.append(f"{label}: expected exactly one {hreflang} alternate")
                continue
            target = site_file_for_url(values[0])
            if target is None or not target.is_file():
                failures.append(f"{label}: {hreflang} alternate is not a published page")
        if route.startswith("/zh/") and parser.alternates.get("zh-CN") != [expected_canonical]:
            failures.append(f"{label}: zh-CN alternate must be self-referential")
        if route.startswith("/en/") and parser.alternates.get("en") != [expected_canonical]:
            failures.append(f"{label}: en alternate must be self-referential")
        if parser.alternates.get("x-default") != [EXPECTED_ORIGIN + "/"]:
            failures.append(f"{label}: x-default must point to the root language entry")

        for property_name in REQUIRED_OG_PROPERTIES:
            values = parser.og.get(property_name, [])
            if len(values) != 1 or not values[0]:
                failures.append(f"{label}: expected one non-empty {property_name}")
        for name in REQUIRED_TWITTER_NAMES:
            values = parser.twitter.get(name, [])
            if len(values) != 1 or not values[0]:
                failures.append(f"{label}: expected one non-empty {name}")
        if parser.titles and parser.og.get("og:title") != parser.titles:
            failures.append(f"{label}: og:title must match the document title")
        if parser.descriptions and parser.og.get("og:description") != parser.descriptions:
            failures.append(f"{label}: og:description must match meta description")
        if parser.canonicals and parser.og.get("og:url") != parser.canonicals:
            failures.append(f"{label}: og:url must match canonical")
        if parser.og.get("og:image") != parser.twitter.get("twitter:image"):
            failures.append(f"{label}: OG and Twitter images must match")
        image_values = parser.og.get("og:image", [])
        if image_values:
            image_file = site_file_for_url(image_values[0])
            if image_file is None or not image_file.is_file():
                failures.append(f"{label}: social image is not published")

        types = structured_types(parser.json_ld, label, failures)
        if route in {"/", "/zh/", "/en/"} and "WebSite" not in types:
            failures.append(f"{label}: homepage must include WebSite JSON-LD")
        if route in {"/zh/", "/en/"} and "Person" not in types:
            failures.append(f"{label}: localized homepage must include Person JSON-LD")
        if "/projects/" in route and "CreativeWork" not in types:
            failures.append(f"{label}: project page must include CreativeWork JSON-LD")
        if "/notes/" in route and "TechArticle" not in types:
            failures.append(f"{label}: notes page must include TechArticle JSON-LD")
        if route not in {"/", "/zh/", "/en/"} and "BreadcrumbList" not in types:
            failures.append(f"{label}: non-home page must include BreadcrumbList JSON-LD")

    duplicate_title_groups = [paths for paths in titles.values() if len(paths) > 1]
    for paths in duplicate_title_groups:
        failures.append(f"duplicate <title>: {', '.join(paths)}")
    duplicate_description_groups = [
        paths for paths in descriptions.values() if len(paths) > 1
    ]
    for paths in duplicate_description_groups:
        failures.append(f"duplicate description: {', '.join(paths)}")

    if failures:
        print("Page metadata validation failed:")
        for failure in failures:
            print(f"- {failure}")
        raise SystemExit(1)

    print(
        f"Page metadata validation passed for {len(pages)} pages with unique titles, "
        "descriptions, bilingual alternates, social metadata, and valid JSON-LD."
    )


if __name__ == "__main__":
    main()
