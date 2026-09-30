"""Explicit state machines. Illegal transitions raise."""

from __future__ import annotations

from baton.domain.enums import ActionState, CheckpointState


class TransitionError(ValueError):
    pass


CHECKPOINT_EDGES: dict[CheckpointState, set[CheckpointState]] = {
    CheckpointState.requested: {CheckpointState.queued, CheckpointState.failed},
    CheckpointState.queued: {CheckpointState.writing, CheckpointState.failed},
    CheckpointState.writing: {
        CheckpointState.manifest_complete,
        CheckpointState.failed,
        CheckpointState.corrupted,
    },
    CheckpointState.manifest_complete: {
        CheckpointState.verification_pending,
        CheckpointState.failed,
    },
    CheckpointState.verification_pending: {
        CheckpointState.verified_usable,
        CheckpointState.corrupted,
        CheckpointState.incompatible,
        CheckpointState.unavailable,
        CheckpointState.failed,
    },
    CheckpointState.verified_usable: set(),
    CheckpointState.failed: set(),
    CheckpointState.corrupted: set(),
    CheckpointState.unavailable: set(),
    CheckpointState.incompatible: set(),
}


def transition_checkpoint(current: CheckpointState, nxt: CheckpointState) -> CheckpointState:
    if nxt not in CHECKPOINT_EDGES[current]:
        raise TransitionError(f"checkpoint cannot move {current.value} -> {nxt.value}")
    return nxt


ACTION_EDGES: dict[ActionState, set[ActionState]] = {
    ActionState.proposed: {
        ActionState.awaiting_approval,
        ActionState.queued,
        ActionState.cancelled,
    },
    ActionState.awaiting_approval: {
        ActionState.approved,
        ActionState.cancelled,
        ActionState.expired,
    },
    ActionState.approved: {ActionState.queued, ActionState.expired, ActionState.cancelled},
    ActionState.queued: {ActionState.executing, ActionState.cancelled, ActionState.expired},
    ActionState.executing: {ActionState.verifying, ActionState.failed},
    ActionState.verifying: {
        ActionState.succeeded,
        ActionState.failed,
        ActionState.compensated,
    },
    ActionState.succeeded: set(),
    ActionState.failed: {ActionState.compensated},
    ActionState.cancelled: set(),
    ActionState.expired: set(),
    ActionState.compensated: set(),
}

TERMINAL_ACTIONS = {
    ActionState.succeeded,
    ActionState.failed,
    ActionState.cancelled,
    ActionState.expired,
    ActionState.compensated,
}


def transition_action(current: ActionState, nxt: ActionState) -> ActionState:
    if nxt not in ACTION_EDGES[current]:
        raise TransitionError(f"action cannot move {current.value} -> {nxt.value}")
    return nxt
