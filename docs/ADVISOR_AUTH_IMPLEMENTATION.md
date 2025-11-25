# Advisor Portal Authentication System

## Overview

This document describes the secure authentication system implemented for the advisor portal. The system uses email verification with time-limited codes to ensure that only authorized advisors can access administrative features.

## Security Architecture

### Why Email Verification?

The system uses **email verification with time-limited codes** instead of simple email whitelist checking because:

1. **Prevents Email Theft**: Someone with access to the whitelist cannot simply enter a whitelisted email and gain access - they need access to the actual email inbox to receive the verification code.

2. **Time-Limited Access**: Codes expire after 15 minutes, limiting the window of opportunity for potential attacks.

2. **Rate Limiting**: After 5 failed verification attempts, accounts are temporarily locked for 30 minutes.

3. **Session Management**: Authenticated sessions last 1 hour before requiring re-authentication.

5. **Audit Trail**: All authentication attempts are logged with timestamps for security monitoring.

## How It Works

### For Advisors

1. **Click the Settings Icon** in the top-right corner (or select Advisor during onboarding)
2. **Enter Email**: Enter your university email address
3. **Request Code**: Click "Send Access Code" - a 6-digit code will be sent to your email
4. **Verify Code**: Enter the 6-digit code from your email (code expires in 15 minutes)
5. **Access Granted**: You're now in advisor mode with access to all advisor features for 1 hour

### For Administrators

Administrators can manage the advisor whitelist through the **App Management** page (only visible in advisor mode):

1. **Add Single Email**: Enter an email address manually
2. **Bulk Upload**: Upload a CSV file with multiple email addresses
3. **Remove Advisors**: Remove advisors from the whitelist
4. **Monitor Status**: View active sessions and locked accounts

## Technical Implementation

### Backend Components

#### 1. Database Model (`models/advisor_auth.py`)

The `AdvisorAuth` model stores:
- Email addresses (whitelisted)
- Temporary access codes (6 digits, 15-minute expiration)
- Session tokens (64-character, 8-hour expiration)
- Security tracking (failed attempts, lockout status)
- Metadata (added date, last login)

#### 2. API Routes (`routes/advisor_auth.py`)

**Authentication Endpoints:**
- `POST /api/advisor-auth/request-code` - Request access code
- `POST /api/advisor-auth/verify-code` - Verify code and create session
- `GET /api/advisor-auth/verify-session` - Check current session validity
- `POST /api/advisor-auth/logout` - Logout and clear session

**Admin Endpoints (require admin token):**
- `GET /api/advisor-auth/whitelist` - List all whitelisted advisors
- `POST /api/advisor-auth/whitelist` - Add single advisor
- `POST /api/advisor-auth/whitelist/bulk` - Bulk add advisors via CSV
- `DELETE /api/advisor-auth/whitelist/:id` - Remove advisor

#### 3. Authentication Middleware (`auth.py`)

**`@require_advisor` Decorator:**
```python
@require_advisor
def protected_route():
    # This route requires valid advisor authentication
    pass
```

The decorator:
- Checks for `X-Advisor-Token` header or session token
- Validates token hasn't expired
- Auto-clears invalid sessions
- Stores advisor info in `request.advisor`

### Frontend Components

#### 1. Advisor Auth Modal (`components/AdvisorAuthModal.jsx`)

A multi-step modal that handles:
- Email entry
- Code request (sends email)
- Code verification
- Loading states and error handling
- Logout functionality

#### 2. App Management Page (`pages/AppManagementPage.jsx`)

Admin interface for managing advisor whitelist:
- Single email input
- CSV upload with template download
- List of whitelisted advisors
- Status indicators (active, locked)
- Remove advisor functionality

#### 3. API Service Updates (`services/api.js`)

New methods:
- `requestAdvisorCode(email)` - Request verification code
- `verifyAdvisorCode(email, code)` - Verify code
- `verifyAdvisorSession()` - Check session validity
- `logoutAdvisor()` - Logout
- `getAdvisorWhitelist()` - Admin: get whitelist
- `addAdvisorToWhitelist(email)` - Admin: add advisor
- `bulkAddAdvisorsToWhitelist(file)` - Admin: bulk add
- `removeAdvisorFromWhitelist(id)` - Admin: remove advisor

Token management:
- Advisor token stored in localStorage
- Automatically included in `X-Advisor-Token` header
- Cleared on logout

#### 4. UI Changes

**AppShell:**
- Replaced "Switch" button with Settings cog icon
- Clicking cog opens `AdvisorAuthModal`

**App.jsx:**
- Checks for existing advisor session on load
- Manages advisor authentication state
- Switches to advisor mode on successful auth

**useAppController.js:**
- Added "App Management" tab (advisor-only)
- Updated valid tab list

## Database Migration

A new migration file creates the `advisor_auth` table:

```bash
# Run migration (when backend is running)
flask db upgrade
```

Migration file: `migrations/versions/a1b2c3d4e5f6_add_advisor_authentication_table.py`

## Email Configuration

The system includes a placeholder for email sending. To enable email:

1. Choose an email service (SendGrid, AWS SES, etc.)
2. Update `send_access_code_email()` in `routes/advisor_auth.py`:

```python
def send_access_code_email(email, code):
    # Example with SendGrid
    import sendgrid
    from sendgrid.helpers.mail import Mail
    
    sg = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))
    
    message = Mail(
        from_email='noreply@university.edu',
        to_emails=email,
        subject='Your Advisor Portal Access Code',
        html_content=f'<p>Your access code is: <strong>{code}</strong></p><p>This code expires in 15 minutes.</p>'
    )
    
    sg.send(message)
    return True
```

3. Add email service API key to `.env`:

```bash
SENDGRID_API_KEY=your_api_key_here
```

## Security Features

### 1. Code Generation
- 6-digit numeric codes
- Cryptographically secure random generation using `secrets` module
- 15-minute expiration

### 2. Rate Limiting
- 5 attempts before account lockout
- 30-minute lockout period
- Failed attempts tracked per advisor

### 3. Session Security
- 64-character session tokens (URL-safe)
- 8-hour session expiration
- Tokens stored server-side only (not in response)
- Automatic session validation on each request

### 4. Token Management
- Frontend stores token in localStorage
- Token automatically included in API requests
- Cleared on logout or expiration

### 5. Audit Trail
- All authentication attempts logged
- Timestamps for code generation, verification, login
- Track failed attempts and lockouts

## CSV Format for Bulk Upload

Create a CSV file with an `email` column:

```csv
email
advisor1@university.edu
advisor2@university.edu
advisor3@university.edu
```

Alternative (if no header):
```csv
advisor1@university.edu
advisor2@university.edu
advisor3@university.edu
```

The system will:
- Skip duplicates (already whitelisted)
- Validate email format
- Report results (added, skipped, errors)

## Testing the Implementation

### 1. Add Test Advisor
```bash
# Add yourself to whitelist (requires admin token)
curl -X POST http://localhost:5000/api/advisor-auth/whitelist \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: your_admin_token" \
  -d '{"email": "your@email.edu"}'
```

### 2. Request Code
```bash
curl -X POST http://localhost:5000/api/advisor-auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.edu"}'
```

### 3. Verify Code (in development, check console for code)
```bash
curl -X POST http://localhost:5000/api/advisor-auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.edu", "code": "123456"}'
```

## Future Enhancements

1. **Two-Factor Authentication**: Add optional TOTP-based 2FA
2. **IP Whitelisting**: Restrict access to specific IP ranges
3. **Audit Log UI**: Dashboard for viewing authentication logs
4. **Role-Based Access**: Different permission levels for advisors
5. **Password Reset**: Add password recovery flow
6. **Email Templates**: Rich HTML email templates
7. **SMS Codes**: Alternative to email verification
8. **SSO Integration**: Single sign-on with university systems

## Troubleshooting

### Codes Not Being Sent
- Check that email service is configured
- Verify API keys in `.env`
- Check logs for email sending errors
- In development, codes are logged to console

### Account Locked
- Wait 30 minutes for automatic unlock
- Or manually reset in database:
  ```sql
  UPDATE advisor_auth SET locked_until = NULL, failed_attempts = 0 WHERE email = 'advisor@university.edu';
  ```

### Session Expired
- Sessions last 8 hours
- Simply re-authenticate to create a new session

### Can't Access Advisor Features
- Verify email is whitelisted: Check App Management page
- Verify session is valid: Check browser localStorage for `advisorToken`
- Check browser console for authentication errors

## Files Changed/Created

### Backend
- `models/advisor_auth.py` - New model
- `routes/advisor_auth.py` - New routes
- `auth.py` - Added `@require_advisor` decorator
- `routes/__init__.py` - Registered advisor_auth blueprint
- `app.py` - Added `X-Advisor-Token` to CORS headers
- `models/__init__.py` - Exported AdvisorAuth model
- `migrations/versions/a1b2c3d4e5f6_add_advisor_authentication_table.py` - Migration

### Frontend
- `components/AdvisorAuthModal.jsx` - New modal
- `pages/AppManagementPage.jsx` - New page
- `services/api.js` - Added advisor auth methods
- `views/AppShell.jsx` - Replaced Switch button with Settings cog
- `App.jsx` - Integrated advisor auth
- `controllers/useAppController.js` - Added App Management tab

## Admin Badge Removal

The admin mode badge can be removed from `AdminBadge.jsx` or wherever it was displayed, as the settings cog now serves as the access point for advisor features.

---

**Implementation Date**: November 20, 2025
**Author**: GitHub Copilot
**Status**: Complete - Ready for Testing
