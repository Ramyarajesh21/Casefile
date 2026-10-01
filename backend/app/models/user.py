from datetime import datetime
from app.database import db
import bcrypt


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(150), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    rank = db.Column(db.String(80), default='Rookie', nullable=False)
    xp = db.Column(db.Integer, default=0, nullable=False)
    cases_attempted = db.Column(db.Integer, default=0, nullable=False)
    cases_solved = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    investigations = db.relationship('Investigation', back_populates='user', cascade='all, delete-orphan')

    def set_password(self, password):
        password_bytes = password.encode('utf-8')
        self.password_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')

    def to_public_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'username': self.username,
            'email': self.email,
            'rank': self.rank,
            'xp': self.xp,
            'cases_attempted': self.cases_attempted,
            'cases_solved': self.cases_solved,
        }
