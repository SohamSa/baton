"""Durable action execution. A restarted worker must not repeat an effect."""

from __future__ import annotations


TERMINAL = {"succeeded", "failed", "cancelled", "expired", "compensated"}


class ActionConflict(Exception):
    pass


class MemoryActionRepo:
    def __init__(self) -> None:
        self.rows: dict[str, dict] = {}
        self.scopes: dict[str, str] = {}

    def get(self, key: str) -> dict | None:
        row = self.rows.get(key)
        return None if row is None else dict(row)

    def save(self, row: dict) -> None:
        self.rows[row["key"]] = dict(row)


class ActionService:
    def __init__(self, repo: MemoryActionRepo) -> None:
        self.repo = repo

    def execute(self, key: str, scope: str, effect) -> dict:
        existing = self.repo.get(key)
        if existing and existing["state"] in TERMINAL:
            return existing
        if existing and existing.get("effect_applied"):
            existing["state"] = "succeeded"
            self.repo.save(existing)
            return existing
        holder = self.repo.scopes.get(scope)
        if holder and holder != key:
            other = self.repo.get(holder)
            if other and other["state"] == "executing":
                raise ActionConflict(scope)
        row = existing or {"key": key, "scope": scope, "state": "executing", "effect_applied": False}
        row["state"] = "executing"
        row["effect_applied"] = True
        self.repo.scopes[scope] = key
        self.repo.save(row)
        effect()
        row = self.repo.get(key)
        row["state"] = "succeeded"
        self.repo.save(row)
        self.repo.scopes.pop(scope, None)
        return row
