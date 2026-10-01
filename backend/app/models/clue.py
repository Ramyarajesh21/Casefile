from datetime import datetime
from app.database import db


class Clue(db.Model):
    __tablename__ = 'clues'

    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey('cases.id'), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    clue_type = db.Column(db.String(60), nullable=False)
    location = db.Column(db.String(150), nullable=False)
    importance = db.Column(db.String(60), default='medium')
    discovery_condition = db.Column(db.String(80), default='visible')
    is_hidden = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    case_obj = db.relationship('Case', back_populates='clues')

    def to_dict(self):
        return {
            'id': self.id,
            'case_id': self.case_id,
            'name': self.name,
            'description': self.description,
            'type': self.clue_type,
            'location': self.location,
            'importance': self.importance,
            'discovery_condition': self.discovery_condition,
            'is_hidden': self.is_hidden,
        }
