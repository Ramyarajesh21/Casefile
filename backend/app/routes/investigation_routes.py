from datetime import datetime

from flask import Blueprint, request

from app.database import db
from app.models.accusation import Accusation
from app.models.case import Case
from app.models.case_result import CaseResult
from app.models.clue import Clue
from app.models.collected_evidence import CollectedEvidence
from app.models.deduction import Deduction
from app.models.discovered_clue import DiscoveredClue
from app.models.evidence import Evidence
from app.models.investigation import Investigation
from app.models.user import User
from app.models.witness import Witness
from app.models.witness_interview import WitnessInterview
from app.utils.helpers import json_error

investigation_bp = Blueprint('investigation', __name__)


def score_case(case, investigation):
    culprit = next((s for s in case.suspects if s.is_culprit), None)
    if not culprit:
        return 0, 0, 0, 'No culprit defined.'

    correct = 0
    proof = {
        'culprit': False,
        'motive': False,
        'method': False,
    }

    accusation = investigation.accusation
    if accusation:
        if accusation.culprit.lower() == culprit.name.lower():
            proof['culprit'] = True
            correct += 1
        if accusation.motive.lower() == culprit.possible_motive.lower()[:40]:
            proof['motive'] = True
            correct += 1
        if accusation.method.lower() in ['poisoning', 'strangulation', 'stabbing', 'fire', 'blackmail', 'forged ledger']:
            proof['method'] = True
            correct += 1

    base_score = 500 if proof['culprit'] else -200
    if proof['motive']:
        base_score += 200
    if proof['method']:
        base_score += 200
    base_score += len(investigation.discovered_clues) * 50
    base_score += len(investigation.collected_evidence) * 50
    base_score += len(investigation.witness_interviews) * 25
    base_score += len(investigation.deductions) * 50

    xp = max(0, base_score // 10)
    accuracy = min(100, max(0, (correct / 3) * 100))
    return base_score, xp, accuracy, 'Investigation complete.'


@investigation_bp.post('/investigations/start')
def start_investigation():
    data = request.get_json(silent=True) or {}
    user_id = data.get('user_id')
    case_id = data.get('case_id')
    if not user_id or not case_id:
        return json_error('User ID and case ID are required.', 400)

    user = User.query.get(user_id)
    case = Case.query.get(case_id)
    if not user or not case:
        return json_error('User or case not found.', 404)

    existing = Investigation.query.filter_by(user_id=user_id, case_id=case_id).first()
    if existing:
        return {'investigation': existing.to_dict(), 'message': 'Existing investigation retrieved.'}, 200

    investigation = Investigation(user_id=user_id, case_id=case_id, status='active', current_stage='briefing')
    db.session.add(investigation)
    db.session.commit()

    user.cases_attempted += 1
    db.session.commit()

    return {'investigation': investigation.to_dict(), 'message': 'Investigation started.'}, 201


@investigation_bp.get('/investigations/<int:investigation_id>')
def get_investigation(investigation_id):
    investigation = Investigation.query.get(investigation_id)
    if not investigation:
        return json_error('Investigation not found.', 404)
    return {'investigation': investigation.to_dict()}, 200


@investigation_bp.post('/investigations/<int:investigation_id>/clues/<int:clue_id>/discover')
def discover_clue(investigation_id, clue_id):
    investigation = Investigation.query.get(investigation_id)
    clue = Clue.query.get(clue_id)
    if not investigation or not clue:
        return json_error('Investigation or clue not found.', 404)

    existing = DiscoveredClue.query.filter_by(investigation_id=investigation_id, clue_id=clue_id).first()
    if existing:
        return {'message': 'Clue already discovered.', 'discovered': True}, 200

    discovered = DiscoveredClue(investigation_id=investigation_id, clue_id=clue_id)
    db.session.add(discovered)
    investigation.updated_at = datetime.utcnow()
    investigation.current_stage = 'clues'
    db.session.commit()
    return {'message': 'Clue discovered.', 'discovered': True}, 201


@investigation_bp.post('/investigations/<int:investigation_id>/evidence/<int:evidence_id>/collect')
def collect_evidence(investigation_id, evidence_id):
    investigation = Investigation.query.get(investigation_id)
    evidence = Evidence.query.get(evidence_id)
    if not investigation or not evidence:
        return json_error('Investigation or evidence not found.', 404)

    existing = CollectedEvidence.query.filter_by(investigation_id=investigation_id, evidence_id=evidence_id).first()
    if existing:
        return {'message': 'Evidence already collected.', 'collected': True}, 200

    collected = CollectedEvidence(investigation_id=investigation_id, evidence_id=evidence_id)
    db.session.add(collected)
    investigation.updated_at = datetime.utcnow()
    investigation.current_stage = 'evidence'
    db.session.commit()
    return {'message': 'Evidence collected.', 'collected': True}, 201


@investigation_bp.post('/investigations/<int:investigation_id>/witnesses/<int:witness_id>/interview')
def interview_witness(investigation_id, witness_id):
    investigation = Investigation.query.get(investigation_id)
    witness = Witness.query.get(witness_id)
    if not investigation or not witness:
        return json_error('Investigation or witness not found.', 404)

    question = request.get_json(silent=True) or {}
    question_text = question.get('question') or 'What did you see?'
    answer = witness.statement

    interview = WitnessInterview(investigation_id=investigation_id, witness_id=witness_id, question=question_text, answer=answer)
    db.session.add(interview)
    witness.interview_status = 'completed'
    investigation.updated_at = datetime.utcnow()
    investigation.current_stage = 'witnesses'
    db.session.commit()
    return {'message': 'Witness interview completed.', 'interview': interview.to_dict()}, 201


@investigation_bp.get('/investigations/<int:investigation_id>/deductions')
def list_deductions(investigation_id):
    investigation = Investigation.query.get(investigation_id)
    if not investigation:
        return json_error('Investigation not found.', 404)
    return {'deductions': [d.to_dict() for d in investigation.deductions]}, 200


@investigation_bp.post('/investigations/<int:investigation_id>/deductions')
def create_deduction(investigation_id):
    investigation = Investigation.query.get(investigation_id)
    if not investigation:
        return json_error('Investigation not found.', 404)
    data = request.get_json(silent=True) or {}
    item_a = (data.get('item_a') or '').strip()
    item_b = (data.get('item_b') or '').strip()
    reasoning = (data.get('reasoning') or '').strip()
    if not item_a or not item_b or not reasoning:
        return json_error('Item selection and reasoning are required.', 400)

    deduction = Deduction(investigation_id=investigation_id, item_a=item_a, item_b=item_b, reasoning=reasoning)
    db.session.add(deduction)
    investigation.current_stage = 'deduction'
    db.session.commit()
    return {'message': 'Deduction saved.', 'deduction': deduction.to_dict()}, 201


@investigation_bp.post('/investigations/<int:investigation_id>/accusation')
def submit_accusation(investigation_id):
    investigation = Investigation.query.get(investigation_id)
    if not investigation:
        return json_error('Investigation not found.', 404)
    case = Case.query.get(investigation.case_id)
    if not case:
        return json_error('Case not found.', 404)
    data = request.get_json(silent=True) or {}
    culprit = (data.get('culprit') or '').strip()
    motive = (data.get('motive') or '').strip()
    method = (data.get('method') or '').strip()
    evidence = (data.get('evidence') or '').strip()
    explanation = (data.get('explanation') or '').strip()

    if not culprit or not motive or not method or not evidence or not explanation:
        return json_error('All accusation fields are required.', 400)

    accusation = Accusation(
        investigation_id=investigation_id,
        culprit=culprit,
        motive=motive,
        method=method,
        evidence=evidence,
        explanation=explanation,
    )
    db.session.add(accusation)
    db.session.commit()
    investigation.current_stage = 'accusation'

    culprit_obj = next((s for s in case.suspects if s.is_culprit), None)
    correct = culprit_obj and culprit.lower() == culprit_obj.name.lower()
    score, xp, accuracy, feedback = score_case(case, investigation)

    is_solved = bool(correct)
    case_result = CaseResult(
        investigation_id=investigation_id,
        solved=is_solved,
        score=score,
        xp=xp,
        accuracy=accuracy,
        feedback=feedback,
        correct_clues=len(investigation.discovered_clues),
        correct_deductions=len(investigation.deductions),
    )
    db.session.add(case_result)
    investigation.score = score
    investigation.xp = xp
    investigation.status = 'completed'
    investigation.completed_at = datetime.utcnow()

    user = User.query.get(investigation.user_id)
    user.xp += xp
    if is_solved:
        user.cases_solved += 1
    user.cases_attempted = max(user.cases_attempted, 1)
    db.session.commit()

    return {'result': case_result.to_dict(), 'correct': is_solved, 'message': 'Final accusation submitted.'}, 201


@investigation_bp.get('/investigations/<int:investigation_id>/result')
def get_result(investigation_id):
    investigation = Investigation.query.get(investigation_id)
    if not investigation:
        return json_error('Investigation not found.', 404)
    result = investigation.result
    if not result:
        return json_error('Result not available yet.', 404)
    return {'result': result.to_dict()}, 200
