import json
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

    # Get query parameters
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 21, type=int)
    status_filter = request.args.get("status", "available")
    make_filter = request.args.get("make")
    model_filter = request.args.get("model")
    body_type_filter = request.args.get("bodyType")
    fuel_type_filter = request.args.get("fuelType")
    transmission_filter = request.args.get("transmission")
    condition_filter = request.args.get("condition")
    price_min = request.args.get("priceMin", type=int)
    price_max = request.args.get("priceMax", type=int)
    year_min = request.args.get("yearMin", type=int)
    year_max = request.args.get("yearMax", type=int)
    search_query = request.args.get("search")

    # Normalize string filters to lowercase to match stored data
    if status_filter:
        status_filter = status_filter.strip().lower()
    if make_filter:
        make_filter = make_filter.strip().lower()
    if model_filter:
        model_filter = model_filter.strip().lower()
    if body_type_filter:
        body_type_filter = body_type_filter.strip().lower()
    if fuel_type_filter:
        fuel_type_filter = fuel_type_filter.strip().lower()
    if transmission_filter:
        transmission_filter = transmission_filter.strip().lower()
    if condition_filter:
        condition_filter = condition_filter.strip().lower()

    # Safety limits
    page = max(1, page)
    per_page = min(max(1, per_page), 100)

    # Build query
    query = db.select(Car).options(joinedload(Car.seller)).order_by(Car.id)
    if status_filter:
        query = query.filter(Car.status == status_filter)
    if make_filter:
        query = query.filter(Car.make.ilike(make_filter))
    if model_filter:
        query = query.filter(Car.model.ilike(model_filter))
    if body_type_filter:
        query = query.filter(Car.bodyType == body_type_filter)
    if fuel_type_filter:
        query = query.filter(Car.fuelType == fuel_type_filter)
    if transmission_filter:
        query = query.filter(Car.transmission == transmission_filter)
    if condition_filter:
        query = query.filter(Car.condition == condition_filter)
    if price_min is not None:
        query = query.filter(Car.price >= price_min)
    if price_max is not None:
        query = query.filter(Car.price <= price_max)
    if year_min is not None:
        query = query.filter(Car.year >= year_min)
    if year_max is not None:
        query = query.filter(Car.year <= year_max)
    if search_query:
        search_term = f"%{search_query}%"
        query = query.filter(
            db.or_(
                Car.make.ilike(search_term),
                Car.model.ilike(search_term),
                Car.exteriorColor.ilike(search_term),
                Car.interiorColor.ilike(search_term),
                Car.description.ilike(search_term),
            )
        )

    pagination = db.paginate(
        query,
        page=page,
        per_page=per_page,
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
        if field == "images" and isinstance(value, list):
            value = json.dumps(value)
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
    for key, value in request_data.model_dump(
        exclude_unset=True, exclude={"seller"}
    ).items():
        if key == "images" and isinstance(value, list):
            value = json.dumps(value)
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
