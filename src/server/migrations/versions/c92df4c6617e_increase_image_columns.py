"""Increase imageUrl and images column sizes

Revision ID: c92df4c6617e
Revises: c2cc97b6a73b
Create Date: 2026-06-09

"""
from alembic import op
import sqlalchemy as sa


revision = "c92df4c6617e"
down_revision = "c2cc97b6a73b"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("car", schema=None) as batch_op:
        batch_op.alter_column(
            "imageUrl",
            existing_type=sa.VARCHAR(length=80),
            type_=sa.VARCHAR(length=255),
            existing_nullable=False,
        )
        batch_op.alter_column(
            "images",
            existing_type=sa.VARCHAR(length=255),
            type_=sa.Text,
            existing_nullable=True,
        )


def downgrade():
    with op.batch_alter_table("car", schema=None) as batch_op:
        batch_op.alter_column(
            "images",
            existing_type=sa.Text,
            type_=sa.VARCHAR(length=255),
            existing_nullable=True,
        )
        batch_op.alter_column(
            "imageUrl",
            existing_type=sa.VARCHAR(length=255),
            type_=sa.VARCHAR(length=80),
            existing_nullable=False,
        )
