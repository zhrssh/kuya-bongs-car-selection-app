from flask import Blueprint, request
from flask_login import login_required

from flaskr import status
from ..models.car import Car

bp = Blueprint("cars", __name__)


@bp.route("/cars", methods=["GET"])
def get_cars_list():
    """Get a list of all cars."""
    cars = Car.query.all()
    return {"data": cars}, status.HTTP_200_OK
