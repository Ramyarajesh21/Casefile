from flask import Blueprint, jsonify, request

from app.database import db
from app.models.case import Case
from app.models.clue import Clue
from app.models.evidence import Evidence
from app.models.suspect import Suspect
from app.models.timeline_event import TimelineEvent
from app.models.witness import Witness
from app.utils.helpers import json_error

case_bp = Blueprint('cases', __name__)


@case_bp.get('/cases')
def list_cases():
    cases = Case.query.order_by(Case.id.asc()).all()
    return {'cases': [case.to_dict() for case in cases]}, 200


@case_bp.get('/cases/<int:case_id>')
def get_case(case_id):
    case = Case.query.get(case_id)
    if not case:
        return json_error('Case not found.', 404)
    return {'case': case.to_dict()}, 200


@case_bp.get('/cases/<int:case_id>/clues')
def get_case_clues(case_id):
    case = Case.query.get(case_id)
    if not case:
        return json_error('Case not found.', 404)
    return {'clues': [clue.to_dict() for clue in case.clues]}, 200


@case_bp.get('/cases/<int:case_id>/evidence')
def get_case_evidence(case_id):
    case = Case.query.get(case_id)
    if not case:
        return json_error('Case not found.', 404)
    return {'evidence': [item.to_dict() for item in case.evidence]}, 200


@case_bp.get('/cases/<int:case_id>/witnesses')
def get_case_witnesses(case_id):
    case = Case.query.get(case_id)
    if not case:
        return json_error('Case not found.', 404)
    return {'witnesses': [witness.to_dict() for witness in case.witnesses]}, 200


@case_bp.get('/cases/<int:case_id>/suspects')
def get_case_suspects(case_id):
    case = Case.query.get(case_id)
    if not case:
        return json_error('Case not found.', 404)
    return {'suspects': [suspect.to_dict() for suspect in case.suspects]}, 200


@case_bp.get('/cases/<int:case_id>/timeline')
def get_case_timeline(case_id):
    case = Case.query.get(case_id)
    if not case:
        return json_error('Case not found.', 404)
    return {'timeline': [event.to_dict() for event in case.timeline_events]}, 200


@case_bp.get('/witnesses/<int:witness_id>')
def get_witness(witness_id):
    witness = Witness.query.get(witness_id)
    if not witness:
        return json_error('Witness not found.', 404)
    return {'witness': witness.to_dict()}, 200
