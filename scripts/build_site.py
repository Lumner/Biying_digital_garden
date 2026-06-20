from __future__ import annotations

import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def run(*args: str) -> None:
    subprocess.run(args, cwd=ROOT, check=True)


def trim_shared_script_blank_lines() -> None:
    site = ROOT / "site"
    if not site.exists():
        return
    markers = (
        "dom-utils.js",
        "i18n.js",
        "api-client.js",
        "page-meta.js",
        "layout-controls.js",
        "reveal-on-scroll.js",
        "toast.js",
        "friend-links.js",
        "friend-links-v20260620.js",
    )
    for path in site.rglob("*.html"):
        with path.open("r", encoding="utf-8", newline="") as handle:
            original = handle.read()
        cleaned_parts: list[str] = []
        lines = original.splitlines(keepends=True)
        for index, line in enumerate(lines):
            if line.endswith("\r\n"):
                body, newline = line[:-2], "\r\n"
            elif line.endswith("\n") or line.endswith("\r"):
                body, newline = line[:-1], line[-1]
            else:
                body, newline = line, ""
            previous_line = lines[index - 1] if index > 0 else ""
            next_line = lines[index + 1] if index + 1 < len(lines) else ""
            near_shared_script = any(marker in previous_line or marker in next_line for marker in markers)
            if not body.strip() and near_shared_script:
                cleaned_parts.append(newline)
            else:
                cleaned_parts.append(line)
        cleaned = "".join(cleaned_parts)
        if cleaned != original:
            with path.open("w", encoding="utf-8", newline="") as handle:
                handle.write(cleaned)


def main() -> None:
    run(sys.executable, "scripts/build_note_catalog.py")
    run(sys.executable, "scripts/build_page_meta.py")
    run(sys.executable, "scripts/build_knowledge.py")
    run("mkdocs", "build", "--strict")
    trim_shared_script_blank_lines()
    run(sys.executable, "scripts/package_site.py")


if __name__ == "__main__":
    main()
