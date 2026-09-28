"""Local password hashing and session tokens. No secrets are logged."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import time

PBKDF2_ROUNDS = 600_000


def hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ROUNDS)
    return f"{salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt_hex, digest_hex = stored.split("$", 1)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(digest_hex)
    except ValueError:
        return False
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ROUNDS)
    return hmac.compare_digest(digest, expected)


def issue_token(username: str, role: str, secret: str, ttl_s: int = 12 * 3600) -> str:
    payload = {"sub": username, "role": role, "exp": int(time.time()) + ttl_s}
    body = base64.urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode()).decode().rstrip("=")
    sig = hmac.new(secret.encode("utf-8"), body.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{body}.{sig}"


def read_token(token: str, secret: str) -> dict | None:
    try:
        body, sig = token.split(".", 1)
    except ValueError:
        return None
    expected = hmac.new(secret.encode("utf-8"), body.encode("utf-8"), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, sig):
        return None
    padded = body + "=" * (-len(body) % 4)
    try:
        payload = json.loads(base64.urlsafe_b64decode(padded.encode()))
    except (json.JSONDecodeError, ValueError):
        return None
    if int(payload.get("exp", 0)) < int(time.time()):
        return None
    return payload
