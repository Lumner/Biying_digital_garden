from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
FORBIDDEN_WORDS = ["secret", "api_key", "password"]


def main() -> None:
    failures: list[str] = []
    for path in DOCS.rglob("*.md"):
        text = path.read_text(encoding="utf-8", errors="ignore").lower()
        if "avatar_readable: true" not in text:
            continue
        for word in FORBIDDEN_WORDS:
            if word in text and path.name != "public-scope.md":
                failures.append(f"{path.relative_to(ROOT)} contains '{word}'")
    if failures:
        print("Potential public-scope issues:")
        for failure in failures:
            print(f"- {failure}")
        raise SystemExit(1)
    print("Public-scope validation passed.")


if __name__ == "__main__":
    main()
