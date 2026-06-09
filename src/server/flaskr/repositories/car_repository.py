import uuid
import logging

from sqlalchemy.orm import joinedload

from flaskr.db import db
from flaskr.models.car import Car

logger = logging.getLogger(__name__)


class CarRepository:
    def __init__(self, database=None):
        self.db = database or db

    def get_paginated(self, filters, page, per_page):
        query = self.db.select(Car).options(joinedload(Car.seller))
        query = self._apply_sorting(query, filters.get("sort"))

        if status_filter := filters.get("status"):
            query = query.filter(Car.status == status_filter)
        if make_filter := filters.get("make"):
            query = query.filter(Car.make.ilike(make_filter))
        if model_filter := filters.get("model"):
            query = query.filter(Car.model.ilike(model_filter))
        if body_type_filter := filters.get("bodyType"):
            query = query.filter(Car.bodyType == body_type_filter)
        if fuel_type_filter := filters.get("fuelType"):
            query = query.filter(Car.fuelType == fuel_type_filter)
        if transmission_filter := filters.get("transmission"):
            query = query.filter(Car.transmission == transmission_filter)
        if condition_filter := filters.get("condition"):
            query = query.filter(Car.condition == condition_filter)
        if price_min := filters.get("priceMin"):
            query = query.filter(Car.price >= price_min)
        if price_max := filters.get("priceMax"):
            query = query.filter(Car.price <= price_max)
        if year_min := filters.get("yearMin"):
            query = query.filter(Car.year >= year_min)
        if year_max := filters.get("yearMax"):
            query = query.filter(Car.year <= year_max)
        if search_query := filters.get("search"):
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

        return self.db.paginate(query, page=page, per_page=per_page)

    @staticmethod
    def _apply_sorting(query, sort_key):
        sort_map = {
            "price-asc": Car.price.asc(),
            "price-desc": Car.price.desc(),
            "year-desc": Car.year.desc(),
            "year-asc": Car.year.asc(),
            "mileage-asc": Car.mileage.asc(),
        }
        if sort_key in sort_map:
            return query.order_by(sort_map[sort_key])
        return query.order_by(Car.id)

    def get_by_id(self, car_id: uuid.UUID) -> Car | None:
        return (
            Car.query.options(joinedload(Car.seller))
            .filter_by(id=car_id)
            .first()
        )

    def save(self, car: Car) -> Car:
        logger.info("Creating car: %s", car.id)
        self.db.session.add(car)
        self.db.session.commit()
        return car

    def update(self, car: Car) -> Car:
        logger.info("Updating car: %s", car.id)
        self.db.session.commit()
        return car

    def delete(self, car: Car) -> None:
        logger.info("Deleting car: %s", car.id)
        self.db.session.delete(car)
        self.db.session.commit()
