from __future__ import annotations

import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GENERATED_PATHS = ("docs/assets/knowledge", "site")


def main() -> None:
    result = subprocess.run(
        ["git", "status", "--porcelain", "--", *GENERATED_PATHS],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    output = result.stdout.strip()
    if output:
        print("Generated files are not in sync with the committed sources:")
        print(output)
        print("\nRun `python scripts/build_site.py` and commit the generated changes.")
        raise SystemExit(1)
    print("Generated site files are in sync.")


if __name__ == "__main__":
    main()
