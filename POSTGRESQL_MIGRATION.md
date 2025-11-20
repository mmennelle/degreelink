# PostgreSQL Migration Guide

## Overview

The backend has been migrated from SQLite to PostgreSQL while maintaining all existing functionality. SQLAlchemy and Flask Blueprint architecture remain unchanged.

## Changes Made

1. **requirements.txt**: Added `psycopg2-binary==2.9.9` for PostgreSQL adapter
2. **config.py**: Changed default `SQLALCHEMY_DATABASE_URI` from SQLite to PostgreSQL
3. **app.py**: Changed default `SQLALCHEMY_DATABASE_URI` from SQLite to PostgreSQL
4. **.env.example**: Created template for environment configuration

## Setup Instructions

### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
# Switch to postgres user (Linux/macOS)
sudo -u postgres psql

# Or connect directly if configured
psql -U postgres
```

In the PostgreSQL prompt:
```sql
-- Create database
CREATE DATABASE course_transfer;

-- Create user (optional, for better security)
CREATE USER course_transfer_user WITH PASSWORD 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE course_transfer TO course_transfer_user;

-- Exit
\q
```

### 3. Configure Environment

Copy the example environment file:
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/course_transfer
```

Examples:
- Using default postgres user: `postgresql://postgres:password@localhost:5432/course_transfer`
- Using custom user: `postgresql://course_transfer_user:your_password@localhost:5432/course_transfer`
- Local without password: `postgresql://localhost/course_transfer`

### 4. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 5. Initialize Database

Run migrations to create tables:
```bash
# Initialize migrations (if not already done)
flask db init

# Generate migration
flask db migrate -m "Initial PostgreSQL migration"

# Apply migration
flask db upgrade
```

Or use the init script:
```bash
python init_db.py
```

### 6. Run the Application

```bash
# Development
flask run

# Or with gunicorn (production)
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Testing

Tests continue to use SQLite in-memory database (defined in `TestingConfig`), so no changes are needed:
```bash
pytest
```

## Troubleshooting

### Connection Issues

**Error: "could not connect to server"**
- Ensure PostgreSQL is running: `sudo systemctl status postgresql` (Linux) or `brew services list` (macOS)
- Check your DATABASE_URL format

**Error: "FATAL: database does not exist"**
- Create the database using the SQL commands in Step 2

**Error: "FATAL: password authentication failed"**
- Verify your username and password in DATABASE_URL
- Check PostgreSQL authentication settings in `pg_hba.conf`

### Permission Issues

**Error: "permission denied for database"**
```sql
-- Connect as postgres user
sudo -u postgres psql

-- Grant proper permissions
GRANT ALL PRIVILEGES ON DATABASE course_transfer TO your_username;
ALTER DATABASE course_transfer OWNER TO your_username;
```

### Migration Issues

**Error: "Target database is not up to date"**
```bash
# Check migration status
flask db current

# Apply pending migrations
flask db upgrade
```

**Starting fresh:**
```bash
# Drop and recreate database
sudo -u postgres psql -c "DROP DATABASE course_transfer;"
sudo -u postgres psql -c "CREATE DATABASE course_transfer;"

# Remove migrations and reinitialize
rm -rf migrations/
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## Production Deployment

For production, ensure:

1. Use strong passwords and secure connection strings
2. Set `FLASK_ENV=production` in environment
3. Use environment variables instead of .env file
4. Enable SSL for database connections:
   ```env
   DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
   ```
5. Regular database backups:
   ```bash
   pg_dump course_transfer > backup_$(date +%Y%m%d).sql
   ```

## Reverting to SQLite (if needed)

If you need to revert to SQLite:

1. Change DATABASE_URL in config.py and app.py:
   ```python
   SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///course_transfer.db')
   ```

2. Update .env or remove DATABASE_URL variable

3. Run migrations:
   ```bash
   flask db upgrade
   ```

## Benefits of PostgreSQL

- Better performance for concurrent access
- Full ACID compliance
- Advanced features (JSON columns, full-text search, etc.)
- Better suited for production deployment
- More robust transaction handling
- Better handling of concurrent writes
