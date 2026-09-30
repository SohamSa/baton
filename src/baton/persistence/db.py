"""Database sessions."""

from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


def make_engine(url: str):
    from sqlalchemy.pool import StaticPool

    connect_args = {}
    kwargs = {"future": True}
    if url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
        if ":memory:" in url:
            kwargs["poolclass"] = StaticPool
    return create_engine(url, connect_args=connect_args, **kwargs)


def make_session_factory(url: str):
    engine = make_engine(url)
    return engine, sessionmaker(bind=engine, expire_on_commit=False, future=True)


def enable_sqlite_fk(engine) -> None:
    if not str(engine.url).startswith("sqlite"):
        return
    from sqlalchemy import event

    @event.listens_for(engine, "connect")
    def _fk(dbapi_connection, _record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
