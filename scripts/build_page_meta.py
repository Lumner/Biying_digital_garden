from __future__ import annotations

import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUTPUT = DOCS / "assets" / "knowledge" / "page-meta.json"


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


def git_modified_date(path: Path) -> str:
    try:
        result = subprocess.run(
            ["git", "log", "-1", "--format=%cs", "--", str(path.relative_to(ROOT))],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
        )
    except OSError:
        return ""
    return result.stdout.strip()


def worktree_modified_date(path: Path) -> str:
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain", "--", str(path.relative_to(ROOT))],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
        )
    except OSError:
        return ""
    return datetime.now().date().isoformat() if result.stdout.strip() else ""


def newest_date(*values: object) -> str:
    dates = sorted(
        str(value).strip()
        for value in values
        if str(value or "").strip()
    )
    return dates[-1] if dates else ""


def page_locale(path: Path) -> str:
    rel = path.relative_to(DOCS)
    return rel.parts[0] if rel.parts and rel.parts[0] in {"zh", "en"} else ""


def collect() -> list[dict]:
    items: list[dict] = []
    for path in sorted(DOCS.rglob("*.md")):
        if "assets" in path.parts or path.name == "index.md" and path.parent == DOCS:
            continue
        meta, _ = split_frontmatter(path.read_text(encoding="utf-8"))
        if meta.get("public") is not True:
            continue
        updated = newest_date(meta.get("updated"), git_modified_date(path), worktree_modified_date(path))
        if not updated:
            continue
        items.append(
            {
                "title": str(meta.get("title") or path.stem),
                "url": page_url(path),
                "updated": updated,
                "locale": page_locale(path),
            }
        )
    return sorted(items, key=lambda item: (item["updated"], item["title"]), reverse=True)


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
