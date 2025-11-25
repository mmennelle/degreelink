# Database Migrations

Flask-Migrate (Alembic) has been enabled. To start using migrations:

1. (One-time) Initialize the migration environment if not present:
   flask db init
2. Generate a migration after model changes:
   flask db migrate -m "describe change"
3. Apply migrations:
   flask db upgrade
4. (Optional) View history:
   flask db history

Environment setup example (PowerShell):

```powershell
$env:FLASK_APP="app.py"
$env:FLASK_ENV="development"
flask db migrate -m "initial"
flask db upgrade
```

If the existing SQLite file predates indexes just added, run a migration rather than recreating the database so data is preserved.

# API Testing

Example PowerShell command to add a course:

```powershell
$headers = @{ "X-Admin-Token" = "developmentAPI" }
Invoke-RestMethod -Method POST -Uri http://127.0.0.1:5000/api/courses -Headers $headers -Body (@{title='x'; code='TEST 100'; credits=3; institution='TestU'} | ConvertTo-Json) -ContentType 'application/json'
```
