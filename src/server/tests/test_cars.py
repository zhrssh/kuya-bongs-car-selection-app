from flaskr import status
import logging
import uuid
import factory
import json

from flaskr.api.cars import CarSchema
from flaskr.utils.factories import CarFactory

logger = logging.getLogger(__name__)


def test_get_cars_list(client):
    """It should fetch all cars from the list"""
    response = client.get("/api/cars")
    responseJson = response.json
    assert responseJson["status"] == "success"
    assert len(responseJson["data"]["cars"]) > 0


def test_get_car_by_id(client):
    """It should fetch a car by id"""
    response = client.get("/api/cars")
    responseJson = response.json
    assert responseJson["status"] == "success"
    assert len(responseJson["data"]["cars"]) > 0

    # Fetch the first car
    car = response.json["data"]["cars"][0]
    logger.debug("Car: %s", car)

    # Fetch the car by id
    response = client.get(f"/api/cars/{car['id']}")
    responseJson = response.json
    assert responseJson["status"] == "success"

    # Comapre data
    assert responseJson["data"]["car"]["id"] == car["id"]
    assert responseJson["data"]["car"]["make"] == car["make"]
    assert responseJson["data"]["car"]["model"] == car["model"]


def test_get_car_by_invalid_id(client):
    """It should return a 404 if the car id is invalid"""
    response = client.get("/api/cars/invalid-id")
    responseJson = response.json
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert responseJson["status"] == "fail"
    assert responseJson["data"]["id"] == "Invalid car id."


def test_get_car_by_nonexistent_id(client):
    """It should return a 404 if the car id does not exist"""
    test_uuid = uuid.uuid4()
    response = client.get(f"/api/cars/{test_uuid}")
    responseJson = response.json
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert responseJson["status"] == "fail"
    assert responseJson["data"]["id"] == "Car not found."


def test_update_car_by_id(client):
    """It should update a car by id"""
    response = client.get("/api/cars")
    responseJson = response.json
    assert responseJson["status"] == "success"
    assert len(responseJson["data"]["cars"]) > 0

    # Fetch the first car
    car = response.json["data"]["cars"][0]
    logger.debug("Car: %s", car)

    # Update the car
    car["make"] = "Tesla"
    response = client.put(f"/api/cars/{car['id']}", json=car)
    responseJson = response.json
    assert responseJson["status"] == "success"
    assert responseJson["data"]["car"]["make"] == "Tesla"


def test_update_car_by_invalid_id(client):
    """It should return a 400 if the car id is invalid"""
    response = client.put("/api/cars/invalid-id", json={"make": "Tesla"})
    responseJson = response.json
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert responseJson["status"] == "fail"
    assert responseJson["data"]["id"] == "Invalid car id."


def test_update_car_by_nonexistent_id(client):
    """It should return a 404 if the car id does not exist"""
    test_uuid = uuid.uuid4()
    response = client.put(f"/api/cars/{test_uuid}", json={"make": "Tesla"})
    responseJson = response.json
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert responseJson["status"] == "fail"
    assert responseJson["data"]["id"] == "Car not found."


def test_delete_car_by_id(client):
    """It should delete a car by id"""
    response = client.get("/api/cars")
    responseJson = response.json
    assert responseJson["status"] == "success"
    assert len(responseJson["data"]["cars"]) > 0

    # Fetch the first car
    car = response.json["data"]["cars"][0]
    logger.debug("Car: %s", car)

    # Delete the car
    response = client.delete(f"/api/cars/{car['id']}")
    assert response.status_code == status.HTTP_204_NO_CONTENT


def test_delete_car_by_invalid_id(client):
    """It should return a 400 if the car id is invalid"""
    response = client.delete("/api/cars/invalid-id")
    responseJson = response.json
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert responseJson["status"] == "fail"
    assert responseJson["data"]["id"] == "Invalid car id."


def test_delete_car_by_nonexistent_id(client):
    """It should return a 204 if the car id does not exist"""
    test_uuid = uuid.uuid4()
    response = client.delete(f"/api/cars/{test_uuid}")
    assert response.status_code == status.HTTP_204_NO_CONTENT


def test_create_car(client):
    """It should create a new car"""
    new_car = CarFactory()
    new_car.sellerId = new_car.seller.id  # Set the seller id

    # Serialize via Pydantic, excluding seller object and id
    car_data = CarSchema.model_validate(new_car).model_dump(
        mode="json",
        exclude={"id", "seller"},  # exclude nested seller object
    )

    response = client.post("/api/cars", json=car_data)
    assert response.status_code == status.HTTP_201_CREATED

    responseJson = response.json
    assert responseJson["status"] == "success"
    assert responseJson["data"]["car"]["id"] is not None
    assert responseJson["data"]["car"]["make"] == new_car.make
    assert responseJson["data"]["car"]["model"] == new_car.model


def test_create_car_with_invalid_data(client):
    """It should return a 400 if the car data is invalid"""
    response = client.post("/api/cars", json={"invalid": "data"})
    responseJson = response.json
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert responseJson["status"] == "fail"
    assert responseJson["data"]["car"] == "Car data is invalid."
