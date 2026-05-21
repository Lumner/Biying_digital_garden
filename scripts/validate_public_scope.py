from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
KNOWLEDGE = DOCS / "assets" / "knowledge" / "public-knowledge.json"

SENSITIVE_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("secret keyword", re.compile(r"\b(?:secret|password|passwd|private[_ -]?key)\b", re.IGNORECASE)),
    ("API key marker", re.compile(r"\b(?:api[_-]?key|access[_-]?key|secret[_-]?key)\s*[:=]|\b[A-Z0-9_]*(?:API|ACCESS|SECRET)_KEY\b", re.IGNORECASE)),
    ("token marker", re.compile(r"\b(?:api|access|auth|secret|session|refresh)[_-]?token\b|\btoken\s*[:=]", re.IGNORECASE)),
    ("environment file", re.compile(r"(?<![\w.-])\.env(?:\.[\w.-]+)?\b", re.IGNORECASE)),
    ("credential assignment", re.compile(r"\b(?:DEEPSEEK|OPENAI|EDGEONE|BIYING)_[A-Z0-9_]*\s*=", re.IGNORECASE)),
    ("GitHub token", re.compile(r"\bgh[pousr]_[A-Za-z0-9_]{20,}\b")),
    ("email address", re.compile(r"(?<![\w.+-])[\w.+-]+@[\w-]+(?:\.[\w-]+)+(?![\w.-])")),
    ("mainland China phone number", re.compile(r"(?<!\d)(?:\+?86[-\s]?)?1[3-9]\d{9}(?!\d)")),
    ("QQ contact", re.compile(r"\bqq\s*[:：]?\s*[1-9]\d{4,11}\b", re.IGNORECASE)),
    ("WeChat contact", re.compile(r"\b(?:wechat|weixin|wx)\s*[:：]?\s*[A-Za-z][-_A-Za-z0-9]{5,19}\b|微信\s*[:：]?\s*[A-Za-z][-_A-Za-z0-9]{5,19}", re.IGNORECASE)),
]


def check_text(label: str, text: str, failures: list[str]) -> None:
    for name, pattern in SENSITIVE_PATTERNS:
        match = pattern.search(text)
        if match:
            snippet = match.group(0).replace("\n", " ")[:80]
            failures.append(f"{label} matches {name}: {snippet!r}")


def main() -> None:
    failures: list[str] = []
    for path in DOCS.rglob("*.md"):
        text = path.read_text(encoding="utf-8", errors="ignore")
        if "avatar_readable: true" not in text:
            continue
        check_text(str(path.relative_to(ROOT)), text, failures)

    if KNOWLEDGE.exists():
        try:
            data = json.loads(KNOWLEDGE.read_text(encoding="utf-8"))
        except json.JSONDecodeError as error:
            failures.append(f"{KNOWLEDGE.relative_to(ROOT)} is not valid JSON: {error}")
            data = {}
        for index, item in enumerate(data.get("items", []), start=1):
            label = f"{KNOWLEDGE.relative_to(ROOT)} item {index} ({item.get('url', 'no-url')})"
            text = "\n".join(str(item.get(key, "")) for key in ("title", "summary", "text"))
            check_text(label, text, failures)

    if failures:
        print("Potential public-scope issues:")
        for failure in failures:
            print(f"- {failure}")
        raise SystemExit(1)
    print("Public-scope validation passed.")


if __name__ == "__main__":
    main()
