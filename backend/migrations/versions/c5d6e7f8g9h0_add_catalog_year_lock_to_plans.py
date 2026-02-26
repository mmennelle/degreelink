"""Add catalog year lock to plans

Revision ID: c5d6e7f8g9h0
Revises: f93f0333ad95
Create Date: 2026-02-16 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision = 'c5d6e7f8g9h0'
down_revision = 'f93f0333ad95'
branch_labels = None
depends_on = None


def upgrade():
    # Add catalog year lock fields to plans table
    with op.batch_alter_table('plans', schema=None) as batch_op:
        batch_op.add_column(sa.Column('program_version_semester', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('program_version_year', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('catalog_year_locked_at', sa.DateTime(), nullable=True))
    
    # Migrate existing plans to use current version of their programs
    # This SQL will set the version fields based on the current requirement version
    connection = op.get_bind()
    
    # For each plan, find the current version of its program and set it
    connection.execute(text("""
        UPDATE plans
        SET 
            program_version_semester = (
                SELECT semester 
                FROM program_requirements 
                WHERE program_requirements.program_id = plans.program_id 
                AND program_requirements.is_current = true 
                LIMIT 1
            ),
            program_version_year = (
                SELECT year 
                FROM program_requirements 
                WHERE program_requirements.program_id = plans.program_id 
                AND program_requirements.is_current = true 
                LIMIT 1
            ),
            catalog_year_locked_at = plans.created_at
        WHERE EXISTS (
            SELECT 1 
            FROM program_requirements 
            WHERE program_requirements.program_id = plans.program_id 
            AND program_requirements.is_current = true
        )
    """))


def downgrade():
    # Remove catalog year lock fields from plans table
    with op.batch_alter_table('plans', schema=None) as batch_op:
        batch_op.drop_column('catalog_year_locked_at')
        batch_op.drop_column('program_version_year')
        batch_op.drop_column('program_version_semester')
