import logging

from flask import Blueprint, jsonify, request
from flask_login import login_required
from sqlalchemy.exc import OperationalError

from flaskr import status
from ..models.event_log import EventLog

bp = Blueprint("logs", __name__, url_prefix="/api")
logger = logging.getLogger(__name__)


@bp.route("/logs", methods=["GET"])
@login_required
def get_logs():
    try:
        log_type = request.args.get("type")
        limit = min(int(request.args.get("limit", 100)), 500)
        offset = int(request.args.get("offset", 0))

        query = EventLog.query.order_by(EventLog.created_at.desc())
        if log_type:
            query = query.filter(EventLog.type == log_type)

        total = query.count()
        logs = query.offset(offset).limit(limit).all()

        return jsonify({
            "status": "success",
            "data": {
                "logs": [
                    {
                        "id": log.id,
                        "createdAt": log.created_at.isoformat(),
                        "type": log.type,
                        "carId": log.car_id,
                        "carName": log.car_name,
                        "message": log.message,
                    }
                    for log in logs
                ],
                "total": total,
            }
        }), status.HTTP_200_OK
    except OperationalError:
        return jsonify({
            "status": "success",
            "data": {"logs": [], "total": 0}
        }), status.HTTP_200_OK



