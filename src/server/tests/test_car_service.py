import uuid
from unittest.mock import MagicMock, patch

import pytest

from flaskr.models.car import Car
from flaskr.services.car_service import CarService
from flaskr.services.exceptions import (
    CarCreationError,
    CarNotFoundError,
    InvalidCarIdError,
)


@pytest.fixture
def mock_repo():
    return MagicMock()


@pytest.fixture
def service(mock_repo):
    return CarService(mock_repo)


@pytest.fixture
def sample_car():
    car = Car(
        make="Toyota",
        model="Camry",
        year=2020,
        price=500000,
        mileage=30000,
        fuelType="gasoline",
        transmission="automatic",
        bodyType="sedan",
        description="A reliable sedan",
        imageUrl="https://example.com/car.jpg",
        condition="excellent",
        sellerId=uuid.uuid4(),
    )
    car.id = uuid.uuid4()
    car.status = "available"
    return car


@pytest.fixture
def sample_car_data():
    return {
        "make": "Toyota",
        "model": "Camry",
        "year": 2020,
        "price": 500000,
        "mileage": 30000,
        "fuelType": "gasoline",
        "transmission": "automatic",
        "bodyType": "sedan",
        "description": "A reliable sedan",
        "imageUrl": "https://example.com/car.jpg",
        "condition": "excellent",
        "sellerId": str(uuid.uuid4()),
        "status": "available",
    }


class TestGetFilteredCars:
    def test_returns_paginated_result(self, service, mock_repo, sample_car):
        mock_pagination = MagicMock()
        mock_pagination.items = [sample_car]
        mock_pagination.page = 1
        mock_pagination.per_page = 21
        mock_pagination.total = 1
        mock_pagination.pages = 1
        mock_pagination.has_next = False
        mock_pagination.has_prev = False
        mock_repo.get_paginated.return_value = mock_pagination

        result = service.get_filtered_cars({})

        assert result["status"] == "success"
        assert len(result["data"]["cars"]) == 1
        assert result["data"]["cars"][0]["make"] == "Toyota"
        assert result["data"]["pagination"]["page"] == 1

    def test_applies_safety_limits(self, service, mock_repo):
        mock_pagination = MagicMock()
        mock_pagination.items = []
        mock_pagination.page = 1
        mock_pagination.per_page = 100
        mock_pagination.total = 0
        mock_pagination.pages = 0
        mock_pagination.has_next = False
        mock_pagination.has_prev = False
        mock_repo.get_paginated.return_value = mock_pagination

        result = service.get_filtered_cars({"page": 0, "per_page": 999})

        assert result["data"]["pagination"]["page"] == 1
        assert result["data"]["pagination"]["per_page"] == 100
        mock_repo.get_paginated.assert_called_once()
        _args = mock_repo.get_paginated.call_args[0]
        assert _args[1] == 1
        assert _args[2] == 100

    def test_normalizes_filters(self, service, mock_repo):
        mock_pagination = MagicMock()
        mock_pagination.items = []
        mock_repo.get_paginated.return_value = mock_pagination

        service.get_filtered_cars(
            {
                "make": "  TOYOTA  ",
                "status": "AVAILABLE",
                "search": "  camry  ",
                "priceMin": "100000",
            }
        )

        _call_filters = mock_repo.get_paginated.call_args[0][0]
        assert _call_filters["make"] == "toyota"
        assert _call_filters["status"] == "available"
        assert _call_filters["search"] == "camry"
        assert _call_filters["priceMin"] == 100000


class TestGetCarById:
    def test_returns_car(self, service, mock_repo, sample_car):
        mock_repo.get_by_id.return_value = sample_car

        result = service.get_car_by_id(str(sample_car.id))

        assert result["make"] == "Toyota"
        assert result["id"] == sample_car.id

    def test_raises_invalid_id(self, service, mock_repo):
        with pytest.raises(InvalidCarIdError):
            service.get_car_by_id("not-a-uuid")

    def test_raises_not_found(self, service, mock_repo):
        mock_repo.get_by_id.return_value = None

        with pytest.raises(CarNotFoundError):
            service.get_car_by_id(str(uuid.uuid4()))


class TestCreateCar:
    def test_creates_car(self, service, mock_repo, sample_car_data, sample_car):
        mock_repo.save.return_value = sample_car

        result = service.create_car(sample_car_data)

        assert result["make"] == "Toyota"
        mock_repo.save.assert_called_once()

    def test_raises_on_invalid_data(self, service, mock_repo):
        with pytest.raises(CarCreationError):
            service.create_car({"invalid": "data"})

    def test_raises_on_save_failure(self, service, mock_repo, sample_car_data):
        mock_repo.save.side_effect = Exception("DB error")

        with pytest.raises(CarCreationError):
            service.create_car(sample_car_data)

    def test_with_images_list(self, service, mock_repo, sample_car_data, sample_car):
        sample_car_data["images"] = ["img1.jpg", "img2.jpg"]
        mock_repo.save.return_value = sample_car

        result = service.create_car(sample_car_data)

        assert result["make"] == "Toyota"
        mock_repo.save.assert_called_once()


class TestUpdateCar:
    def test_updates_car(self, service, mock_repo, sample_car, sample_car_data):
        mock_repo.get_by_id.return_value = sample_car
        sample_car_data["make"] = "Tesla"

        result = service.update_car(str(sample_car.id), sample_car_data)

        assert result["make"] == "Tesla"
        mock_repo.update.assert_called_once_with(sample_car)
        assert sample_car.make == "Tesla"

    def test_raises_invalid_id(self, service, mock_repo):
        with pytest.raises(InvalidCarIdError):
            service.update_car("bad-id", {"make": "Tesla"})

    def test_raises_not_found(self, service, mock_repo, sample_car_data):
        mock_repo.get_by_id.return_value = None

        with pytest.raises(CarNotFoundError):
            service.update_car(str(uuid.uuid4()), sample_car_data)

    def test_with_images_in_update(self, service, mock_repo, sample_car, sample_car_data):
        mock_repo.get_by_id.return_value = sample_car
        sample_car_data["images"] = ["img1.jpg"]

        result = service.update_car(str(sample_car.id), sample_car_data)

        assert result["make"] == "Toyota"
        mock_repo.update.assert_called_once_with(sample_car)


class TestDeleteCar:
    def test_deletes_car(self, service, mock_repo, sample_car):
        mock_repo.get_by_id.return_value = sample_car

        service.delete_car(str(sample_car.id))

        mock_repo.delete.assert_called_once_with(sample_car)

    def test_raises_invalid_id(self, service, mock_repo):
        with pytest.raises(InvalidCarIdError):
            service.delete_car("bad-id")

    def test_handles_missing_car_gracefully(self, service, mock_repo):
        mock_repo.get_by_id.return_value = None

        service.delete_car(str(uuid.uuid4()))

        mock_repo.delete.assert_not_called()
