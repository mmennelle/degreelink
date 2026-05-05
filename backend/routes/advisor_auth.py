"""
Degree Link - Course Equivalency and Transfer Planning System
Copyright (c) 2025 University of New Orleans - Computer Science Department
Author: Mitchell Mennelle

This file is part of Degree Link.
Licensed under the MIT License. See LICENSE file in the project root.
"""

"""Routes for advisor authentication system."""
from flask import Blueprint, request, jsonify, session
from models import db
from models.advisor_auth import AdvisorAuth
from auth import require_admin
from datetime import datetime, timedelta
import csv
import io
import secrets

bp = Blueprint('advisor_auth', __name__, url_prefix='/api/advisor-auth')


# Helper to send email — prefers SMTP relay if configured, falls back to Resend
def send_access_code_email(email, code):
    """
    Send the 6-digit access code to the advisor's email.

    Sender selection (in order):
        1. SMTP relay        — if SMTP_HOST is set
        2. Resend HTTP API   — if RESEND_API_KEY is set
        3. Dev no-op         — otherwise (logs only, returns True)

    SMTP environment variables:
        SMTP_HOST            - e.g. 'mailu.cs.uno.edu'
        SMTP_PORT            - default 587
        SMTP_USERNAME        - relay account username
        SMTP_PASSWORD        - relay account password
        SMTP_FROM            - From header, e.g. 'Degree Link <noreply@dlink.cs.uno.edu>'
        SMTP_STARTTLS        - 'true' (default) to upgrade with STARTTLS on 587
        SMTP_USE_SSL         - 'true' to use implicit TLS (e.g. port 465); default 'false'
        SMTP_VERIFY_CERT     - 'true' (default) to verify the relay's TLS cert.
                               Set to 'false' for self-signed relays.

    Resend environment variables:
        RESEND_API_KEY       - API key from https://resend.com/api-keys
        RESEND_FROM          - From address (default: 'Degree Link <noreply.dlink@resend.dev>')

    Returns True on success, False on failure.
    """
    import os

    print(f"[EMAIL] Access code generated for {email}")

    subject = 'Your Degree Link Advisor Portal Access Code'
    html = f"""<!doctype html>
<html>
  <body style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#111;">
    <div style="max-width:520px; margin:0 auto; padding:24px;">
      <h2 style="margin:0 0 16px;">Advisor Portal Access Code</h2>
      <p>Use the following code to sign in to the Degree Link advisor portal:</p>
      <p style="font-size:28px; font-weight:700; letter-spacing:6px; background:#f3f4f6;
                padding:16px 20px; border-radius:8px; text-align:center; margin:20px 0;">
        {code}
      </p>
      <p style="color:#555;">This code expires in 15 minutes. If you did not request it, you can ignore this email.</p>
      <hr style="border:none; border-top:1px solid #eee; margin:24px 0;">
      <p style="font-size:12px; color:#888;">University of New Orleans &mdash; Degree Link</p>
    </div>
  </body>
</html>"""
    text = (
        f"Your Degree Link advisor portal access code is: {code}\n\n"
        "This code expires in 15 minutes.\n"
        "If you did not request it, you can ignore this email."
    )

    smtp_host = os.environ.get('SMTP_HOST')
    if smtp_host:
        import smtplib
        import ssl
        from email.message import EmailMessage

        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        smtp_user = os.environ.get('SMTP_USERNAME')
        smtp_pass = os.environ.get('SMTP_PASSWORD')
        from_addr = os.environ.get('SMTP_FROM', 'Degree Link <noreply@dlink.cs.uno.edu>')
        use_starttls = os.environ.get('SMTP_STARTTLS', 'true').lower() in ('1', 'true', 'yes')
        use_ssl = os.environ.get('SMTP_USE_SSL', 'false').lower() in ('1', 'true', 'yes')
        verify_cert = os.environ.get('SMTP_VERIFY_CERT', 'true').lower() in ('1', 'true', 'yes')

        # Build TLS context — relax verification for self-signed relays.
        tls_ctx = ssl.create_default_context()
        if not verify_cert:
            tls_ctx.check_hostname = False
            tls_ctx.verify_mode = ssl.CERT_NONE

        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = from_addr
        msg['To'] = email
        msg.set_content(text)
        msg.add_alternative(html, subtype='html')

        try:
            if use_ssl:
                server = smtplib.SMTP_SSL(smtp_host, smtp_port, context=tls_ctx, timeout=15)
            else:
                server = smtplib.SMTP(smtp_host, smtp_port, timeout=15)
            with server:
                server.ehlo()
                if use_starttls and not use_ssl:
                    server.starttls(context=tls_ctx)
                    server.ehlo()
                if smtp_user and smtp_pass:
                    server.login(smtp_user, smtp_pass)
                server.send_message(msg)
            print(f"[EMAIL] SMTP relay delivered code to {email} via {smtp_host}:{smtp_port}")
            return True
        except Exception as e:
            print(f"[EMAIL] SMTP send failed for {email} via {smtp_host}:{smtp_port}: {e}")
            return False

    api_key = os.environ.get('RESEND_API_KEY')
    if api_key:
        from_addr = os.environ.get('RESEND_FROM', 'Degree Link <noreply.dlink@resend.dev>')
        try:
            import resend
            resend.api_key = api_key
            result = resend.Emails.send({
                "from": from_addr,
                "to": [email],
                "subject": subject,
                "html": html,
                "text": text,
            })
            print(f"[EMAIL] Resend accepted message for {email}: {result}")
            return True
        except Exception as e:
            print(f"[EMAIL] Resend send failed for {email}: {e}")
            return False

    print("[EMAIL] No mail transport configured (set SMTP_HOST or RESEND_API_KEY); dev mode.")
    return True


@bp.route('/request-code', methods=['POST'])
def request_access_code():
    """
    Request an access code for advisor authentication.
    Sends a 6-digit code to the email if it's whitelisted.
    """
    data = request.get_json()
    email = data.get('email', '').lower().strip()
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    # Find advisor by email
    advisor = AdvisorAuth.find_by_email(email)
    
    if not advisor:
        # Don't reveal whether email is whitelisted (security)
        return jsonify({
            'message': 'If your email is registered, you will receive an access code shortly.'
        })
    
    # Check if locked
    if advisor.is_locked():
        return jsonify({
            'error': 'Account temporarily locked due to too many failed attempts. Please try again later.',
            'locked_until': advisor.locked_until.isoformat() if advisor.locked_until else None
        }), 403
    
    # Ensure TOTP secret exists and generate access code
    had_otp_secret = bool(advisor.otp_secret)  # Check if already had secret
    otp_secret = advisor.ensure_otp_secret()
    code = advisor.generate_access_code()
    
    try:
        db.session.commit()
        
        # Send email with code
        if send_access_code_email(email, code):
            import pyotp
            totp = pyotp.TOTP(otp_secret)
            response_data = {
                'message': 'Access code sent to your email. It will expire in 15 minutes.',
                'email': email,
                'has_totp': had_otp_secret,  # Tell frontend if TOTP was already set up
            }
            
            # Only include QR/secret if this is first time setup
            if not had_otp_secret:
                response_data['totp_qr'] = totp.provisioning_uri(name=email, issuer_name="UNO Course Equivalency")
                response_data['totp_secret'] = otp_secret
            
            # Include code info for development/pre-SMTP deployment
            import os
            if os.environ.get('FLASK_ENV') != 'production':
                # Development: show actual code in response
                response_data['dev_code'] = code
                response_data['dev_mode'] = True
            
            return jsonify(response_data)
        else:
            return jsonify({'error': 'Failed to send email. Please try again.'}), 500
            
    except Exception as e:
        db.session.rollback()
        print(f"Error generating access code: {e}")
        return jsonify({'error': 'Failed to generate access code'}), 500


@bp.route('/verify-code', methods=['POST'])
def verify_access_code():
    """
    Verify the access code or TOTP and create a session if valid.
    Returns session token for subsequent requests.
    """
    data = request.get_json()
    email = data.get('email', '').lower().strip()
    code = data.get('code', '').strip()
    totp = data.get('totp', '').strip()
    
    if not email or (not code and not totp):
        return jsonify({'error': 'Email and code or TOTP are required'}), 400
    
    # Find advisor
    advisor = AdvisorAuth.find_by_email(email)
    
    if not advisor:
        return jsonify({'error': 'Invalid email or code'}), 401
    
    # Check if locked
    if advisor.is_locked():
        return jsonify({
            'error': 'Account temporarily locked due to too many failed attempts.',
            'locked_until': advisor.locked_until.isoformat() if advisor.locked_until else None
        }), 403
    
    # Try TOTP first
    if totp and advisor.verify_totp(totp):
        advisor.session_token = secrets.token_urlsafe(48)
        advisor.session_expires_at = datetime.utcnow() + timedelta(hours=1)
        advisor.is_active = True
        advisor.last_login = datetime.utcnow()
        advisor.failed_attempts = 0
        try:
            db.session.commit()
            
            # Store session info
            session['advisor_id'] = advisor.id
            session['advisor_email'] = advisor.email
            session['advisor_token'] = advisor.session_token
            session.permanent = True
            
            return jsonify({
                'message': 'Authentication successful (TOTP)',
                'session_token': advisor.session_token,
                'email': advisor.email,
                'expires_at': advisor.session_expires_at.isoformat()
            })
        except Exception as e:
            db.session.rollback()
            print(f"Error during TOTP verification: {e}")
            return jsonify({'error': 'Authentication failed'}), 500
    
    # Fallback to code/backdoor
    if code and advisor.verify_code(code):
        try:
            db.session.commit()
            
            # Store session info
            session['advisor_id'] = advisor.id
            session['advisor_email'] = advisor.email
            session['advisor_token'] = advisor.session_token
            session.permanent = True
            
            return jsonify({
                'message': 'Authentication successful',
                'session_token': advisor.session_token,
                'email': advisor.email,
                'expires_at': advisor.session_expires_at.isoformat()
            })
        except Exception as e:
            db.session.rollback()
            print(f"Error during code verification: {e}")
            return jsonify({'error': 'Authentication failed'}), 500
    
    # If both fail
    try:
        db.session.commit()  # Save failed attempt count
    except:
        db.session.rollback()
    
    # Check if now locked
    if advisor.is_locked():
        return jsonify({
            'error': 'Too many failed attempts. Account locked temporarily.',
            'locked_until': advisor.locked_until.isoformat()
        }), 403
    
    return jsonify({
        'error': 'Invalid or expired code/TOTP',
        'attempts_remaining': max(0, 5 - advisor.failed_attempts)
    }), 401


@bp.route('/verify-session', methods=['GET'])
def verify_session():
    """Check if current session is valid."""
    token = request.headers.get('X-Advisor-Token') or session.get('advisor_token')
    
    print(f"[DEBUG] verify-session called")
    print(f"[DEBUG] X-Advisor-Token header: {request.headers.get('X-Advisor-Token')}")
    print(f"[DEBUG] Session advisor_token: {session.get('advisor_token')}")
    print(f"[DEBUG] Final token: {token}")
    
    if not token:
        return jsonify({'valid': False, 'error': 'No session token'}), 401
    
    advisor = AdvisorAuth.find_by_session_token(token)
    
    if not advisor or not advisor.verify_session(token):
        session.clear()
        return jsonify({'valid': False, 'error': 'Session expired or invalid'}), 401
    
    return jsonify({
        'valid': True,
        'email': advisor.email,
        'expires_at': advisor.session_expires_at.isoformat()
    })


@bp.route('/logout', methods=['POST'])
def logout():
    """Logout advisor and clear session."""
    token = request.headers.get('X-Advisor-Token') or session.get('advisor_token')
    
    if token:
        advisor = AdvisorAuth.find_by_session_token(token)
        if advisor:
            advisor.logout()
            try:
                db.session.commit()
            except:
                db.session.rollback()
    
    session.clear()
    return jsonify({'message': 'Logged out successfully'})


@bp.route('/regenerate-totp', methods=['POST'])
def regenerate_totp():
    """Regenerate TOTP secret for an advisor (requires email + valid code/totp)."""
    data = request.get_json()
    email = data.get('email', '').lower().strip()
    code = data.get('code', '').strip()
    totp_current = data.get('totp', '').strip()
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    advisor = AdvisorAuth.find_by_email(email)
    if not advisor:
        return jsonify({'error': 'Invalid email'}), 401
    
    # Verify identity with current code or TOTP
    verified = False
    if totp_current and advisor.verify_totp(totp_current):
        verified = True
    elif code and advisor.access_code == code and advisor.code_expires_at and datetime.utcnow() < advisor.code_expires_at:
        verified = True
    
    if not verified:
        return jsonify({'error': 'Invalid code or TOTP'}), 401
    
    # Generate new secret
    import pyotp
    advisor.otp_secret = pyotp.random_base32()
    
    try:
        db.session.commit()
        totp = pyotp.TOTP(advisor.otp_secret)
        return jsonify({
            'message': 'TOTP secret regenerated',
            'totp_qr': totp.provisioning_uri(name=email, issuer_name="UNO Course Equivalency"),
            'totp_secret': advisor.otp_secret
        })
    except Exception as e:
        db.session.rollback()
        print(f"Error regenerating TOTP: {e}")
        return jsonify({'error': 'Failed to regenerate TOTP'}), 500


# Admin routes for managing whitelisted advisors
@bp.route('/whitelist', methods=['GET'])
@require_admin
def get_whitelist():
    """Get all whitelisted advisor emails (admin only)."""
    advisors = AdvisorAuth.query.order_by(AdvisorAuth.added_at.desc()).all()
    return jsonify({
        'advisors': [advisor.to_dict() for advisor in advisors],
        'total': len(advisors)
    })


@bp.route('/whitelist', methods=['POST'])
@require_admin
def add_to_whitelist():
    """Add a single email to the whitelist (admin only)."""
    data = request.get_json()
    email = data.get('email', '').lower().strip()
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    # Validate email format (basic)
    if '@' not in email or '.' not in email.split('@')[1]:
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Check if already exists
    existing = AdvisorAuth.find_by_email(email)
    if existing:
        return jsonify({'error': 'Email already whitelisted'}), 409
    
    # Create new advisor auth entry
    advisor = AdvisorAuth(
        email=email,
        added_by=session.get('admin_email', 'admin')
    )
    
    try:
        db.session.add(advisor)
        db.session.commit()
        return jsonify({
            'message': 'Email added to whitelist',
            'advisor': advisor.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error adding to whitelist: {e}")
        return jsonify({'error': 'Failed to add email'}), 500


@bp.route('/whitelist/bulk', methods=['POST'])
@require_admin
def bulk_add_to_whitelist():
    """
    Bulk add emails to whitelist from CSV.
    Expects CSV with 'email' column or plain list of emails.
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'File must be a CSV'}), 400
    
    try:
        # Read CSV
        content = file.read().decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(content))
        
        added = []
        skipped = []
        errors = []
        
        for row in csv_reader:
            # Try to get email from 'email' column or first column
            email = row.get('email', '').lower().strip()
            if not email and row:
                # Try first value if no 'email' column
                email = list(row.values())[0].lower().strip()
            
            if not email or '@' not in email:
                errors.append(f"Invalid email: {email}")
                continue
            
            # Check if exists
            if AdvisorAuth.find_by_email(email):
                skipped.append(email)
                continue
            
            # Add to whitelist
            advisor = AdvisorAuth(
                email=email,
                added_by=session.get('admin_email', 'admin')
            )
            db.session.add(advisor)
            added.append(email)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully added {len(added)} emails',
            'added': added,
            'skipped': skipped,
            'errors': errors,
            'total_added': len(added)
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error processing CSV: {e}")
        return jsonify({'error': 'Failed to process CSV file'}), 500


@bp.route('/whitelist/<int:advisor_id>', methods=['DELETE'])
@require_admin
def remove_from_whitelist(advisor_id):
    """Remove an email from the whitelist (admin only)."""
    advisor = AdvisorAuth.query.get_or_404(advisor_id)
    
    try:
        db.session.delete(advisor)
        db.session.commit()
        return jsonify({'message': 'Email removed from whitelist'})
    except Exception as e:
        db.session.rollback()
        print(f"Error removing from whitelist: {e}")
        return jsonify({'error': 'Failed to remove email'}), 500


# ADVISOR CENTER - View and manage student plans
@bp.route('/advisor-center/plans', methods=['GET'])
def get_advisor_plans():
    """
    Get all plans associated with the authenticated advisor.
    Requires active advisor session.
    
    Query Parameters:
    - search: Search by student name, student email, or plan name
    - status: Filter by plan status (draft, active, completed, etc.)
    - program_id: Filter by target program ID
    - sort: Sort field (created_at, updated_at, student_name, plan_name)
    - order: Sort order (asc, desc)
    - limit: Number of results (default 50, max 200)
    - offset: Offset for pagination
    """
    # Check if advisor is authenticated
    session_token = request.headers.get('X-Advisor-Session-Token') or session.get('advisor_session_token')
    
    if not session_token:
        return jsonify({'error': 'Advisor authentication required'}), 401
    
    # Verify session token
    from models.advisor_auth import AdvisorAuth
    from datetime import datetime
    
    advisor = AdvisorAuth.query.filter_by(session_token=session_token).first()
    
    if not advisor:
        return jsonify({'error': 'Invalid session token'}), 401
    
    # Check if session is still valid
    if not advisor.session_expires_at or advisor.session_expires_at < datetime.utcnow():
        return jsonify({'error': 'Session expired. Please log in again.'}), 401
    
    # Get query parameters for filtering and search
    search_term = request.args.get('search', '').strip()
    status_filter = request.args.get('status', '').strip()
    program_id = request.args.get('program_id', type=int)
    sort_by = request.args.get('sort', 'updated_at')
    sort_order = request.args.get('order', 'desc')
    limit = min(int(request.args.get('limit', 50)), 200)  # Max 200 results
    offset = int(request.args.get('offset', 0))
    
    # Start building the query
    from models import Plan
    query = Plan.query.filter_by(advisor_email=advisor.email)
    
    # Apply search filter
    if search_term:
        search_pattern = f"%{search_term}%"
        query = query.filter(
            db.or_(
                Plan.student_name.ilike(search_pattern),
                Plan.student_email.ilike(search_pattern),
                Plan.plan_name.ilike(search_pattern),
                Plan.plan_code.ilike(search_pattern)
            )
        )
    
    # Apply status filter
    if status_filter:
        query = query.filter(Plan.status == status_filter)
    
    # Apply program filter
    if program_id:
        query = query.filter(Plan.program_id == program_id)
    
    # Apply sorting
    valid_sort_fields = ['created_at', 'updated_at', 'student_name', 'plan_name', 'status']
    if sort_by not in valid_sort_fields:
        sort_by = 'updated_at'
    
    sort_column = getattr(Plan, sort_by)
    if sort_order.lower() == 'asc':
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())
    
    # Get total count before pagination
    total_count = query.count()
    
    # Apply pagination
    plans = query.limit(limit).offset(offset).all()
    
    # Return results
    return jsonify({
        'plans': [plan.to_dict() for plan in plans],
        'total_count': total_count,
        'limit': limit,
        'offset': offset,
        'advisor_email': advisor.email
    })


@bp.route('/advisor-center/stats', methods=['GET'])
def get_advisor_stats():
    """
    Get statistics about plans for the authenticated advisor.
    Requires active advisor session.
    """
    # Check if advisor is authenticated
    session_token = request.headers.get('X-Advisor-Session-Token') or session.get('advisor_session_token')
    
    if not session_token:
        return jsonify({'error': 'Advisor authentication required'}), 401
    
    # Verify session token
    from models.advisor_auth import AdvisorAuth
    from datetime import datetime
    
    advisor = AdvisorAuth.query.filter_by(session_token=session_token).first()
    
    if not advisor:
        return jsonify({'error': 'Invalid session token'}), 401
    
    # Check if session is still valid
    if not advisor.session_expires_at or advisor.session_expires_at < datetime.utcnow():
        return jsonify({'error': 'Session expired. Please log in again.'}), 401
    
    # Get plan statistics
    from models import Plan
    from sqlalchemy import func
    
    total_plans = Plan.query.filter_by(advisor_email=advisor.email).count()
    
    # Plans by status
    status_counts = db.session.query(
        Plan.status, func.count(Plan.id)
    ).filter_by(advisor_email=advisor.email).group_by(Plan.status).all()
    
    # Recent plans (last 30 days)
    from datetime import timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_plans = Plan.query.filter_by(advisor_email=advisor.email).filter(
        Plan.created_at >= thirty_days_ago
    ).count()
    
    return jsonify({
        'total_plans': total_plans,
        'status_breakdown': {status: count for status, count in status_counts},
        'recent_plans_30_days': recent_plans,
        'advisor_email': advisor.email
    })
