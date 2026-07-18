from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
NPM = "npm.cmd" if os.name == "nt" else "npm"


def run(label: str, *args: str) -> None:
    print(f"\n[verify] {label}")
    subprocess.run(args, cwd=ROOT, check=True)


def verify_quick() -> None:
    run("JavaScript syntax", NPM, "run", "check:js")
    run("API unit tests", NPM, "run", "test:api")
    run("Public content boundary", sys.executable, "scripts/validate_public_scope.py")
    run("Mobile browser regression", NPM, "run", "test:mobile")


def verify_full() -> None:
    run("Build site", sys.executable, "scripts/build_site.py")
    run("Public content boundary", sys.executable, "scripts/validate_public_scope.py")
    run("Stylesheet order", NPM, "run", "check:css")
    run("JavaScript syntax", NPM, "run", "check:js")
    run("API unit tests", NPM, "run", "test:api")
    run("Page metadata", sys.executable, "scripts/check_page_metadata.py")
    run("Site budget", sys.executable, "scripts/check_site_budget.py")
    run("Browser regression", NPM, "run", "test:e2e")


def verify_ci() -> None:
    verify_full()
    run("Firefox browser regression", NPM, "run", "test:e2e:cross-browser")
    run("Generated file sync", sys.executable, "scripts/check_site_sync.py")
    run("Reproducible clean build", "git", "diff", "--exit-code")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run Biying site release verification.")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--quick", action="store_true")
    mode.add_argument("--full", action="store_true")
    mode.add_argument("--ci", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.quick:
        verify_quick()
    elif args.full:
        verify_full()
    else:
        verify_ci()
    print("\n[verify] all requested checks passed")


if __name__ == "__main__":
    main()
