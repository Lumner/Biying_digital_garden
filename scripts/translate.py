from __future__ import annotations

import argparse
import os
import re
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"


def protect_blocks(text: str) -> tuple[str, dict[str, str]]:
    protected: dict[str, str] = {}

    def replace(match: re.Match[str]) -> str:
        key = f"__PROTECTED_BLOCK_{len(protected)}__"
        protected[key] = match.group(0)
        return key

    pattern = r"```.*?```|\$\$.*?\$\$"
    return re.sub(pattern, replace, text, flags=re.S), protected


def restore_blocks(text: str, protected: dict[str, str]) -> str:
    for key, value in protected.items():
        text = text.replace(key, value)
    return text


def call_openai_compatible(prompt: str) -> str:
    api_key = os.getenv("DEEPSEEK_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("Set DEEPSEEK_API_KEY or OPENAI_API_KEY first.")
    base_url = os.getenv("AI_BASE_URL", "https://api.deepseek.com")
    model = os.getenv("AI_TRANSLATE_MODEL", os.getenv("DEEPSEEK_MODEL", "deepseek-chat"))
    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "Translate Markdown from Chinese to natural English. Preserve frontmatter keys, code blocks, paths, commands, LaTeX, and protected placeholders exactly.",
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
    }
    request = urllib.request.Request(
        f"{base_url.rstrip('/')}/v1/chat/completions",
        data=__import__("json").dumps(payload).encode("utf-8"),
        headers={
            "content-type": "application/json",
            "authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            data = __import__("json").loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        raise RuntimeError(error.read().decode("utf-8")) from error
    return data["choices"][0]["message"]["content"].strip()


def translate_file(source: Path, overwrite: bool) -> Path:
    rel = source.relative_to(DOCS / "zh")
    target = DOCS / "en" / rel
    if target.exists() and not overwrite:
        print(f"Skip existing {target.relative_to(ROOT)}")
        return target
    protected_text, protected = protect_blocks(source.read_text(encoding="utf-8"))
    translated = call_openai_compatible(protected_text)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(restore_blocks(translated, protected) + "\n", encoding="utf-8")
    print(f"Wrote {target.relative_to(ROOT)}")
    return target


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", help="A zh Markdown file under docs/zh")
    parser.add_argument("--all", action="store_true", help="Translate all zh Markdown files")
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()

    if args.file:
      translate_file((ROOT / args.file).resolve(), args.overwrite)
      return

    if args.all:
        for source in sorted((DOCS / "zh").rglob("*.md")):
            translate_file(source, args.overwrite)
        return

    parser.error("Use --file docs/zh/path.md or --all")


if __name__ == "__main__":
    main()

