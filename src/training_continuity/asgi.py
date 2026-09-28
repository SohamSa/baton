"""ASGI entry. Story execution is drained by a background outbox worker."""

import os

from training_continuity.api.app import create_app

app = create_app(
    database_url=os.environ.get("DATABASE_URL", "sqlite+pysqlite:///./.local/training.db"),
    auth_secret=os.environ.get("TC_AUTH_SECRET", "local-dev-secret-change-me"),
    sync_worker=False,
)
