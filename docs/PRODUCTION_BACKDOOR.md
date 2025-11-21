# Production Backdoor Code

## Temporary Authentication for Pre-SMTP Deployment

### Backdoor Code: `089292`

This persistent access code works for **any whitelisted advisor email** until the SMTP server is configured for `dlink.cs.uno.edu`.

### How It Works

1. User enters their whitelisted email address
2. Backend "sends" the email (function executes successfully but no actual email is delivered)
3. User can enter either:
   - The backdoor code: `089292` (always works)
   - The actual generated code (if displayed in dev mode alert)

### Usage

For any whitelisted advisor:
1. Enter email address (e.g., `advisor@uno.edu`)
2. Click "Send Access Code"
3. Enter code: `089292`
4. Successfully authenticate

### When to Remove

Once SMTP is configured for `dlink.cs.uno.edu`, remove the backdoor by:

1. **Backend Model** (`backend/models/advisor_auth.py`):
   - Remove the backdoor code check in `verify_code()` method (lines starting with `BACKDOOR_CODE = '089292'`)

2. **Backend Route** (`backend/routes/advisor_auth.py`):
   - Update `send_access_code_email()` to configure actual SMTP settings
   - Remove backdoor note from docstring
   - Remove `response_data['backdoor_code']` from development response

3. **Frontend** (`frontend/src/components/AdvisorAuthModal.jsx`):
   - Update the alert message to remove backdoor code reference

### Security Note

- The backdoor code only works for **whitelisted emails** in the database
- Failed attempts are still tracked and accounts can be locked after 5 failures
- Sessions still expire after 1 hour
- This is a convenience feature for deployment, not a security vulnerability

### SMTP Configuration Checklist

When ready to configure SMTP:

1. Set up email service through UNO IT for `dlink.cs.uno.edu` domain
2. Get SMTP credentials (host, port, username, password)
3. Update `send_access_code_email()` in `backend/routes/advisor_auth.py`
4. Set environment variables:
   - `SMTP_HOST`
   - `SMTP_PORT` 
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `SMTP_FROM_EMAIL`
5. Set `FLASK_ENV=production`
6. Remove backdoor code as described above
7. Test email delivery with a real whitelisted advisor

### Current Whitelisted Advisors

Check database table `advisor_auth` for current list:
```sql
SELECT email, added_at FROM advisor_auth;
```

Add new advisors via admin endpoint or SQL:
```sql
INSERT INTO advisor_auth (email, added_at) VALUES ('newadvisor@uno.edu', NOW());
```
