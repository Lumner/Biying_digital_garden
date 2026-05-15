from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUTPUT = DOCS / "assets" / "knowledge" / "note-catalog.json"
HELPER_SLUGS = {"math", "systems", "algorithms", "ai", "essays", "site", "tags"}

CATEGORIES = {
    "zh": [
        {"key": "math", "label": "数学", "description": "逻辑、证明、计数和公式。"},
        {"key": "systems", "label": "系统", "description": "从信息表示到 ISA 的系统脉络。"},
        {"key": "algorithms", "label": "算法", "description": "数据结构、复杂度与算法取舍。"},
        {"key": "ai", "label": "AI", "description": "以后放模型、智能体与实验记录。"},
        {"key": "essays", "label": "随笔", "description": "想法、复盘和更轻的记录。"},
        {"key": "site", "label": "站点", "description": "这个网站自己的说明与实验。"},
    ],
    "en": [
        {"key": "math", "label": "Math", "description": "Logic, proofs, counting, and formulas."},
        {"key": "systems", "label": "Systems", "description": "From representation to ISA."},
        {"key": "algorithms", "label": "Algorithms", "description": "Structures, complexity, and tradeoffs."},
        {"key": "ai", "label": "AI", "description": "Future notes on models, agents, and experiments."},
        {"key": "essays", "label": "Essays", "description": "Lighter reflections and records."},
        {"key": "site", "label": "Site", "description": "Notes about this website itself."},
    ],
}


def split_frontmatter(text: str) -> tuple[dict, str]:
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---", 4)
    if end == -1:
        return {}, text
    raw = text[4:end]
    body = text[end + 4 :].lstrip()
    return yaml.safe_load(raw) or {}, body


def page_url(path: Path) -> str:
    rel = path.relative_to(DOCS).with_suffix("")
    parts = list(rel.parts)
    if parts[-1] == "index":
        parts = parts[:-1]
    return "/" + "/".join(parts) + "/"


def chapter_count(body: str) -> int:
    return len(re.findall(r"^##\s+", body, flags=re.M))


def collect_locale(locale: str) -> list[dict]:
    notes_dir = DOCS / locale / "notes"
    items: list[dict] = []
    for path in sorted(notes_dir.glob("*.md")):
        if path.stem in HELPER_SLUGS or path.name == "index.md":
            continue
        meta, body = split_frontmatter(path.read_text(encoding="utf-8"))
        if meta.get("public") is not True:
            continue
        items.append(
            {
                "title": meta.get("title") or path.stem,
                "summary": meta.get("summary") or "",
                "url": page_url(path),
                "category": meta.get("category") or "site",
                "tags": meta.get("tags") or [],
                "updated": str(meta.get("updated") or ""),
                "recommended": bool(meta.get("recommended")),
                "readingOrder": int(meta.get("reading_order") or 999),
                "chapterCount": chapter_count(body),
            }
        )
    return items


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "categories": CATEGORIES,
        "items": {
            "zh": collect_locale("zh"),
            "en": collect_locale("en"),
        },
    }
    OUTPUT.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {OUTPUT.relative_to(ROOT)}.")


if __name__ == "__main__":
    main()
