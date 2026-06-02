import logging
from flask import Blueprint, jsonify
from flask_login import login_required

from flaskr import status
from ..models.car import Car

bp = Blueprint("cars", __name__, url_prefix="/api")
logger = logging.getLogger(__name__)


@bp.route("/cars", methods=["GET"])
def get_cars_list():
    """Get a list of all cars."""
    logger.info("Request to get all cars")
    cars = Car.query.all()
    logger.debug("Cars: %s", cars)
    return jsonify({"data": [car.to_dict() for car in cars]}), status.HTTP_200_OK
