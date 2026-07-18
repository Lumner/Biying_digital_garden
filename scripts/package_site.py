from __future__ import annotations

import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SITE_DIR = ROOT / "site"
EDGE_FUNCTIONS_DIR = ROOT / "edge-functions"
SITE_EDGE_FUNCTIONS_DIR = SITE_DIR / "edge-functions"
LEGACY_PUBLISHED_ASSETS = (
    "assets/images/home-hero-light.png",
    "assets/images/home-hero-light-20260622.png",
    "assets/images/home-hero-light-20260622-large.png",
    "assets/images/home-hero-rain.png",
    "assets/javascripts/lunr/wordcut.js",
    "assets/vendor/mathjax/es5/tex-mml-chtml.js",
)


def prune_legacy_published_assets() -> None:
    removed = 0
    for relative_path in LEGACY_PUBLISHED_ASSETS:
        target = SITE_DIR / relative_path
        if target.exists():
            target.unlink()
            removed += 1
    if removed:
        print(f"Pruned {removed} legacy published asset(s).")


def prune_source_maps() -> None:
    source_maps = list(SITE_DIR.rglob("*.map"))
    for path in source_maps:
        path.unlink()
    if source_maps:
        print(f"Pruned {len(source_maps)} source map file(s).")


def main() -> None:
    if not SITE_DIR.exists():
        raise SystemExit("site/ does not exist. Run mkdocs build first.")

    if SITE_EDGE_FUNCTIONS_DIR.exists():
        shutil.rmtree(SITE_EDGE_FUNCTIONS_DIR)

    shutil.copytree(EDGE_FUNCTIONS_DIR, SITE_EDGE_FUNCTIONS_DIR)
    shutil.copy2(ROOT / "package.json", SITE_DIR / "package.json")
    prune_legacy_published_assets()
    prune_source_maps()
    print("Packaged edge-functions/ and package.json into site/.")


if __name__ == "__main__":
    main()
