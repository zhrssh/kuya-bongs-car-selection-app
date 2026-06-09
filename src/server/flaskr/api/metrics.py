import logging

from flask import Blueprint, jsonify
from flaskr import status
from ..db import db
from ..models.car import Car
from ..models.lead import Lead
from ..models.enums.car import CarStatus

bp = Blueprint("metrics", __name__, url_prefix="/api")
logger = logging.getLogger(__name__)


@bp.route("/metrics", methods=["GET"])
def get_metrics():
    """Return aggregated dashboard metrics from the database."""
    car_counts = (
        db.session.query(Car.status, db.func.count(Car.id))
        .group_by(Car.status)
        .all()
    )
    counts = {row[0]: row[1] for row in car_counts}
    available = counts.get(CarStatus.available.value, 0)
    sold = counts.get(CarStatus.sold.value, 0)
    archived = counts.get(CarStatus.archived.value, 0)

    total_value = (
        db.session.query(db.func.sum(Car.price))
        .filter(Car.status == CarStatus.available)
        .scalar()
        or 0
    )

    avg_price = total_value // available if available > 0 else 0

    lead_count = db.session.query(db.func.count(Lead.id)).scalar()

    data = {
        "availableCars": available,
        "soldCars": sold,
        "archivedCars": archived,
        "totalValue": total_value,
        "avgPrice": avg_price,
        "totalLeads": lead_count,
    }

    return jsonify({"status": "success", "data": data}), status.HTTP_200_OK
