"""Add the abstain reason captured when evidence is insufficient."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("incidents", sa.Column("abstain_reason", sa.String(200), nullable=True))


def downgrade() -> None:
    op.drop_column("incidents", "abstain_reason")
