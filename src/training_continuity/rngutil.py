"""Keyed random streams.

Draws are functions of (master seed, stream name, key parts). A policy that
consumes an extra action draw cannot change fault, workload, or observation
streams, and cannot desynchronize later samples of those streams.
"""

from __future__ import annotations

import hashlib
import math

STREAMS = (
    "population",
    "workload",
    "faults",
    "observation",
    "facility",
    "repairs",
    "storage",
    "actions",
)


def _unit(seed: int, stream: str, parts: tuple) -> float:
    material = "|".join((str(seed), stream, *(str(p) for p in parts)))
    digest = hashlib.sha256(material.encode("utf-8")).digest()
    return int.from_bytes(digest[:8], "little") / float(2**64)


def uniform(seed: int, stream: str, *parts: object) -> float:
    if stream not in STREAMS:
        raise ValueError(f"unknown stream {stream}")
    return _unit(seed, stream, parts)


def normal(seed: int, stream: str, *parts: object) -> float:
    u1 = max(_unit(seed, stream, (*parts, "n1")), 1e-12)
    u2 = _unit(seed, stream, (*parts, "n2"))
    return math.sqrt(-2.0 * math.log(u1)) * math.cos(2.0 * math.pi * u2)


def weighted_choice(seed: int, stream: str, weights: dict[str, float], *parts: object) -> str:
    total = sum(weights.values())
    if total <= 0:
        raise ValueError("weights must be positive")
    point = uniform(seed, stream, *parts) * total
    cursor = 0.0
    last = ""
    for name, weight in weights.items():
        last = name
        cursor += weight
        if point <= cursor:
            return name
    return last
