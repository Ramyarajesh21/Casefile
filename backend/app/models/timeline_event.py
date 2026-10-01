from datetime import datetime
from app.database import db


class TimelineEvent(db.Model):
    __tablename__ = 'timeline_events'

    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey('cases.id'), nullable=False)
    event_time = db.Column(db.String(30), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    case_obj = db.relationship('Case', back_populates='timeline_events')

    def to_dict(self):
        return {
            'id': self.id,
            'case_id': self.case_id,
            'event_time': self.event_time,
            'title': self.title,
            'description': self.description,
        }
