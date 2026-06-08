from flaskr import status
import logging
import uuid

from flaskr.api.cars import CarSchema
from .factories import CarFactory

logger = logging.getLogger(__name__)


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


def test_get_cars_list_filtering(client):
    """It should filter cars by status"""
    # Assume we have some cars with different statuses populated
    # Get all cars to see statuses
    response = client.get("/api/cars?per_page=100")
    assert response.status_code == 200
    cars = response.json["data"]["cars"]
    
    # Pick a status to filter by
    status_to_filter = cars[0]["status"]
    
    # Filter by that status
    response = client.get(f"/api/cars?status={status_to_filter}")
    assert response.status_code == 200
    filtered_cars = response.json["data"]["cars"]
    
    for car in filtered_cars:
        assert car["status"] == status_to_filter


def test_get_cars_list_filter_by_make(client):
    """It should filter cars by make"""
    response = client.get("/api/cars?per_page=100")
    assert response.status_code == 200
    cars = response.json["data"]["cars"]

    make = cars[0]["make"]
    response = client.get(f"/api/cars?make={make}")
    assert response.status_code == 200
    filtered_cars = response.json["data"]["cars"]

    for car in filtered_cars:
        assert car["make"] == make


def test_get_cars_list_filter_by_model(client):
    """It should filter cars by model"""
    response = client.get("/api/cars?per_page=100")
    assert response.status_code == 200
    cars = response.json["data"]["cars"]

    model = cars[0]["model"]
    response = client.get(f"/api/cars?model={model}")
    assert response.status_code == 200
    filtered_cars = response.json["data"]["cars"]

    for car in filtered_cars:
        assert car["model"] == model


def test_get_cars_list_filter_by_body_type(client):
    """It should filter cars by bodyType"""
    response = client.get("/api/cars?per_page=100")
    assert response.status_code == 200
    cars = response.json["data"]["cars"]

    body_type = cars[0]["bodyType"]
    response = client.get(f"/api/cars?bodyType={body_type}")
    assert response.status_code == 200
    filtered_cars = response.json["data"]["cars"]

    for car in filtered_cars:
        assert car["bodyType"] == body_type


def test_get_cars_list_filter_by_fuel_type(client):
    """It should filter cars by fuelType"""
    response = client.get("/api/cars?per_page=100")
    assert response.status_code == 200
    cars = response.json["data"]["cars"]

    fuel_type = cars[0]["fuelType"]
    response = client.get(f"/api/cars?fuelType={fuel_type}")
    assert response.status_code == 200
    filtered_cars = response.json["data"]["cars"]

    for car in filtered_cars:
        assert car["fuelType"] == fuel_type


def test_get_cars_list_filter_by_transmission(client):
    """It should filter cars by transmission"""
    response = client.get("/api/cars?per_page=100")
    assert response.status_code == 200
    cars = response.json["data"]["cars"]

    transmission = cars[0]["transmission"]
    response = client.get(f"/api/cars?transmission={transmission}")
    assert response.status_code == 200
    filtered_cars = response.json["data"]["cars"]

    for car in filtered_cars:
        assert car["transmission"] == transmission


def test_get_cars_list_filter_by_condition(client):
    """It should filter cars by condition"""
    response = client.get("/api/cars?per_page=100")
    assert response.status_code == 200
    cars = response.json["data"]["cars"]

    condition = cars[0]["condition"]
    response = client.get(f"/api/cars?condition={condition}")
    assert response.status_code == 200
    filtered_cars = response.json["data"]["cars"]

    for car in filtered_cars:
        assert car["condition"] == condition


def test_get_cars_list_filter_by_search(client):
    """It should filter cars by keyword search (make)"""
    response = client.get("/api/cars?per_page=100")
    assert response.status_code == 200
    cars = response.json["data"]["cars"]

    # Search by first car's make (partial match)
    make = cars[0]["make"]
    search_term = make[:len(make)//2 + 1]  # first half of the make name
    response = client.get(f"/api/cars?search={search_term}")
    assert response.status_code == 200
    filtered_cars = response.json["data"]["cars"]

    assert len(filtered_cars) > 0
    for car in filtered_cars:
        matches = (
            search_term.lower() in car["make"].lower()
            or search_term.lower() in car["model"].lower()
            or search_term.lower() in car["description"].lower()
        )
        assert matches, f"Car '{car['make']} {car['model']}' should match search '{search_term}'"


def test_get_cars_list_filter_by_price_min(client):
    """It should filter cars by minimum price"""
    response = client.get("/api/cars?per_page=100")
    assert response.status_code == 200
    cars = response.json["data"]["cars"]

    prices = [c["price"] for c in cars]
    mid_price = (min(prices) + max(prices)) // 2

    response = client.get(f"/api/cars?priceMin={mid_price}")
    assert response.status_code == 200
    filtered_cars = response.json["data"]["cars"]

    assert len(filtered_cars) > 0
    for car in filtered_cars:
        assert car["price"] >= mid_price


def test_get_cars_list_filter_by_price_max(client):
    """It should filter cars by maximum price"""
    response = client.get("/api/cars?per_page=100")
    assert response.status_code == 200
    cars = response.json["data"]["cars"]

    prices = [c["price"] for c in cars]
    mid_price = (min(prices) + max(prices)) // 2

    response = client.get(f"/api/cars?priceMax={mid_price}")
    assert response.status_code == 200
    filtered_cars = response.json["data"]["cars"]

    assert len(filtered_cars) > 0
    for car in filtered_cars:
        assert car["price"] <= mid_price


def test_get_cars_list_filter_by_price_range(client):
    """It should filter cars by both minimum and maximum price"""
    response = client.get("/api/cars?per_page=100")
    assert response.status_code == 200
    cars = response.json["data"]["cars"]

    prices = [c["price"] for c in cars]
    lo = min(prices)
    hi = max(prices)

    response = client.get(f"/api/cars?priceMin={lo}&priceMax={hi}")
    assert response.status_code == 200
    filtered_cars = response.json["data"]["cars"]

    for car in filtered_cars:
        assert lo <= car["price"] <= hi


def test_get_cars_list_filter_by_price_no_match(client):
    """It should return empty results for an out-of-range price"""
    response = client.get("/api/cars?per_page=100")
    assert response.status_code == 200
    cars = response.json["data"]["cars"]

    prices = [c["price"] for c in cars]
    far_above = max(prices) + 99999999

    response = client.get(f"/api/cars?priceMin={far_above}")
    assert response.status_code == 200
    filtered_cars = response.json["data"]["cars"]

    assert len(filtered_cars) == 0


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
