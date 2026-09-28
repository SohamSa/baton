"""Pack the real Python engine so the public page can execute it."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "training_continuity"
SHIM = ROOT / "apps" / "web" / "engine-shims" / "pydantic.py"
OUT = ROOT / "apps" / "web" / "public" / "browser-engine.json"


def main() -> None:
    files = {}
    for path in SOURCE.rglob("*.py"):
        key = "training_continuity/" + path.relative_to(SOURCE).as_posix()
        files[key] = path.read_text(encoding="utf-8")
    payload = {"shim": SHIM.read_text(encoding="utf-8"), "files": files}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload), encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes, {len(files)} modules)")


if __name__ == "__main__":
    main()
