"""Add advisor authentication table

Revision ID: a1b2c3d4e5f6
Revises: f54a517d7e8f
Create Date: 2025-11-20 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'f54a517d7e8f'
branch_labels = None
depends_on = None


def upgrade():
    # Create advisor_auth table
    op.create_table('advisor_auth',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('access_code', sa.String(length=6), nullable=True),
        sa.Column('code_expires_at', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('session_token', sa.String(length=64), nullable=True),
        sa.Column('session_expires_at', sa.DateTime(), nullable=True),
        sa.Column('failed_attempts', sa.Integer(), nullable=False),
        sa.Column('last_attempt', sa.DateTime(), nullable=True),
        sa.Column('locked_until', sa.DateTime(), nullable=True),
        sa.Column('added_at', sa.DateTime(), nullable=False),
        sa.Column('added_by', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_advisor_auth_email'), 'advisor_auth', ['email'], unique=True)
    op.create_index(op.f('ix_advisor_auth_session_token'), 'advisor_auth', ['session_token'], unique=True)


def downgrade():
    # Drop indexes
    op.drop_index(op.f('ix_advisor_auth_session_token'), table_name='advisor_auth')
    op.drop_index(op.f('ix_advisor_auth_email'), table_name='advisor_auth')
    
    # Drop table
    op.drop_table('advisor_auth')
