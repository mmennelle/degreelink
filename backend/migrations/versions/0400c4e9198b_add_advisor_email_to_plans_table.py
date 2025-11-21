"""Add advisor_email to plans table

Revision ID: 0400c4e9198b
Revises: a1b2c3d4e5f6
Create Date: 2025-11-21 09:08:01.130548

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0400c4e9198b'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    # Add advisor_email column to plans table
    op.add_column('plans', sa.Column('advisor_email', sa.String(length=255), nullable=True))
    
    # Create index on advisor_email for faster lookups
    op.create_index(op.f('ix_plans_advisor_email'), 'plans', ['advisor_email'], unique=False)
    
    # Create foreign key constraint to advisor_auth table
    op.create_foreign_key(
        'fk_plans_advisor_email_advisor_auth',
        'plans', 'advisor_auth',
        ['advisor_email'], ['email'],
        ondelete='SET NULL'  # If advisor is removed, set to NULL rather than deleting plan
    )


def downgrade():
    # Drop foreign key constraint
    op.drop_constraint('fk_plans_advisor_email_advisor_auth', 'plans', type_='foreignkey')
    
    # Drop index
    op.drop_index(op.f('ix_plans_advisor_email'), table_name='plans')
    
    # Drop column
    op.drop_column('plans', 'advisor_email')
