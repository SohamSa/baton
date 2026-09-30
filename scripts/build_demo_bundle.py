"""Build the public site payload with the real simulation engine.

The browser only renders this file. It does not contain a second simulator,
and it does not contain evaluator-only latent truth.
"""

from __future__ import annotations

import json
from pathlib import Path

from baton.adapters.registry import ADAPTERS
from baton.catalog.dictionary import build_catalog, catalog_counts
from baton.simulation.stories import list_stories, run_story

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "apps" / "web" / "public" / "demo-bundle.json"


def publishable(view: dict) -> dict:
    cleaned = dict(view)
    cleaned.pop("_evaluator", None)
    cleaned.pop("evaluator", None)
    cleaned.pop("observations", None)
    cleaned.pop("logs", None)
    cleaned.pop("ledger_errors", None)
    return cleaned


def main() -> None:
    runs: dict[str, dict] = {}
    for story in list_stories():
        story_id = story["id"]
        manual = publishable(run_story(story_id, mode="manual"))
        automated = publishable(run_story(story_id, mode="automated"))
        approved = None
        rejected = None
        pending = manual.get("pending_action")
        if pending:
            decision = {
                "action_id": pending["action_id"],
                "decision": "approve",
                "precondition_hash": pending.get("precondition_hash", ""),
                "actor": "public visitor",
            }
            approved = publishable(run_story(story_id, mode="manual", approvals=[decision]))
            rejected = publishable(
                run_story(
                    story_id,
                    mode="manual",
                    approvals=[{**decision, "decision": "reject"}],
                )
            )
        runs[story_id] = {"manual": manual, "automated": automated, "approved": approved, "rejected": rejected}
        print(story_id, manual.get("status"), "pending" if pending else "complete")
    report_path = ROOT / "artifacts" / "model_report.json"
    report = json.loads(report_path.read_text(encoding="utf-8")) if report_path.exists() else None
    fields = build_catalog()
    payload = {
        "synthetic": True,
        "public_demo": True,
        "administrator_access": False,
        "stories": list_stories(),
        "runs": runs,
        "catalog": {"counts": catalog_counts(fields), "synthetic": True},
        "models": {
            "operational_default": (report or {}).get("default_operational_policy", "rule_based"),
            "trained_report": report,
            "oracle": {"available_to_operators": False, "label": "evaluator_only"},
            "synthetic": True,
        },
        "monitoring": {
            "synthetic": True,
            "collectors": [{"id": "published-demo", "lag_steps": 0, "dropped_count": 0, "degraded": False, "queue_depth": 0}],
            "hardware_adapters_connected": False,
            "note": "This page serves engine results computed for the public demonstration. It is not a live collector on a GPU cluster.",
        },
        "adapters": ADAPTERS,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload), encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
