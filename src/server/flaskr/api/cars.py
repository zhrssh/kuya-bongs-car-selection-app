import logging

from flask import Blueprint, jsonify, request
from flask_login import login_required

from flaskr import status
from ..db import db
from ..models.event_log import EventLog
from flaskr.repositories.car_repository import CarRepository
from flaskr.services.car_service import CarService
from flaskr.services.exceptions import (
    CarCreationError,
    CarNotFoundError,
    InvalidCarIdError,
)

bp = Blueprint("cars", __name__, url_prefix="/api")
logger = logging.getLogger(__name__)


def _build_service() -> CarService:
    return CarService(CarRepository())


@bp.route("/cars", methods=["GET"])
def get_cars_list():
    logger.info("Request to get all cars")
    service = _build_service()
    result = service.get_filtered_cars(request.args)
    return jsonify(result), status.HTTP_200_OK


@bp.route("/cars/<car_id>", methods=["GET"])
def get_car_by_id(car_id):
    logger.info("Request to get car by id: %s", car_id)
    service = _build_service()
    try:
        car = service.get_car_by_id(car_id)
        return (
            jsonify({"status": "success", "data": {"car": car}}),
            status.HTTP_200_OK,
        )
    except InvalidCarIdError:
        return (
            jsonify({"status": "fail", "data": {"id": "Invalid car id."}}),
            status.HTTP_400_BAD_REQUEST,
        )
    except CarNotFoundError:
        return (
            jsonify({"status": "fail", "data": {"id": "Car not found."}}),
            status.HTTP_404_NOT_FOUND,
        )


@bp.route("/cars/<car_id>", methods=["PUT"])
@login_required
def update_car_by_id(car_id):
    logger.info("Request to update car by id: %s", car_id)
    service = _build_service()
    try:
        car = service.update_car(car_id, request.get_json())
        EventLog.safe_log(
            type="update",
            car_id=str(car_id),
            car_name=f"{car['make']} {car['model']}",
            message=f"Listing updated: {car['make']} {car['model']} ({car.get('year', '')}) — details revised",
        )
        return (
            jsonify({"status": "success", "data": {"car": car}}),
            status.HTTP_200_OK,
        )
    except InvalidCarIdError:
        return (
            jsonify({"status": "fail", "data": {"id": "Invalid car id."}}),
            status.HTTP_400_BAD_REQUEST,
        )
    except CarNotFoundError:
        return (
            jsonify({"status": "fail", "data": {"id": "Car not found."}}),
            status.HTTP_404_NOT_FOUND,
        )


@bp.route("/cars/<car_id>", methods=["DELETE"])
@login_required
def delete_car_by_id(car_id):
    logger.info("Request to delete car by id: %s", car_id)
    service = _build_service()
    try:
        car = service.get_car_by_id(car_id)
        car_name = f"{car['make']} {car['model']}"
    except (InvalidCarIdError, CarNotFoundError):
        car_name = "Unknown"

    try:
        service.delete_car(car_id)
        EventLog.safe_log(
            type="delete",
            car_id=str(car_id),
            car_name=car_name,
            message=f"Listing removed: {car_name} deleted from inventory",
        )
    except InvalidCarIdError:
        return (
            jsonify({"status": "fail", "data": {"id": "Invalid car id."}}),
            status.HTTP_400_BAD_REQUEST,
        )
    return (
        "",
        status.HTTP_204_NO_CONTENT,
    )


@bp.route("/cars", methods=["POST"])
@login_required
def create_car():
    logger.info("Request to create a new car")
    service = _build_service()
    try:
        car = service.create_car(request.get_json())
        EventLog.safe_log(
            type="create",
            car_id=str(car["id"]),
            car_name=f"{car['make']} {car['model']}",
            message=f"Published new listing: {car['make']} {car['model']} ({car.get('year', '')}) added to inventory",
        )
        return (
            jsonify({"status": "success", "data": {"car": car}}),
            status.HTTP_201_CREATED,
        )
    except CarCreationError:
        return (
            jsonify(
                {"status": "fail", "data": {"car": "Car data is invalid."}}
            ),
            status.HTTP_400_BAD_REQUEST,
        )
