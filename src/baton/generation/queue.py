"""Bounded queue. Overflow is counted and never described as complete data."""

from __future__ import annotations


class BoundedQueue:
    def __init__(self, maxsize: int) -> None:
        self.maxsize = maxsize
        self.items: list = []
        self.dropped = 0

    def put(self, item) -> bool:
        if len(self.items) >= self.maxsize:
            self.dropped += 1
            return False
        self.items.append(item)
        return True

    @property
    def degraded(self) -> bool:
        return self.dropped > 0
