"""Local commands."""

from __future__ import annotations

import argparse
import os
import secrets
from pathlib import Path

from training_continuity.persistence.db import make_session_factory
from training_continuity.persistence.orm import Base
from training_continuity.api.app import seed_user


def main() -> None:
    parser = argparse.ArgumentParser(description="TrainingContinuity local commands")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("bootstrap")
    sub.add_parser("train")
    args = parser.parse_args()
    if args.command == "bootstrap":
        url = os.environ.get("DATABASE_URL", "sqlite+pysqlite:///./.local/training.db")
        Path(".local").mkdir(exist_ok=True)
        engine, _ = make_session_factory(url)
        Base.metadata.create_all(engine)
        creds = Path(".local/dev-credentials.txt")
        lines = []
        for username, role in (("viewer", "viewer"), ("investigator", "investigator"), ("approver", "approver"), ("admin", "administrator")):
            password = secrets.token_urlsafe(18)
            seed_user(url, username, password, role)
            lines.append(f"{username} {role} {password}")
        creds.write_text("\n".join(lines) + "\n", encoding="utf-8")
        print(f"Wrote new local passwords to {creds}. They are not a published default.")
    elif args.command == "train":
        from training_continuity.intelligence.train import train

        report = train(range(12), Path("artifacts"))
        print(report["default_operational_policy"], report["beats_baseline"])


if __name__ == "__main__":
    main()
