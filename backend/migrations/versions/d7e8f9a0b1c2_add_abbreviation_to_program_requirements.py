"""Add abbreviation column to program_requirements

Revision ID: d7e8f9a0b1c2
Revises: f54a517d7e8f
Create Date: 2026-02-27 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd7e8f9a0b1c2'
down_revision = 'c5d6e7f8g9h0'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('program_requirements', schema=None) as batch_op:
        batch_op.add_column(sa.Column('abbreviation', sa.String(length=10), nullable=True))


def downgrade():
    with op.batch_alter_table('program_requirements', schema=None) as batch_op:
        batch_op.drop_column('abbreviation')
