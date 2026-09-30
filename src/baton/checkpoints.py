"""Checkpoint eligibility. An in-flight save is never usable."""

from __future__ import annotations

from baton.domain.enums import CheckpointState


def eligibility(checkpoint: dict, *, topology_signature: str, allow_reshard: bool, storage_reachable: bool, decision_step: int) -> tuple[bool, str]:
    state = checkpoint["state"]
    if state != CheckpointState.verified_usable.value:
        return False, f"state_{state}"
    if checkpoint["shards_present"] != checkpoint["shards_expected"]:
        return False, "incomplete"
    if not checkpoint["checksum_ok"]:
        return False, "corrupted"
    if checkpoint["topology_signature"] != topology_signature and not allow_reshard:
        return False, "incompatible_topology"
    if not storage_reachable or not checkpoint.get("reachable", False):
        return False, "inaccessible"
    if checkpoint.get("verified_at", 10**9) > decision_step:
        return False, "not_available_yet"
    return True, "eligible"


def select_restore_checkpoint(checkpoints: list[dict], **kwargs) -> tuple[dict | None, list[dict]]:
    """Pick the newest eligible checkpoint. Rejected candidates are returned with reasons."""
    rejected = []
    chosen = None
    for checkpoint in checkpoints:
        ok, reason = eligibility(checkpoint, **kwargs)
        if not ok:
            rejected.append({**checkpoint, "rejection_reason": reason})
            continue
        if chosen is None or checkpoint["progress"] > chosen["progress"]:
            chosen = checkpoint
    return chosen, rejected
