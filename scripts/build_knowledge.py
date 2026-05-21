from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUTPUT = DOCS / "assets" / "knowledge" / "public-knowledge.json"
PAGE_TEXT_LIMIT = 4200
LONG_PAGE_THRESHOLD = 4200
CHUNK_TEXT_LIMIT = 3200
MIN_CHUNK_CHARS = 260
HEADING_RE = re.compile(r"^(#{2,4})\s+(.+?)\s*(?:\{\s*#[^}]+\})?\s*$")


def split_frontmatter(text: str) -> tuple[dict, str]:
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---", 4)
    if end == -1:
        return {}, text
    raw = text[4:end]
    body = text[end + 4 :].lstrip()
    data = yaml.safe_load(raw) or {}
    return data, body


def strip_markdown(text: str) -> str:
    text = re.sub(r"```.*?```", " ", text, flags=re.S)
    text = re.sub(r"\{\s*#[^}]+\}", " ", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"^#+\s*", "", text, flags=re.M)
    text = re.sub(r"[*_`>#-]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def clean_heading(value: str) -> str:
    value = re.sub(r"\s*\{\s*#[^}]+\}\s*$", "", value)
    return strip_markdown(value)


def page_url(path: Path) -> str:
    rel = path.relative_to(DOCS).with_suffix("")
    parts = list(rel.parts)
    if parts[-1] == "index":
        parts = parts[:-1]
    return "/" + "/".join(parts) + "/"


def locale_from_url(url: str) -> str:
    return "en" if url.startswith("/en/") else "zh"


def split_sections(body: str) -> list[tuple[str, str]]:
    sections: list[tuple[str, str]] = []
    current_title = ""
    current_lines: list[str] = []

    for line in body.splitlines():
        match = HEADING_RE.match(line)
        if match:
            if current_title and current_lines:
                sections.append((current_title, "\n".join(current_lines)))
            current_title = clean_heading(match.group(2))
            current_lines = [line]
        elif current_title:
            current_lines.append(line)

    if current_title and current_lines:
        sections.append((current_title, "\n".join(current_lines)))
    return sections


def chunk_text(text: str, size: int = CHUNK_TEXT_LIMIT) -> list[str]:
    return [text[index : index + size] for index in range(0, len(text), size)]


def build_item(
    *,
    title: str,
    summary: str,
    tags: list,
    url: str,
    source_path: str,
    text: str,
    kind: str,
    section: str = "",
    parent_title: str = "",
) -> dict:
    item = {
        "title": title,
        "summary": summary,
        "tags": tags,
        "url": url,
        "sourcePath": source_path,
        "locale": locale_from_url(url),
        "kind": kind,
        "text": text,
    }
    if section:
        item["section"] = section
    if parent_title:
        item["parentTitle"] = parent_title
    return item


def collect() -> list[dict]:
    items: list[dict] = []
    for path in sorted(DOCS.rglob("*.md")):
        if "assets" in path.parts or path.name == "index.md" and path.parent == DOCS:
            continue
        raw = path.read_text(encoding="utf-8")
        meta, body = split_frontmatter(raw)
        if meta.get("public") is not True or meta.get("avatar_readable") is not True:
            continue
        text = strip_markdown(body)
        summary = str(meta.get("summary") or text[:220])
        title = str(meta.get("title") or path.stem)
        tags = meta.get("tags") or []
        url = page_url(path)
        source_path = str(path.relative_to(ROOT)).replace("\\", "/")
        items.append(
            build_item(
                title=title,
                summary=summary,
                tags=tags,
                url=url,
                source_path=source_path,
                text=text[:PAGE_TEXT_LIMIT],
                kind="page",
            )
        )
        if len(text) <= LONG_PAGE_THRESHOLD:
            continue

        sections = split_sections(body)
        chunk_index = 1
        if sections:
            for section_title, section_body in sections:
                section_text = strip_markdown(section_body)
                if len(section_text) < MIN_CHUNK_CHARS:
                    continue
                for part in chunk_text(section_text):
                    chunk_title = f"{title} · {section_title}"
                    if len(section_text) > CHUNK_TEXT_LIMIT:
                        chunk_title = f"{chunk_title} #{chunk_index}"
                    items.append(
                        build_item(
                            title=chunk_title,
                            summary=part[:220],
                            tags=tags,
                            url=url,
                            source_path=source_path,
                            text=part,
                            kind="section",
                            section=section_title,
                            parent_title=title,
                        )
                    )
                    chunk_index += 1
        else:
            for part in chunk_text(text):
                if len(part) < MIN_CHUNK_CHARS:
                    continue
                items.append(
                    build_item(
                        title=f"{title} · part {chunk_index}",
                        summary=part[:220],
                        tags=tags,
                        url=url,
                        source_path=source_path,
                        text=part,
                        kind="section",
                        section=f"part {chunk_index}",
                        parent_title=title,
                    )
                )
                chunk_index += 1
    return items


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "items": collect(),
    }
    OUTPUT.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {OUTPUT.relative_to(ROOT)} with {len(payload['items'])} items.")


if __name__ == "__main__":
    main()
