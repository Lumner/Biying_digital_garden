from __future__ import annotations

import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOTS = (
    ROOT / "docs" / "assets" / "javascripts",
    ROOT / "edge-functions" / "api",
    ROOT / "tests",
)
EXTRA_FILES = (ROOT / "playwright.config.js",)


def javascript_files() -> list[Path]:
    paths: set[Path] = set()
    for source_root in SOURCE_ROOTS:
        if source_root.exists():
            paths.update(source_root.rglob("*.js"))
    paths.update(path for path in EXTRA_FILES if path.exists())
    return sorted(paths)


def main() -> None:
    node = shutil.which("node")
    if not node:
        raise SystemExit("Node.js is required for JavaScript syntax checks.")

    failures: list[str] = []
    paths = javascript_files()
    for path in paths:
        result = subprocess.run(
            [node, "--check", str(path)],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )
        if result.returncode:
            detail = (result.stderr or result.stdout).strip()
            failures.append(f"{path.relative_to(ROOT)}\n{detail}")

    if failures:
        print("JavaScript syntax errors:")
        for failure in failures:
            print(f"\n{failure}")
        raise SystemExit(1)

    print(f"JavaScript syntax check passed for {len(paths)} files.")


if __name__ == "__main__":
    main()
