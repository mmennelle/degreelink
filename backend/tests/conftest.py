# Ensure the backend package is importable when running tests from repo root
import os
import sys

THIS_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.abspath(os.path.join(THIS_DIR, '..'))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
