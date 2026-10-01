from datetime import datetime
from app.database import db


class Investigation(db.Model):
    __tablename__ = 'investigations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    case_id = db.Column(db.Integer, db.ForeignKey('cases.id'), nullable=False)
    status = db.Column(db.String(40), default='active', nullable=False)
    started_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    completed_at = db.Column(db.DateTime, nullable=True)
    score = db.Column(db.Integer, default=0, nullable=False)
    xp = db.Column(db.Integer, default=0, nullable=False)
    current_stage = db.Column(db.String(40), default='briefing', nullable=False)

    user = db.relationship('User', back_populates='investigations')
    case_obj = db.relationship('Case', back_populates='investigations')
    discovered_clues = db.relationship('DiscoveredClue', back_populates='investigation', cascade='all, delete-orphan')
    collected_evidence = db.relationship('CollectedEvidence', back_populates='investigation', cascade='all, delete-orphan')
    witness_interviews = db.relationship('WitnessInterview', back_populates='investigation', cascade='all, delete-orphan')
    deductions = db.relationship('Deduction', back_populates='investigation', cascade='all, delete-orphan')
    accusation = db.relationship('Accusation', back_populates='investigation', uselist=False, cascade='all, delete-orphan')
    result = db.relationship('CaseResult', back_populates='investigation', uselist=False, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'case_id': self.case_id,
            'status': self.status,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'score': self.score,
            'xp': self.xp,
            'current_stage': self.current_stage,
        }
