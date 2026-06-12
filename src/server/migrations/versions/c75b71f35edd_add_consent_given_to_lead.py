"""Add consent_given column to lead table

Revision ID: c75b71f35edd
Revises: 72929f84159e
Create Date: 2026-06-12 10:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c75b71f35edd'
down_revision = '72929f84159e'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('lead', sa.Column('consent_given', sa.Boolean(), nullable=False, server_default=sa.text('0')))


def downgrade():
    op.drop_column('lead', 'consent_given')
