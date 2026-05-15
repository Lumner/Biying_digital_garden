from __future__ import annotations

import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SITE_DIR = ROOT / "site"
EDGE_FUNCTIONS_DIR = ROOT / "edge-functions"
SITE_EDGE_FUNCTIONS_DIR = SITE_DIR / "edge-functions"


def main() -> None:
    if not SITE_DIR.exists():
        raise SystemExit("site/ does not exist. Run mkdocs build first.")

    if SITE_EDGE_FUNCTIONS_DIR.exists():
        shutil.rmtree(SITE_EDGE_FUNCTIONS_DIR)

    shutil.copytree(EDGE_FUNCTIONS_DIR, SITE_EDGE_FUNCTIONS_DIR)
    shutil.copy2(ROOT / "package.json", SITE_DIR / "package.json")
    print("Packaged edge-functions/ and package.json into site/.")


if __name__ == "__main__":
    main()
