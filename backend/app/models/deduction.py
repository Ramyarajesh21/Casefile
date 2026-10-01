from datetime import datetime
from app.database import db


class Deduction(db.Model):
    __tablename__ = 'deductions'

    id = db.Column(db.Integer, primary_key=True)
    investigation_id = db.Column(db.Integer, db.ForeignKey('investigations.id'), nullable=False)
    item_a = db.Column(db.String(120), nullable=False)
    item_b = db.Column(db.String(120), nullable=False)
    reasoning = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    investigation = db.relationship('Investigation', back_populates='deductions')

    def to_dict(self):
        return {
            'id': self.id,
            'investigation_id': self.investigation_id,
            'item_a': self.item_a,
            'item_b': self.item_b,
            'reasoning': self.reasoning,
            'created_at': self.created_at.isoformat(),
        }
