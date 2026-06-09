import os

import pytest

from flaskr import create_app
from flaskr.db import db
from flaskr.api.schemas.seller import SellerSchema
from flaskr.models.enums.car import (
    CarBodyType,
    CarCondition,
    CarFuelType,
    CarStatus,
    CarTransmission,
)
from .factories import CarFactory, SellerFactory


@pytest.fixture()
def app():
    app = create_app(
        {
            "TESTING": True,
            "DEBUG": False,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "SQLALCHEMY_TRACK_MODIFICATIONS": False,
        }
    )

    ctx = app.app_context()
    ctx.push()
    db.create_all()

    yield app

    db.session.remove()
    db.drop_all()
    ctx.pop()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def auth_client(app, client):
    os.environ["APP_ADMIN_USERNAME"] = "admin"
    os.environ["APP_ADMIN_PASSWORD"] = "secret"

    from werkzeug.security import generate_password_hash
    from flaskr.models.user import User

    user = User(
        username="admin",
        password=generate_password_hash("secret"),
    )
    db.session.add(user)
    db.session.commit()

    client.post("/admin/login", json={"username": "admin", "password": "secret"})
    return client


@pytest.fixture()
def runner(app):
    return app.test_cli_runner()


@pytest.fixture()
def seller_in_db(app):
    seller = SellerFactory()
    db.session.add(seller)
    db.session.commit()
    return seller


@pytest.fixture()
def car_in_db(app, seller_in_db):
    car = CarFactory(
        make="Toyota",
        model="Camry",
        status=CarStatus.available,
        price=500000,
        fuelType=CarFuelType.gasoline,
        transmission=CarTransmission.automatic,
        bodyType=CarBodyType.sedan,
        condition=CarCondition.excellent,
        description="A reliable sedan",
        seller=seller_in_db,
    )
    db.session.add(car)
    db.session.commit()
    return car


@pytest.fixture()
def cars_data(app, seller_in_db):
    cars = [
        CarFactory(
            make="Toyota", model="Camry", status=CarStatus.available,
            price=500000, fuelType=CarFuelType.gasoline,
            transmission=CarTransmission.automatic, bodyType=CarBodyType.sedan,
            condition=CarCondition.excellent, description="A reliable sedan",
            seller=seller_in_db,
        ),
        CarFactory(
            make="Honda", model="Civic", status=CarStatus.available,
            price=300000, fuelType=CarFuelType.hybrid,
            transmission=CarTransmission.automatic, bodyType=CarBodyType.sedan,
            condition=CarCondition.very_good, description="A fuel-efficient hybrid",
            seller=seller_in_db,
        ),
        CarFactory(
            make="Ford", model="Focus", status=CarStatus.available,
            price=200000, fuelType=CarFuelType.gasoline,
            transmission=CarTransmission.manual, bodyType=CarBodyType.hatchback,
            condition=CarCondition.good, description="A compact hatchback",
            seller=seller_in_db,
        ),
        CarFactory(
            make="Toyota", model="RAV4", status=CarStatus.sold,
            price=800000, fuelType=CarFuelType.hybrid,
            transmission=CarTransmission.automatic, bodyType=CarBodyType.suv,
            condition=CarCondition.excellent, description="Popular SUV",
            seller=seller_in_db,
        ),
        CarFactory(
            make="Honda", model="CR-V", status=CarStatus.archived,
            price=600000, fuelType=CarFuelType.gasoline,
            transmission=CarTransmission.automatic, bodyType=CarBodyType.suv,
            condition=CarCondition.very_good, description="Old but reliable",
            seller=seller_in_db,
        ),
    ]
    for car in cars:
        db.session.add(car)
    db.session.commit()
    return cars


@pytest.fixture()
def create_seller(auth_client):
    def _create_seller(seller_obj=None):
        if seller_obj is None:
            seller_obj = SellerFactory()

        data = SellerSchema.model_validate(seller_obj).model_dump(exclude={"id"})
        response = auth_client.post("/api/sellers", json=data)
        assert response.status_code == 201
        return SellerSchema.model_validate(response.json["data"]["seller"])

    return _create_seller
