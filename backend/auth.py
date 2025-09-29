"""Lightweight admin auth utilities.

Provides a minimal decorator to guard mutation endpoints without changing
public read functionality. Uses an ADMIN_API_TOKEN environment variable.
If the token is unset, decorator becomes a no-op (fails open) so existing
flows are not broken during transition.
"""
from functools import wraps
from flask import request, current_app, jsonify
import os

def require_admin(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = os.environ.get('ADMIN_API_TOKEN')
        fail_open = os.environ.get('ADMIN_FAIL_OPEN', 'true').lower() in ('1','true','yes','on')
        if not token:
            if fail_open:
                return f(*args, **kwargs)
            return jsonify({'error': {'message': 'Admin token not configured', 'code': 'unauthorized'}}), 401
        provided = request.headers.get('X-Admin-Token')
        if not provided or provided != token:
            # Development diagnostics (do not leak full token)
            if current_app and current_app.debug:
                exp = token
                exp_len = len(exp) if exp else 0
                prov_len = len(provided) if provided else 0
                exp_preview = exp[:4] + '***' if exp_len >= 4 else '***'
                prov_preview = (provided[:4] + '***') if provided and len(provided) >= 4 else '***'
                print(f"[auth] Admin token check failed. Provided(len={prov_len}, head={prov_preview}) vs Expected(len={exp_len}, head={exp_preview}). Header present={bool(provided)}")
            return jsonify({'error': {'message': 'Admin token required', 'code': 'unauthorized'}}), 401
        return f(*args, **kwargs)
    return wrapper
