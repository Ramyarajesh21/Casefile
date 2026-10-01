from datetime import datetime
from app.database import db


class Evidence(db.Model):
    __tablename__ = 'evidence'

    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey('cases.id'), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    evidence_type = db.Column(db.String(60), nullable=False)
    location = db.Column(db.String(150), nullable=False)
    related_info = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    case_obj = db.relationship('Case', back_populates='evidence')

    def to_dict(self):
        return {
            'id': self.id,
            'case_id': self.case_id,
            'name': self.name,
            'description': self.description,
            'type': self.evidence_type,
            'location': self.location,
            'related_info': self.related_info,
        }
