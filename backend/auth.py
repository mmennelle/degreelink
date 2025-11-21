"""Lightweight admin auth utilities.

Provides a minimal decorator to guard mutation endpoints without changing
public read functionality. Uses an ADMIN_API_TOKEN environment variable.
If the token is unset, decorator becomes a no-op (fails open) so existing
flows are not broken during transition.
"""
from functools import wraps
from flask import request, current_app, jsonify, session
import os
from hmac import compare_digest


def require_admin(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        # Check for advisor authentication first (advisors have admin privileges)
        advisor_token = request.headers.get('X-Advisor-Token') or session.get('advisor_token')
        if advisor_token:
            from models.advisor_auth import AdvisorAuth
            advisor = AdvisorAuth.find_by_session_token(advisor_token)
            if advisor and advisor.verify_session(advisor_token):
                # Valid advisor session - grant access
                request.advisor = advisor
                return f(*args, **kwargs)
        
        # Fall back to admin token check
        token = os.environ.get('ADMIN_API_TOKEN')
        fail_open = os.environ.get('ADMIN_FAIL_OPEN', 'false').lower() in ('1','true','yes','on')
        if not token:
            if fail_open:
                return f(*args, **kwargs)
            return jsonify({'error': {'message': 'Admin token not configured', 'code': 'unauthorized'}}), 401
        provided = request.headers.get('X-Admin-Token')
        # Use constant-time comparison to avoid timing side channels
        if not provided or not compare_digest(str(provided), str(token)):
            # Development diagnostics (do not leak full token)
            if current_app and current_app.debug:
                exp = token
                exp_len = len(exp) if exp else 0
                prov_len = len(provided) if provided else 0
                exp_preview = exp[:4] + '***' if exp_len >= 4 else '***'
                prov_preview = (provided[:4] + '***') if provided and len(provided) >= 4 else '***'
                print(f"[auth] Admin token check failed. Provided(len={prov_len}, head={prov_preview}) vs Expected(len={exp_len}, head={exp_preview}). Header present={bool(provided)}")
            return jsonify({'error': {'message': 'Admin or Advisor authentication required', 'code': 'unauthorized'}}), 401
        return f(*args, **kwargs)
    return wrapper


def require_advisor(f):
    """
    Decorator to require valid advisor authentication.
    Checks for X-Advisor-Token header or session token.
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        # Import here to avoid circular imports
        from models.advisor_auth import AdvisorAuth
        
        # Get token from header or session
        token = request.headers.get('X-Advisor-Token') or session.get('advisor_token')
        
        if not token:
            return jsonify({
                'error': {
                    'message': 'Advisor authentication required',
                    'code': 'unauthorized'
                }
            }), 401
        
        # Find advisor by token
        advisor = AdvisorAuth.find_by_session_token(token)
        
        if not advisor or not advisor.verify_session(token):
            # Clear invalid session
            session.pop('advisor_id', None)
            session.pop('advisor_email', None)
            session.pop('advisor_token', None)
            
            return jsonify({
                'error': {
                    'message': 'Invalid or expired advisor session',
                    'code': 'session_expired'
                }
            }), 401
        
        # Store advisor info in request context for use in the route
        request.advisor = advisor
        
        return f(*args, **kwargs)
    return wrapper
