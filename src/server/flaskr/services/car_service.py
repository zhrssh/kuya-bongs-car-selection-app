import json
import logging
import uuid

import pydantic_core

from flaskr.models.car import Car
from flaskr.api.schemas.car import CarSchema
from flaskr.repositories.car_repository import CarRepository
from flaskr.services.exceptions import (
    CarCreationError,
    CarNotFoundError,
    InvalidCarIdError,
)

logger = logging.getLogger(__name__)


class CarService:
    def __init__(self, repository: CarRepository):
        self.repository = repository

    def get_filtered_cars(self, params: dict) -> dict:
        page = self._safe_int(params.get("page"), 1)
        per_page = self._safe_int(params.get("per_page"), 21)

        page = max(1, page)
        per_page = min(max(1, per_page), 100)

        filters = self._normalize_filters(params)

        pagination = self.repository.get_paginated(filters, page, per_page)

        return {
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

    def get_car_by_id(self, car_id_str: str) -> dict:
        car_id = self._parse_car_id(car_id_str)
        car = self.repository.get_by_id(car_id)
        if not car:
            raise CarNotFoundError
        return CarSchema.model_validate(car).model_dump()

    def create_car(self, data: dict) -> dict:
        try:
            request_data = CarSchema(**data)
        except pydantic_core.ValidationError as e:
            logger.error("Invalid request data: %s", e)
            raise CarCreationError from e

        car = Car()
        for key, value in request_data.model_dump(
            exclude_unset=True, exclude={"seller"}
        ).items():
            if key == "images" and isinstance(value, list):
                value = json.dumps(value)
            setattr(car, key, value)

        try:
            self.repository.save(car)
        except Exception as e:
            logger.error("Failed to create car: %s", e)
            raise CarCreationError from e

        return CarSchema.model_validate(car).model_dump()

    def update_car(self, car_id_str: str, data: dict) -> dict:
        car_id = self._parse_car_id(car_id_str)
        car = self.repository.get_by_id(car_id)
        if not car:
            raise CarNotFoundError

        request_data = CarSchema(**data)
        update_data = request_data.model_dump(
            exclude_unset=True, exclude={"id", "seller"}
        )

        for field, value in update_data.items():
            if field == "images" and isinstance(value, list):
                value = json.dumps(value)
            setattr(car, field, value)

        self.repository.update(car)
        return CarSchema.model_validate(car).model_dump()

    def delete_car(self, car_id_str: str) -> None:
        car_id = self._parse_car_id(car_id_str)
        car = self.repository.get_by_id(car_id)
        if not car:
            return
        self.repository.delete(car)

    def _safe_int(self, value, default=None):
        if value is None:
            return default
        try:
            return int(value)
        except (ValueError, TypeError):
            return default

    def _parse_car_id(self, car_id_str: str) -> uuid.UUID:
        try:
            return uuid.UUID(car_id_str)
        except ValueError:
            raise InvalidCarIdError

    def _normalize_filters(self, params: dict) -> dict:
        filters = {}

        str_filters = {
            "status": params.get("status", "available"),
            "make": params.get("make"),
            "model": params.get("model"),
            "bodyType": params.get("bodyType"),
            "fuelType": params.get("fuelType"),
            "transmission": params.get("transmission"),
            "condition": params.get("condition"),
        }

        for key, value in str_filters.items():
            if value:
                filters[key] = value.strip().lower()

        int_filters = {
            "priceMin": self._safe_int(params.get("priceMin")),
            "priceMax": self._safe_int(params.get("priceMax")),
            "yearMin": self._safe_int(params.get("yearMin")),
            "yearMax": self._safe_int(params.get("yearMax")),
        }

        for key, value in int_filters.items():
            if value is not None:
                filters[key] = value

        if search := params.get("search"):
            filters["search"] = search.strip()

        return filters
