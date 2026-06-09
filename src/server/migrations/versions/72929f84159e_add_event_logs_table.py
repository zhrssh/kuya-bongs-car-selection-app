"""Add event_logs table

Revision ID: 72929f84159e
Revises: 0bf6ee82896b
Create Date: 2026-06-09 20:06:32.222291

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = '72929f84159e'
down_revision = '0bf6ee82896b'
branch_labels = None
depends_on = None


def upgrade():
    inspector = inspect(op.get_bind())
    if 'event_logs' not in inspector.get_table_names():
        op.create_table('event_logs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('type', sa.String(length=20), nullable=False),
        sa.Column('car_id', sa.String(length=36), nullable=True),
        sa.Column('car_name', sa.String(length=200), nullable=True),
        sa.Column('message', sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint('id')
        )


def downgrade():
    op.drop_table('event_logs')
