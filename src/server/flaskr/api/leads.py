import uuid
import logging
from flask import Blueprint, jsonify
from flask_login import login_required
from flaskr import status
from ..models.lead import Lead
from ..db import db

bp = Blueprint("leads", __name__, url_prefix="/api/leads")
logger = logging.getLogger(__name__)


@bp.route("/<lead_id>", methods=["DELETE"])
@login_required
def delete_lead(lead_id):
    """Delete a lead record (admin-only)."""
    try:
        lead_id = uuid.UUID(lead_id)
    except ValueError:
        return (
            jsonify({"status": "fail", "data": {"id": "Invalid lead id."}}),
            status.HTTP_400_BAD_REQUEST,
        )

    lead = db.session.get(Lead, lead_id)
    if not lead:
        return (
            jsonify({"status": "fail", "data": {"id": "Lead not found."}}),
            status.HTTP_404_NOT_FOUND,
        )

    db.session.delete(lead)
    db.session.commit()
    logger.info("Lead %s deleted", lead_id)

    return (
        jsonify({"status": "success", "message": "Lead deleted successfully."}),
        status.HTTP_200_OK,
    )
