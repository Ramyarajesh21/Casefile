from datetime import datetime
from app.database import db


class WitnessInterview(db.Model):
    __tablename__ = 'witness_interviews'

    id = db.Column(db.Integer, primary_key=True)
    investigation_id = db.Column(db.Integer, db.ForeignKey('investigations.id'), nullable=False)
    witness_id = db.Column(db.Integer, db.ForeignKey('witnesses.id'), nullable=False)
    question = db.Column(db.String(200), nullable=False)
    answer = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    investigation = db.relationship('Investigation', back_populates='witness_interviews')
    witness = db.relationship('Witness')

    def to_dict(self):
        return {
            'id': self.id,
            'investigation_id': self.investigation_id,
            'witness_id': self.witness_id,
            'question': self.question,
            'answer': self.answer,
            'created_at': self.created_at.isoformat(),
        }
