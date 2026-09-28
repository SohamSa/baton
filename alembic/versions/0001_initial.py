"""SQLite and PostgreSQL migrations for operational metadata."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "sites",
        sa.Column("site_id", sa.String(64), primary_key=True),
        sa.Column("display_name", sa.String(200), nullable=False),
        sa.Column("timezone", sa.String(64), nullable=False),
        sa.Column("climate_regime", sa.String(64), nullable=False),
    )
    op.create_table(
        "incidents",
        sa.Column("incident_id", sa.String(96), primary_key=True),
        sa.Column("run_id", sa.String(64), nullable=False),
        sa.Column("scope", sa.String(96), nullable=False),
        sa.Column("opened_step", sa.Integer, nullable=False),
        sa.Column("state", sa.String(32), nullable=False),
    )
    op.create_table(
        "users",
        sa.Column("user_id", sa.String(64), primary_key=True),
        sa.Column("username", sa.String(64), nullable=False),
        sa.Column("password_hash", sa.String(256), nullable=False),
        sa.Column("role", sa.String(32), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("users")
    op.drop_table("incidents")
    op.drop_table("sites")
