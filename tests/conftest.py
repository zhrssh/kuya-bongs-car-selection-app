import pytest

from flaskr import create_app
from flaskr.db import db
from .factories import CarFactory


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
