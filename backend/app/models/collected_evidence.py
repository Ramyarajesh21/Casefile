from datetime import datetime
from app.database import db


class CollectedEvidence(db.Model):
    __tablename__ = 'collected_evidence'

    id = db.Column(db.Integer, primary_key=True)
    investigation_id = db.Column(db.Integer, db.ForeignKey('investigations.id'), nullable=False)
    evidence_id = db.Column(db.Integer, db.ForeignKey('evidence.id'), nullable=False)
    collected_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    investigation = db.relationship('Investigation', back_populates='collected_evidence')
    evidence = db.relationship('Evidence')

    def to_dict(self):
        return {'id': self.id, 'investigation_id': self.investigation_id, 'evidence_id': self.evidence_id, 'collected_at': self.collected_at.isoformat()}
