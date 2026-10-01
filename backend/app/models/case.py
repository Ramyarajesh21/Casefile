from datetime import datetime
from app.database import db


class Case(db.Model):
    __tablename__ = 'cases'

    id = db.Column(db.Integer, primary_key=True)
    case_number = db.Column(db.String(20), unique=True, nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.String(40), nullable=False)
    location = db.Column(db.String(150), nullable=False)
    incident_date = db.Column(db.String(80), nullable=False)
    incident_time = db.Column(db.String(80), nullable=False)
    victim_name = db.Column(db.String(150), nullable=False)
    crime_type = db.Column(db.String(120), nullable=False)
    briefing = db.Column(db.Text, nullable=False)
    known_facts = db.Column(db.Text, nullable=False)
    witness_availability = db.Column(db.String(120), default='Available')
    clue_count = db.Column(db.Integer, default=0)
    suspect_count = db.Column(db.Integer, default=0)
    status = db.Column(db.String(40), default='open')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    investigations = db.relationship('Investigation', back_populates='case_obj')
    suspects = db.relationship('Suspect', back_populates='case_obj', cascade='all, delete-orphan')
    witnesses = db.relationship('Witness', back_populates='case_obj', cascade='all, delete-orphan')
    clues = db.relationship('Clue', back_populates='case_obj', cascade='all, delete-orphan')
    evidence = db.relationship('Evidence', back_populates='case_obj', cascade='all, delete-orphan')
    timeline_events = db.relationship('TimelineEvent', back_populates='case_obj', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'case_number': self.case_number,
            'title': self.title,
            'description': self.description,
            'difficulty': self.difficulty,
            'location': self.location,
            'incident_date': self.incident_date,
            'incident_time': self.incident_time,
            'victim_name': self.victim_name,
            'crime_type': self.crime_type,
            'briefing': self.briefing,
            'known_facts': self.known_facts,
            'witness_availability': self.witness_availability,
            'clue_count': self.clue_count,
            'suspect_count': self.suspect_count,
            'status': self.status,
        }
