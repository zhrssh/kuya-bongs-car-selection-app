"""Add lead table

Revision ID: 0bf6ee82896b
Revises: c92df4c6617e
Create Date: 2026-06-09 19:42:16.824089

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0bf6ee82896b'
down_revision = 'c92df4c6617e'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('lead',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('carId', sa.Uuid(), nullable=False),
        sa.Column('sender_name', sa.String(length=120), nullable=False),
        sa.Column('sender_email', sa.String(length=120), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('interest_type', sa.String(length=50), nullable=False),
        sa.Column('created', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['carId'], ['car.id'], name='fk_lead_car_id'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('lead')
