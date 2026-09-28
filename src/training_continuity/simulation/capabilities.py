"""Capability checks. Membership changes are never implicit."""

from __future__ import annotations


def tensor_groups(rank_count: int, tp_size: int) -> list[list[int]]:
    if tp_size < 1 or rank_count % tp_size != 0:
        raise ValueError("tensor-parallel width must divide the rank count")
    return [list(range(i, i + tp_size)) for i in range(0, rank_count, tp_size)]


def bad_ranks(rank_gpu: list[str], dropped: set[int], functional: dict[str, bool], quarantined: dict[str, bool]) -> list[int]:
    bad = []
    for rank, gpu_id in enumerate(rank_gpu):
        if rank in dropped:
            continue
        if not functional.get(gpu_id, False) or quarantined.get(gpu_id, False):
            bad.append(rank)
    return bad


def reconfigure_possible(capability: str, rank_count: int, tp_size: int, dropped: set[int], bad: list[int]) -> tuple[bool, str]:
    if capability != "reconfigurable":
        return False, "strict synchronization requires a coordinated restart; this runtime cannot drop a rank and continue the step"
    groups = tensor_groups(rank_count, tp_size)
    surviving = []
    for group in groups:
        if all(rank in dropped for rank in group):
            continue
        hit = [rank for rank in group if rank in bad]
        if not hit:
            surviving.append(group)
            continue
        if len(hit) != len(group):
            return False, "a tensor-parallel group is only partly available; surviving ranks cannot finish a dependent step"
    if not surviving:
        return False, "no surviving data-parallel replica"
    if len(surviving) == len(groups):
        return False, "membership change would not remove a failed replica"
    return True, "failed data-parallel replicas can be removed only with a checkpoint restart onto the smaller membership"
