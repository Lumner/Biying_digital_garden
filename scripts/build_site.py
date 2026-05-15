from __future__ import annotations

import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def run(*args: str) -> None:
    subprocess.run(args, cwd=ROOT, check=True)


def main() -> None:
    run(sys.executable, "scripts/build_note_catalog.py")
    run(sys.executable, "scripts/build_knowledge.py")
    run("mkdocs", "build", "--strict")
    run(sys.executable, "scripts/package_site.py")


if __name__ == "__main__":
    main()
