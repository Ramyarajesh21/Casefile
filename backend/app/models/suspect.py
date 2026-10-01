from datetime import datetime
from app.database import db


class Suspect(db.Model):
    __tablename__ = 'suspects'

    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey('cases.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    occupation = db.Column(db.String(120), nullable=False)
    relationship_to_victim = db.Column(db.String(120), nullable=False)
    possible_motive = db.Column(db.Text, nullable=False)
    alibi = db.Column(db.Text, nullable=False)
    known_information = db.Column(db.Text, nullable=False)
    is_culprit = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    case_obj = db.relationship('Case', back_populates='suspects')

    def to_dict(self):
        return {
            'id': self.id,
            'case_id': self.case_id,
            'name': self.name,
            'age': self.age,
            'occupation': self.occupation,
            'relationship_to_victim': self.relationship_to_victim,
            'possible_motive': self.possible_motive,
            'alibi': self.alibi,
            'known_information': self.known_information,
            'is_culprit': self.is_culprit,
        }
