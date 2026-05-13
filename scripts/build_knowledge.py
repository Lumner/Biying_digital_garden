from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUTPUT = DOCS / "assets" / "knowledge" / "public-knowledge.json"


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
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"^#+\s*", "", text, flags=re.M)
    text = re.sub(r"[*_`>#-]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def page_url(path: Path) -> str:
    rel = path.relative_to(DOCS).with_suffix("")
    parts = list(rel.parts)
    if parts[-1] == "index":
        parts = parts[:-1]
    return "/" + "/".join(parts) + "/"


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
        items.append(
            {
                "title": meta.get("title") or path.stem,
                "summary": summary,
                "tags": meta.get("tags") or [],
                "url": page_url(path),
                "sourcePath": str(path.relative_to(ROOT)).replace("\\", "/"),
                "text": text[:4200],
            }
        )
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

