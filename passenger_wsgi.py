"""
cPanel Phusion Passenger WSGI entry point for Django.
This file is required by cPanel's 'Setup Python App' (CloudLinux Passenger).
"""

import os
import sys

# Ensure current application directory is in Python's search path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

# Switch working directory to app directory so .env and relative paths resolve
try:
    os.chdir(CURRENT_DIR)
except Exception:
    pass

# Load .env explicitly before settings initialize
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(CURRENT_DIR, '.env'))
except Exception:
    pass

# Set default settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Initialize Django application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
