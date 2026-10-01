from datetime import datetime
from app.database import db


class CaseResult(db.Model):
    __tablename__ = 'case_results'

    id = db.Column(db.Integer, primary_key=True)
    investigation_id = db.Column(db.Integer, db.ForeignKey('investigations.id'), nullable=False)
    solved = db.Column(db.Boolean, default=False, nullable=False)
    score = db.Column(db.Integer, default=0, nullable=False)
    xp = db.Column(db.Integer, default=0, nullable=False)
    accuracy = db.Column(db.Float, default=0.0, nullable=False)
    feedback = db.Column(db.Text, nullable=False)
    correct_clues = db.Column(db.Integer, default=0, nullable=False)
    correct_deductions = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    investigation = db.relationship('Investigation', back_populates='result')

    def to_dict(self):
        return {
            'id': self.id,
            'investigation_id': self.investigation_id,
            'solved': self.solved,
            'score': self.score,
            'xp': self.xp,
            'accuracy': self.accuracy,
            'feedback': self.feedback,
            'correct_clues': self.correct_clues,
            'correct_deductions': self.correct_deductions,
        }
