"""Schema integrity and migration shape."""

from __future__ import annotations

from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import inspect, text
from sqlalchemy.exc import IntegrityError

from baton.persistence.db import enable_sqlite_fk, make_engine
from baton.persistence.orm import Base, Site, Zone


def test_foreign_keys_reject_dangling_zones(tmp_path: Path):
    url = f"sqlite+pysqlite:///{tmp_path / 'app.db'}"
    engine = make_engine(url)
    enable_sqlite_fk(engine)
    Base.metadata.create_all(engine)
    with engine.begin() as connection:
        connection.execute(text("INSERT INTO sites (site_id, display_name, timezone, climate_regime) VALUES ('s', 'Harborline Test Site', 'UTC', 'temperate')"))
        with pytest.raises(IntegrityError):
            connection.execute(text("INSERT INTO zones (zone_id, site_id, shared_boundary) VALUES ('z', 'missing', 'power')"))


def test_alembic_adds_abstain_reason(tmp_path: Path):
    url = f"sqlite+pysqlite:///{tmp_path / 'migrate.db'}"
    cfg = Config("alembic.ini")
    cfg.set_main_option("sqlalchemy.url", url)
    command.upgrade(cfg, "0001")
    engine = make_engine(url)
    columns = {column["name"] for column in inspect(engine).get_columns("incidents")}
    assert "abstain_reason" not in columns
    command.upgrade(cfg, "head")
    columns = {column["name"] for column in inspect(engine).get_columns("incidents")}
    assert "abstain_reason" in columns
    assert Site.__tablename__ == "sites"
    assert Zone.__tablename__ == "zones"
