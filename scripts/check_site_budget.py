from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
BUDGET_PATH = ROOT / ".quality" / "site-budget.json"
RASTER_EXTENSIONS = {".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"}


def human_bytes(value: int) -> str:
    units = ("B", "KiB", "MiB", "GiB")
    amount = float(value)
    for unit in units:
        if amount < 1024 or unit == units[-1]:
            return f"{amount:.2f} {unit}"
        amount /= 1024
    return f"{value} B"


def main() -> None:
    if not SITE.exists():
        raise SystemExit("site/ does not exist. Run the site build first.")
    if not BUDGET_PATH.exists():
        raise SystemExit(f"Missing budget file: {BUDGET_PATH.relative_to(ROOT)}")

    budget = json.loads(BUDGET_PATH.read_text(encoding="utf-8"))
    files = sorted(path for path in SITE.rglob("*") if path.is_file())
    sizes = {path: path.stat().st_size for path in files}
    total = sum(sizes.values())
    raster = sum(size for path, size in sizes.items() if path.suffix.lower() in RASTER_EXTENSIONS)
    largest_path, largest_size = max(sizes.items(), key=lambda item: item[1])
    favicon_sizes = [
        size
        for path, size in sizes.items()
        if "favicon" in path.name.lower()
    ]
    largest_favicon = max(favicon_sizes, default=0)
    source_maps = [path for path in files if path.suffix.lower() == ".map"]

    by_extension: dict[str, int] = defaultdict(int)
    for path, size in sizes.items():
        by_extension[path.suffix.lower() or "[no extension]"] += size

    failures: list[str] = []
    checks = (
        ("total output", total, int(budget["maxTotalBytes"])),
        ("raster images", raster, int(budget["maxRasterBytes"])),
        ("largest asset", largest_size, int(budget["maxSingleAssetBytes"])),
        ("largest favicon", largest_favicon, int(budget["maxFaviconBytes"])),
    )
    for label, actual, maximum in checks:
        if actual > maximum:
            failures.append(f"{label}: {human_bytes(actual)} exceeds {human_bytes(maximum)}")

    if not budget.get("allowSourceMaps", False) and source_maps:
        failures.append(f"source maps are disallowed but {len(source_maps)} were packaged")

    print(f"Site files: {len(files)}")
    print(f"Total: {human_bytes(total)}")
    print(f"Raster images: {human_bytes(raster)}")
    print(
        "Largest asset: "
        f"{largest_path.relative_to(SITE).as_posix()} ({human_bytes(largest_size)})"
    )
    print(f"Largest favicon: {human_bytes(largest_favicon)}")
    print("Largest extensions:")
    for extension, size in sorted(by_extension.items(), key=lambda item: item[1], reverse=True)[:10]:
        print(f"- {extension}: {human_bytes(size)}")
    print("Largest files:")
    for path, size in sorted(sizes.items(), key=lambda item: item[1], reverse=True)[:10]:
        print(f"- {path.relative_to(SITE).as_posix()}: {human_bytes(size)}")

    if failures:
        print("Site budget failed:")
        for failure in failures:
            print(f"- {failure}")
        raise SystemExit(1)

    print("Site budget passed.")


if __name__ == "__main__":
    main()
