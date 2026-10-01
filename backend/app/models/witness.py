from datetime import datetime
from app.database import db


class Witness(db.Model):
    __tablename__ = 'witnesses'

    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey('cases.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    occupation = db.Column(db.String(120), nullable=False)
    relationship_to_victim = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(150), nullable=False)
    interview_status = db.Column(db.String(40), default='pending')
    reliability = db.Column(db.String(40), default='truthful')
    statement = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    case_obj = db.relationship('Case', back_populates='witnesses')

    def to_dict(self):
        return {
            'id': self.id,
            'case_id': self.case_id,
            'name': self.name,
            'age': self.age,
            'occupation': self.occupation,
            'relationship_to_victim': self.relationship_to_victim,
            'location': self.location,
            'interview_status': self.interview_status,
            'reliability': self.reliability,
            'statement': self.statement,
        }
