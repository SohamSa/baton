"""The browser shim must produce the same story as installed Pydantic."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CODE = """
from baton.simulation.engine import config_hash
from baton.simulation.stories import run_story, story_config

cfg = story_config("healthy_workload_shift")
view = run_story("healthy_workload_shift", mode="manual")
print(config_hash(cfg))
print(view["status"])
print(f"{view['metrics']['useful_new']:.6f}")
print(view["hypotheses"]["leading_mechanism"])
"""


def _run(pythonpath: str) -> str:
    env = os.environ.copy()
    env["PYTHONPATH"] = pythonpath
    completed = subprocess.run([sys.executable, "-c", CODE], cwd=ROOT, env=env, text=True, capture_output=True, check=False)
    assert completed.returncode == 0, completed.stderr
    return completed.stdout


def test_browser_config_shim_matches_installed_pydantic():
    real = _run(str(ROOT / "src"))
    shim = _run(str(ROOT / "apps" / "web" / "engine-shims") + os.pathsep + str(ROOT / "src"))
    assert shim == real


def test_advanced_challenges_match_browser_config_shim():
    global CODE
    previous=CODE
    CODE="""
from baton.simulation.stories import run_story, CHALLENGES
for id in CHALLENGES:
    view=run_story(id,variant="challenge")
    print(id,view['story']['variant'],round(view['metrics']['useful_new'],6),round(view['comparison']['delta_second_minus_first']['useful_new'],6))
"""
    try:
        assert _run(str(ROOT / "src")) == _run(str(ROOT / "apps" / "web" / "engine-shims") + os.pathsep + str(ROOT / "src"))
    finally:
        CODE=previous
