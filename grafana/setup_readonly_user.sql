-- Create read-only user for Grafana
-- Run this in your Postgres database: psql -d course_transfer -f grafana/setup_readonly_user.sql
-- Replace YOUR_SECURE_PASSWORD with the same password from .env.grafana

CREATE USER grafana_readonly WITH PASSWORD 'YOUR_SECURE_PASSWORD';

-- Grant connect privilege
GRANT CONNECT ON DATABASE course_transfer TO grafana_readonly;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO grafana_readonly;

-- Grant SELECT on all existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO grafana_readonly;

-- Grant SELECT on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT ON TABLES TO grafana_readonly;
