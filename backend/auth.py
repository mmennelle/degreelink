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
        if not token:
            # Fail open for now (no behavior change if not configured)
            return f(*args, **kwargs)
        provided = request.headers.get('X-Admin-Token')
        if not provided or provided != token:
            return jsonify({'error': {'message': 'Admin token required', 'code': 'unauthorized'}}), 401
        return f(*args, **kwargs)
    return wrapper
