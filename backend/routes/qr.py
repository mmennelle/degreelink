"""
Degree Link - Course Equivalency and Transfer Planning System
Copyright (c) 2025 University of New Orleans - Computer Science Department
Author: Mitchell Mennelle

This file is part of Degree Link.
Licensed under the MIT License. See LICENSE file in the project root.
"""

import os
from flask import Blueprint, send_from_directory, abort


# Serve the QR code image located in frontend/src/assets at /api/qr
bp = Blueprint('qr', __name__, url_prefix='/api')


@bp.route('/qr', methods=['GET'])
def get_qr_image():
    try:
        filename = 'course-equiv-qr.png'

        # 1) Allow an explicit override via env var for production deployments
        override_path = os.environ.get('QR_IMAGE_PATH')
        if override_path:
            override_path = os.path.abspath(override_path)
            if os.path.isfile(override_path):
                directory, fname = os.path.dirname(override_path), os.path.basename(override_path)
                return send_from_directory(directory, fname, mimetype='image/png', as_attachment=False)

        # 2) Prefer a backend-local static directory so the backend can ship the asset
        routes_dir = os.path.dirname(__file__)
        backend_static_dir = os.path.abspath(os.path.join(routes_dir, '..', 'static'))
        backend_static_path = os.path.join(backend_static_dir, filename)
        if os.path.exists(backend_static_path):
            return send_from_directory(backend_static_dir, filename, mimetype='image/png', as_attachment=False)

        # 3) Fallback to the repo's frontend source assets (useful for dev)
        frontend_assets_dir = os.path.abspath(os.path.join(routes_dir, '..', '..', 'frontend', 'src', 'assets'))
        frontend_path = os.path.join(frontend_assets_dir, filename)
        if os.path.exists(frontend_path):
            return send_from_directory(frontend_assets_dir, filename, mimetype='image/png', as_attachment=False)

        abort(404, description='QR image not found')
    except Exception as e:
        abort(500, description=str(e))
