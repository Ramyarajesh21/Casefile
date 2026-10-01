from datetime import datetime
from functools import wraps

from flask import g, jsonify
from werkzeug.security import check_password_hash


def json_error(message, status_code=400):
    response = jsonify({'error': message})
    response.status_code = status_code
    return response


def serialize_datetime(value):
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.isoformat()
    return value


def get_token_from_request():
    auth_header = None
    if hasattr(g, 'request'):
        auth_header = g.request.headers.get('Authorization')
    else:
        from flask import request
        auth_header = request.headers.get('Authorization')

    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    return auth_header.split(' ')[1]


def require_authentication(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        from flask import request
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            return json_error('Authentication required.', 401)
        return func(*args, **kwargs)

    return wrapper


def password_matches(stored_hash, candidate):
    return check_password_hash(stored_hash, candidate)
