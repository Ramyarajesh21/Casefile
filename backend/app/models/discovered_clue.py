from datetime import datetime
from app.database import db


class DiscoveredClue(db.Model):
    __tablename__ = 'discovered_clues'

    id = db.Column(db.Integer, primary_key=True)
    investigation_id = db.Column(db.Integer, db.ForeignKey('investigations.id'), nullable=False)
    clue_id = db.Column(db.Integer, db.ForeignKey('clues.id'), nullable=False)
    discovered_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    investigation = db.relationship('Investigation', back_populates='discovered_clues')
    clue = db.relationship('Clue')

    def to_dict(self):
        return {'id': self.id, 'investigation_id': self.investigation_id, 'clue_id': self.clue_id, 'discovered_at': self.discovered_at.isoformat()}
