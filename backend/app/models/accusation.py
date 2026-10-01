from datetime import datetime
from app.database import db


class Accusation(db.Model):
    __tablename__ = 'accusations'

    id = db.Column(db.Integer, primary_key=True)
    investigation_id = db.Column(db.Integer, db.ForeignKey('investigations.id'), nullable=False)
    culprit = db.Column(db.String(120), nullable=False)
    motive = db.Column(db.String(120), nullable=False)
    method = db.Column(db.String(120), nullable=False)
    evidence = db.Column(db.String(120), nullable=False)
    explanation = db.Column(db.Text, nullable=False)
    correct = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    investigation = db.relationship('Investigation', back_populates='accusation')

    def to_dict(self):
        return {
            'id': self.id,
            'investigation_id': self.investigation_id,
            'culprit': self.culprit,
            'motive': self.motive,
            'method': self.method,
            'evidence': self.evidence,
            'explanation': self.explanation,
            'correct': self.correct,
        }
