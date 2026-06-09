from flaskr import status
import uuid

from flaskr.api.schemas.car import CarSchema
from .factories import CarFactory


def test_get_cars_list_pagination(client):
    """It should fetch paginated cars"""
    response = client.get("/api/cars")
    assert response.status_code == 200
    data = response.json["data"]
    assert "pagination" in data
    assert data["pagination"]["per_page"] == 21 # Default
    assert data["pagination"]["page"] == 1

    # Test custom page and per_page
    response = client.get("/api/cars?page=1&per_page=5")
    assert response.status_code == 200
    data = response.json["data"]
    assert data["pagination"]["page"] == 1
    assert data["pagination"]["per_page"] == 5

    # Test safety limits (page < 1, per_page > 100)
    response = client.get("/api/cars?page=0&per_page=999")
    assert response.status_code == 200
    data = response.json["data"]
    assert data["pagination"]["page"] == 1
    assert data["pagination"]["per_page"] == 100


def test_get_cars_list_defaults_to_available(client, cars_data):
    """It should default to filtering by 'available' status"""
    response = client.get("/api/cars")
    assert response.status_code == 200
    cars = response.json["data"]["cars"]

    assert len(cars) > 0
    for car in cars:
        assert car["status"] == "available"


def test_get_cars_list_filtering(client, cars_data):
    """It should filter cars by status"""
    response = client.get("/api/cars?status=available")
    assert response.status_code == 200
    for car in response.json["data"]["cars"]:
        assert car["status"] == "available"

    response = client.get("/api/cars?status=sold")
    assert response.status_code == 200
    for car in response.json["data"]["cars"]:
        assert car["status"] == "sold"

    response = client.get("/api/cars?status=archived")
    assert response.status_code == 200
    for car in response.json["data"]["cars"]:
        assert car["status"] == "archived"


def test_get_cars_list_filter_by_make(client, cars_data):
    """It should filter cars by make"""
    response = client.get("/api/cars?make=Toyota")
    assert response.status_code == 200
    for car in response.json["data"]["cars"]:
        assert car["make"] == "Toyota"


def test_get_cars_list_filter_by_model(client, cars_data):
    """It should filter cars by model"""
    response = client.get("/api/cars?model=Camry")
    assert response.status_code == 200
    for car in response.json["data"]["cars"]:
        assert car["model"] == "Camry"


def test_get_cars_list_filter_by_body_type(client, cars_data):
    """It should filter cars by bodyType"""
    response = client.get("/api/cars?bodyType=sedan")
    assert response.status_code == 200
    for car in response.json["data"]["cars"]:
        assert car["bodyType"] == "sedan"


def test_get_cars_list_filter_by_fuel_type(client, cars_data):
    """It should filter cars by fuelType"""
    response = client.get("/api/cars?fuelType=gasoline")
    assert response.status_code == 200
    for car in response.json["data"]["cars"]:
        assert car["fuelType"] == "gasoline"


def test_get_cars_list_filter_by_transmission(client, cars_data):
    """It should filter cars by transmission"""
    response = client.get("/api/cars?transmission=manual")
    assert response.status_code == 200
    for car in response.json["data"]["cars"]:
        assert car["transmission"] == "manual"


def test_get_cars_list_filter_by_condition(client, cars_data):
    """It should filter cars by condition"""
    response = client.get("/api/cars?condition=excellent")
    assert response.status_code == 200
    for car in response.json["data"]["cars"]:
        assert car["condition"] == "excellent"


def test_get_cars_list_filter_by_search(client, cars_data):
    """It should filter cars by keyword search (make)"""
    response = client.get("/api/cars?search=Toyota")
    assert response.status_code == 200
    filtered_cars = response.json["data"]["cars"]

    assert len(filtered_cars) > 0
    for car in filtered_cars:
        matches = (
            "toyota" in car["make"].lower()
            or "toyota" in car["model"].lower()
            or "toyota" in car["description"].lower()
        )
        assert matches, f"Car '{car['make']} {car['model']}' should match search 'Toyota'"


def test_get_cars_list_filter_by_price_min(client, cars_data):
    """It should filter cars by minimum price"""
    response = client.get("/api/cars?priceMin=500000")
    assert response.status_code == 200
    for car in response.json["data"]["cars"]:
        assert car["price"] >= 500000


def test_get_cars_list_filter_by_price_max(client, cars_data):
    """It should filter cars by maximum price"""
    response = client.get("/api/cars?priceMax=300000")
    assert response.status_code == 200
    for car in response.json["data"]["cars"]:
        assert car["price"] <= 300000


def test_get_cars_list_filter_by_price_range(client, cars_data):
    """It should filter cars by both minimum and maximum price"""
    response = client.get("/api/cars?priceMin=200000&priceMax=500000")
    assert response.status_code == 200
    for car in response.json["data"]["cars"]:
        assert 200000 <= car["price"] <= 500000


def test_get_cars_list_filter_by_price_no_match(client, cars_data):
    """It should return empty results for an out-of-range price"""
    response = client.get("/api/cars?priceMin=99999999")
    assert response.status_code == 200
    assert len(response.json["data"]["cars"]) == 0


def test_get_cars_list(client, cars_data):
    """It should fetch all cars from the list"""
    response = client.get("/api/cars")
    responseJson = response.json
    assert responseJson["status"] == "success"
    assert len(responseJson["data"]["cars"]) > 0


def test_get_car_by_id(client, car_in_db):
    """It should fetch a car by id"""
    response = client.get(f"/api/cars/{car_in_db.id}")
    responseJson = response.json
    assert responseJson["status"] == "success"
    assert responseJson["data"]["car"]["id"] == str(car_in_db.id)
    assert responseJson["data"]["car"]["make"] == "Toyota"
    assert responseJson["data"]["car"]["model"] == "Camry"


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


def test_update_car_by_id(auth_client, car_in_db):
    """It should update a car by id"""
    car_data = CarSchema.model_validate(car_in_db).model_dump(mode="json")
    car_data["make"] = "Tesla"
    response = auth_client.put(f"/api/cars/{car_in_db.id}", json=car_data)
    responseJson = response.json
    assert responseJson["status"] == "success"
    assert responseJson["data"]["car"]["make"] == "Tesla"


def test_update_car_by_invalid_id(auth_client):
    """It should return a 400 if the car id is invalid"""
    response = auth_client.put("/api/cars/invalid-id", json={"make": "Tesla"})
    responseJson = response.json
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert responseJson["status"] == "fail"
    assert responseJson["data"]["id"] == "Invalid car id."


def test_update_car_by_nonexistent_id(auth_client):
    """It should return a 404 if the car id does not exist"""
    test_uuid = uuid.uuid4()
    response = auth_client.put(f"/api/cars/{test_uuid}", json={"make": "Tesla"})
    responseJson = response.json
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert responseJson["status"] == "fail"
    assert responseJson["data"]["id"] == "Car not found."


def test_delete_car_by_id(auth_client, car_in_db):
    """It should delete a car by id"""
    response = auth_client.delete(f"/api/cars/{car_in_db.id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT


def test_delete_car_by_invalid_id(auth_client):
    """It should return a 400 if the car id is invalid"""
    response = auth_client.delete("/api/cars/invalid-id")
    responseJson = response.json
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert responseJson["status"] == "fail"
    assert responseJson["data"]["id"] == "Invalid car id."


def test_delete_car_by_nonexistent_id(auth_client):
    """It should return a 204 if the car id does not exist"""
    test_uuid = uuid.uuid4()
    response = auth_client.delete(f"/api/cars/{test_uuid}")
    assert response.status_code == status.HTTP_204_NO_CONTENT


def test_create_car(auth_client):
    """It should create a new car"""
    new_car = CarFactory()
    new_car.sellerId = new_car.seller.id  # Set the seller id

    # Serialize via Pydantic, excluding seller object and id
    car_data = CarSchema.model_validate(new_car).model_dump(
        mode="json",
        exclude={"id", "seller"},  # exclude nested seller object
    )

    response = auth_client.post("/api/cars", json=car_data)
    assert response.status_code == status.HTTP_201_CREATED

    responseJson = response.json
    assert responseJson["status"] == "success"
    assert responseJson["data"]["car"]["id"] is not None
    assert responseJson["data"]["car"]["make"] == new_car.make
    assert responseJson["data"]["car"]["model"] == new_car.model


def test_create_car_with_invalid_data(auth_client):
    """It should return a 400 if the car data is invalid"""
    response = auth_client.post("/api/cars", json={"invalid": "data"})
    responseJson = response.json
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert responseJson["status"] == "fail"
    assert responseJson["data"]["car"] == "Car data is invalid."
