import bcrypt
from flask import Blueprint, request, session as flask_session
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_

from app.database import db
from app.models.user import User
from app.utils.helpers import json_error


auth_bp = Blueprint('auth', __name__)


@auth_bp.post('/auth/register')
def register():
    data = request.get_json(silent=True) or {}
    full_name = (data.get('full_name') or '').strip()
    username = (data.get('username') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    confirm_password = data.get('confirm_password') or ''

    if not full_name or not username or not email or not password:
        return json_error('All fields are required.', 400)
    if '@' not in email or '.' not in email:
        return json_error('Please enter a valid email address.', 400)
    if len(password) < 8:
        return json_error('Password must be at least 8 characters.', 400)
    if password != confirm_password:
        return json_error('Passwords do not match.', 400)

    if User.query.filter(or_(User.username == username, User.email == email)).first():
        return json_error('Username or email already exists.', 409)

    user = User(full_name=full_name, username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return {'message': 'Registration successful.', 'user': user.to_public_dict()}, 201


@auth_bp.post('/auth/login')
def login():
    data = request.get_json(silent=True) or {}
    username_or_email = (data.get('username') or data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not username_or_email or not password:
        return json_error('Username/email and password are required.', 400)

    user = User.query.filter(or_(User.username == username_or_email, User.email == username_or_email)).first()
    if not user or not user.password_hash:
        return json_error('Invalid credentials.', 401)

    try:
        password_matches = bcrypt.checkpw(
            password.encode('utf-8'),
            user.password_hash.encode('utf-8'),
        )
    except (TypeError, ValueError):
        password_matches = False
    if not password_matches:
        return json_error('Invalid credentials.', 401)

    flask_session.clear()
    flask_session['user_id'] = user.id
    return {'message': 'Login successful.', 'user': user.to_public_dict()}, 200


@auth_bp.get('/auth/me')
def get_current_user():
    user_id = flask_session.get('user_id')
    if not user_id:
        return json_error('Authentication required. Please sign in again.', 401)
    user = db.session.get(User, user_id)
    if not user:
        flask_session.clear()
        return json_error('User not found.', 404)
    return {'user': user.to_public_dict()}, 200


@auth_bp.post('/auth/logout')
def logout():
    flask_session.clear()
    return {'message': 'Signed out successfully.'}, 200


@auth_bp.delete('/auth/account')
def delete_account():
    user_id = flask_session.get('user_id')
    if not user_id:
        return json_error('Authentication required. Please sign in again.', 401)

    try:
        with db.session.begin():
            user = db.session.get(User, user_id)
            if not user:
                flask_session.clear()
                return json_error('User not found.', 404)

            db.session.execute(
                text('DELETE FROM user_statistics WHERE user_id = :user_id'),
                {'user_id': user_id},
            )
            db.session.delete(user)
    except SQLAlchemyError:
        db.session.rollback()
        return json_error('Account could not be deleted. Please try again.', 500)

    flask_session.clear()
    return {'message': 'Account deleted successfully.'}, 200
