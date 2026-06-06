import logging
import uuid
from flask import Blueprint, jsonify, request
from flask_login import login_required
from sqlalchemy.orm import joinedload

import pydantic_core

from flaskr import status
from ..db import db
from ..models.car import Car
from .schemas.car import CarSchema

bp = Blueprint("cars", __name__, url_prefix="/api")
logger = logging.getLogger(__name__)


@bp.route("/cars", methods=["GET"])
def get_cars_list():
    """Get a paginated list of cars."""
    logger.info("Request to get all cars")

    pagination = db.paginate(
        db.select(Car).options(joinedload(Car.seller)).order_by(Car.id),
        max_per_page=20,
    )

    logger.debug("Cars page: %s", pagination.items)

    return (
        jsonify(
            {
                "status": "success",
                "data": {
                    "cars": [
                        CarSchema.model_validate(car).model_dump()
                        for car in pagination.items
                    ],
                    "pagination": {
                        "page": pagination.page,
                        "per_page": pagination.per_page,
                        "total": pagination.total,
                        "pages": pagination.pages,
                        "has_next": pagination.has_next,
                        "has_prev": pagination.has_prev,
                    },
                },
            }
        ),
        status.HTTP_200_OK,
    )


@bp.route("/cars/<car_id>", methods=["GET"])
def get_car_by_id(car_id):
    """Get a car by id."""
    logger.info("Request to get car by id: %s", car_id)

    # Sanitize the input id
    try:
        car_id = uuid.UUID(car_id)
    except ValueError:
        return (
            jsonify({"status": "fail", "data": {"id": "Invalid car id."}}),
            status.HTTP_400_BAD_REQUEST,
        )

    car = Car.query.options(joinedload(Car.seller)).filter_by(id=car_id).first()
    if not car:
        return (
            jsonify({"status": "fail", "data": {"id": "Car not found."}}),
            status.HTTP_404_NOT_FOUND,
        )

    return (
        jsonify(
            {
                "status": "success",
                "data": {"car": CarSchema.model_validate(car).model_dump()},
            }
        ),
        status.HTTP_200_OK,
    )


@bp.route("/cars/<car_id>", methods=["PUT"])
def update_car_by_id(car_id):
    """Update a car by id."""
    logger.info("Request to update car by id: %s", car_id)

    # Sanitize the input id
    try:
        car_id = uuid.UUID(car_id)
    except ValueError:
        return (
            jsonify({"status": "fail", "data": {"id": "Invalid car id."}}),
            status.HTTP_400_BAD_REQUEST,
        )

    # Check if car to update exists
    car = Car.query.options(joinedload(Car.seller)).filter_by(id=car_id).first()
    if not car:
        return (
            jsonify({"status": "fail", "data": {"id": "Car not found."}}),
            status.HTTP_404_NOT_FOUND,
        )

    # Fetch the request data
    request_data = CarSchema(**request.get_json())
    update_data = request_data.model_dump(exclude_unset=True, exclude={"id", "seller"})
    logger.debug("Request data: %s", update_data)

    # Update the car fields
    for field, value in update_data.items():
        setattr(car, field, value)
    car.update()  # Update the car

    return (
        jsonify(
            {
                "status": "success",
                "data": {"car": CarSchema.model_validate(car).model_dump()},
            }
        ),
        status.HTTP_200_OK,
    )


@bp.route("/cars/<car_id>", methods=["DELETE"])
def delete_car_by_id(car_id):
    """Delete a car by id."""
    logger.info("Request to delete car by id: %s", car_id)

    # Sanitize the input id
    try:
        car_id = uuid.UUID(car_id)
    except ValueError:
        return (
            jsonify({"status": "fail", "data": {"id": "Invalid car id."}}),
            status.HTTP_400_BAD_REQUEST,
        )

    # Check if car to delete exists
    car = Car.query.options(joinedload(Car.seller)).filter_by(id=car_id).first()
    if not car:
        logger.info("Car not found: %s", car_id)
        return (
            "",
            status.HTTP_204_NO_CONTENT,
        )

    # Delete the car
    car.delete()
    logger.debug("Deleted car: %s", car)

    return (
        "",
        status.HTTP_204_NO_CONTENT,
    )


@bp.route("/cars", methods=["POST"])
def create_car():
    """Create a new car."""
    logger.info("Request to create a new car")

    # Fetch the request data
    try:
        request_data = CarSchema(**request.get_json())
        logger.debug("Request data: %s", request_data)
    except pydantic_core.ValidationError as e:
        logger.error("Invalid request data: %s", e)
        return (
            jsonify(
                {
                    "status": "fail",
                    "data": {"car": "Car data is invalid."},
                }
            ),
            status.HTTP_400_BAD_REQUEST,
        )

    # Create the car
    car = Car()
    for key, value in request_data.model_dump(exclude_unset=True).items():
        setattr(car, key, value)

    try:
        car.create()
        logger.debug("Created car: %s", car)
    except Exception as e:
        logger.error("Failed to create car: %s", e)
        return (
            jsonify(
                {"status": "fail", "message": "There was an error creating the car."}
            ),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return (
        jsonify(
            {
                "status": "success",
                "data": {"car": CarSchema.model_validate(car).model_dump()},
            }
        ),
        status.HTTP_201_CREATED,
    )
