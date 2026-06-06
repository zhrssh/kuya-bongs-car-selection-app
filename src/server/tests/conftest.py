import pytest

from flaskr import create_app
from flaskr.db import db
from flaskr.api.schemas.seller import SellerSchema
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

    with app.app_context():
        db.create_all()

    yield app

    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def runner(app):
    return app.test_cli_runner()


@pytest.fixture(autouse=True)
def generate_cars(app, num_cars: int = 3):
    # Create all tables
    app.logger.info("Populating table with fake data...")
    with app.app_context():
        # Populate database with Notes
        for _ in range(num_cars):
            car = CarFactory()
            db.session.add(car)
            db.session.commit()


@pytest.fixture()
def create_seller(client):
    def _create_seller(seller_obj=None):
        if seller_obj is None:
            seller_obj = SellerFactory()

        data = SellerSchema.model_validate(seller_obj).model_dump(exclude={"id"})
        response = client.post("/api/sellers", json=data)
        assert response.status_code == 201
        return SellerSchema.model_validate(response.json["data"]["seller"])

    return _create_seller
