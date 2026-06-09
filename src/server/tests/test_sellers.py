from flaskr import status
import uuid

from flaskr.api.schemas.seller import SellerSchema
from flaskr.db import db
from flaskr.models.enums.car import (
    CarBodyType,
    CarCondition,
    CarFuelType,
    CarStatus,
    CarTransmission,
)
from .factories import CarFactory, SellerFactory


def test_get_sellers_list(client, seller_in_db):
    """It should fetch all sellers from the list including stock count"""
    response = client.get("/api/sellers")
    response_json = response.json
    assert response_json["status"] == "success"
    assert "sellers" in response_json["data"]
    assert isinstance(response_json["data"]["sellers"], list)
    for seller_data in response_json["data"]["sellers"]:
        assert "stock" in seller_data
        assert isinstance(seller_data["stock"], int)


def test_get_seller_by_id(client, create_seller):
    """It should fetch a seller by id including stock count"""
    seller = create_seller()

    response = client.get(f"/api/sellers/{seller.id}")
    response_json = response.json
    assert response.status_code == status.HTTP_200_OK
    assert response_json["status"] == "success"
    assert response_json["data"]["seller"]["id"] == str(seller.id)
    assert response_json["data"]["seller"]["name"] == seller.name
    assert "stock" in response_json["data"]["seller"]
    assert response_json["data"]["seller"]["stock"] == 0


def test_get_seller_stock_count_with_cars(client, app):
    """It should return the correct stock count when a seller has cars"""
    seller = SellerFactory()
    db.session.add(seller)
    db.session.commit()

    cars = CarFactory.create_batch(
        3,
        seller=seller,
        status=CarStatus.available,
        make="Toyota",
        model="Camry",
        price=500000,
        fuelType=CarFuelType.gasoline,
        transmission=CarTransmission.automatic,
        bodyType=CarBodyType.sedan,
        condition=CarCondition.excellent,
        description="A reliable sedan",
    )
    for car in cars:
        db.session.add(car)
    db.session.commit()

    response = client.get(f"/api/sellers/{seller.id}")
    response_json = response.json
    assert response.status_code == status.HTTP_200_OK
    assert response_json["data"]["seller"]["stock"] == 3


def test_get_sellers_list_stock_counts(client, app):
    """It should return correct stock counts for multiple sellers"""
    seller_a = SellerFactory()
    db.session.add(seller_a)
    seller_b = SellerFactory()
    db.session.add(seller_b)
    db.session.commit()

    cars_a = CarFactory.create_batch(2, seller=seller_a, price=100000,
                                     fuelType=CarFuelType.gasoline,
                                     transmission=CarTransmission.automatic,
                                     bodyType=CarBodyType.sedan,
                                     condition=CarCondition.good,
                                     description="Car")
    cars_b = CarFactory.create_batch(1, seller=seller_b, price=200000,
                                     fuelType=CarFuelType.gasoline,
                                     transmission=CarTransmission.automatic,
                                     bodyType=CarBodyType.sedan,
                                     condition=CarCondition.good,
                                     description="Car")
    for car in cars_a + cars_b:
        db.session.add(car)
    db.session.commit()

    response = client.get("/api/sellers")
    response_json = response.json
    assert response.status_code == status.HTTP_200_OK

    stocks = {
        s["id"]: s["stock"]
        for s in response_json["data"]["sellers"]
    }
    assert stocks[str(seller_a.id)] == 2
    assert stocks[str(seller_b.id)] == 1


def test_get_seller_by_invalid_id(client):
    """It should return a 400 if the seller id is invalid"""
    response = client.get("/api/sellers/invalid-id")
    response_json = response.json
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response_json["status"] == "fail"
    assert response_json["data"]["id"] == "Invalid seller id."


def test_get_seller_by_nonexistent_id(client):
    """It should return a 404 if the seller id does not exist"""
    test_uuid = uuid.uuid4()
    response = client.get(f"/api/sellers/{test_uuid}")
    response_json = response.json
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response_json["status"] == "fail"
    # Wait, my implementation of get_seller_by_id returns:
    # jsonify({"status": "fail", "data": {"id": "Seller not found."}})
    # So it should be:
    assert response_json["data"]["id"] == "Seller not found."


def test_create_seller(auth_client):
    """It should create a new seller"""
    seller_obj = SellerFactory()
    data = SellerSchema.model_validate(seller_obj).model_dump(exclude={"id"})

    response = auth_client.post("/api/sellers", json=data)
    assert response.status_code == status.HTTP_201_CREATED

    response_json = response.json
    assert response_json["status"] == "success"
    assert response_json["data"]["seller"]["name"] == seller_obj.name
    assert response_json["data"]["seller"]["email"] == seller_obj.email


def test_update_seller_status(auth_client, create_seller):
    """It should update a seller status"""
    seller = create_seller()

    update_data = {
        "status": "inactive",
    }

    response = auth_client.put(f"/api/sellers/{seller.id}/status", json=update_data)
    response_json = response.json
    assert response.status_code == status.HTTP_200_OK
    assert response_json["status"] == "success"
    assert response_json["data"]["seller"]["status"] == "inactive"


def test_update_seller_by_id(auth_client, create_seller):
    """It should update a seller by id"""
    seller = create_seller()

    update_data = {
        "name": "Updated Name",
        "phone": "Updated Phone",
        "email": "updated@example.com",
        "location": "Updated Location",
        "status": "inactive",
    }

    response = auth_client.put(f"/api/sellers/{seller.id}", json=update_data)
    response_json = response.json
    assert response.status_code == status.HTTP_200_OK
    assert response_json["status"] == "success"
    assert response_json["data"]["seller"]["name"] == "Updated Name"
    assert response_json["data"]["seller"]["email"] == "updated@example.com"


def test_delete_seller_by_id(auth_client, create_seller):
    """It should delete a seller by id"""
    seller = create_seller()

    response = auth_client.delete(f"/api/sellers/{seller.id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify it's gone
    response = auth_client.get(f"/api/sellers/{seller.id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND

    # Verify it's gone
    response = auth_client.get(f"/api/sellers/{seller.id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND
