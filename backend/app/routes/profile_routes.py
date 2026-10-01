from flask import Blueprint

from app.models.user import User
from app.models.investigation import Investigation
from app.models.case_result import CaseResult
from app.utils.helpers import json_error

profile_bp = Blueprint('profile', __name__)


@profile_bp.get('/profile')
def get_profile():
    username = 'detective_demo'
    user = User.query.filter_by(username=username).first()
    if not user:
        return json_error('Profile not found.', 404)
    return {'user': user.to_public_dict()}, 200


@profile_bp.get('/profile/statistics')
def get_statistics():
    username = 'detective_demo'
    user = User.query.filter_by(username=username).first()
    if not user:
        return json_error('Profile not found.', 404)

    investigations = Investigation.query.filter_by(user_id=user.id).all()
    total = len(investigations)
    solved = sum(1 for inv in investigations if inv.status == 'completed' and (inv.result and inv.result.solved))
    failed = total - solved
    average_score = sum(inv.score for inv in investigations) / total if total else 0
    return {
        'user': user.to_public_dict(),
        'total_investigations': total,
        'cases_solved': solved,
        'cases_failed': failed,
        'success_rate': round((solved / total) * 100, 2) if total else 0,
        'average_score': round(average_score, 2),
        'total_xp': user.xp,
        'current_rank': user.rank,
        'history': [
            {
                'id': inv.id,
                'case_id': inv.case_id,
                'score': inv.score,
                'xp': inv.xp,
                'status': inv.status,
                'completed_at': inv.completed_at.isoformat() if inv.completed_at else None,
                'result': inv.result.to_dict() if inv.result else None,
            }
            for inv in investigations
        ],
    }, 200
