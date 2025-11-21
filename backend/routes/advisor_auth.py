"""Routes for advisor authentication system."""
from flask import Blueprint, request, jsonify, session
from models import db
from models.advisor_auth import AdvisorAuth
from auth import require_admin
from datetime import datetime
import csv
import io

bp = Blueprint('advisor_auth', __name__, url_prefix='/api/advisor-auth')


# Helper to send email (configure for production)
def send_access_code_email(email, code):
    """
    Send access code to advisor's email.
    In development: Returns code in response for display in alert
    In production: Configure SMTP/email service below
    
    NOTE: Until SMTP is configured for dlink.cs.uno.edu, use backdoor code: 089292
    """
    import os
    
    # Development mode - return code for frontend alert display
    if os.environ.get('FLASK_ENV') != 'production':
        print(f"[EMAIL DEV MODE] Code for {email}: {code}")
        print(f"[BACKDOOR] Persistent code '089292' also works for any whitelisted email")
        return True
    
    # PRODUCTION: Uncomment and configure your email service
    # 
    # Option 1: SMTP Configuration
    # import smtplib
    # from email.mime.text import MIMEText
    # from email.mime.multipart import MIMEMultipart
    # 
    # smtp_host = 'smtp.your-provider.com'  # e.g., 'smtp.gmail.com', 'smtp.sendgrid.net'
    # smtp_port = 587  # or 465 for SSL
    # smtp_user = 'your-email@domain.com'  # SMTP username
    # smtp_pass = os.environ.get('SMTP_PASSWORD')  # Store password in environment variable
    # from_email = 'noreply@yourdomain.edu'
    # 
    # msg = MIMEMultipart('alternative')
    # msg['Subject'] = 'Your Advisor Portal Access Code'
    # msg['From'] = from_email
    # msg['To'] = email
    # 
    # html = f"""<html>
    # <body>
    #     <h2>Advisor Portal Access Code</h2>
    #     <p>Your access code is: <strong>{code}</strong></p>
    #     <p>This code expires in 15 minutes.</p>
    # </body>
    # </html>"""
    # 
    # msg.attach(MIMEText(html, 'html'))
    # 
    # with smtplib.SMTP(smtp_host, smtp_port) as server:
    #     server.starttls()
    #     server.login(smtp_user, smtp_pass)
    #     server.sendmail(from_email, email, msg.as_string())
    # 
    # return True
    #
    # Option 2: SendGrid
    # import sendgrid
    # from sendgrid.helpers.mail import Mail
    # 
    # sg = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))
    # message = Mail(
    #     from_email='noreply@yourdomain.edu',
    #     to_emails=email,
    #     subject='Your Advisor Portal Access Code',
    #     html_content=f'<p>Your code: <strong>{code}</strong></p>'
    # )
    # sg.send(message)
    # return True
    #
    # Option 3: AWS SES
    # import boto3
    # 
    # client = boto3.client('ses', region_name='us-east-1')
    # client.send_email(
    #     Source='noreply@yourdomain.edu',
    #     Destination={'ToAddresses': [email]},
    #     Message={
    #         'Subject': {'Data': 'Your Advisor Portal Access Code'},
    #         'Body': {'Html': {'Data': f'<p>Your code: <strong>{code}</strong></p>'}}
    #     }
    # )
    # return True
    
    # If production email not configured, fail
    print(f"[EMAIL ERROR] Production email not configured")
    return False


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
    
    # Generate and save code
    code = advisor.generate_access_code()
    
    try:
        db.session.commit()
        
        # Send email with code
        if send_access_code_email(email, code):
            response_data = {
                'message': 'Access code sent to your email. It will expire in 15 minutes.',
                'email': email
            }
            
            # In development mode, include code in response for alert display
            import os
            if os.environ.get('FLASK_ENV') != 'production':
                response_data['dev_code'] = code  # Frontend will display this in an alert
                response_data['dev_mode'] = True
                response_data['backdoor_code'] = '089292'  # Persistent backdoor until SMTP configured
            
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
    Verify the access code and create a session if valid.
    Returns session token for subsequent requests.
    """
    data = request.get_json()
    email = data.get('email', '').lower().strip()
    code = data.get('code', '').strip()
    
    if not email or not code:
        return jsonify({'error': 'Email and code are required'}), 400
    
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
    
    # Verify code
    if advisor.verify_code(code):
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
            print(f"Error during verification: {e}")
            return jsonify({'error': 'Authentication failed'}), 500
    else:
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
            'error': 'Invalid or expired code',
            'attempts_remaining': max(0, 5 - advisor.failed_attempts)
        }), 401


@bp.route('/verify-session', methods=['GET'])
def verify_session():
    """Check if current session is valid."""
    token = request.headers.get('X-Advisor-Token') or session.get('advisor_token')
    
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
