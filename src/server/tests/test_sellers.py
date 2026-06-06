from flaskr import status
import uuid
import json

from flaskr.api.schemas.seller import SellerSchema
from flaskr.utils.factories import SellerFactory


def test_get_sellers_list(client):
    """It should fetch all sellers from the list"""
    response = client.get("/api/sellers")
    response_json = response.json
    assert response_json["status"] == "success"
    assert "sellers" in response_json["data"]
    assert isinstance(response_json["data"]["sellers"], list)


def test_get_seller_by_id(client, create_seller):
    """It should fetch a seller by id"""
    seller = create_seller()

    response = client.get(f"/api/sellers/{seller.id}")
    response_json = response.json
    assert response.status_code == status.HTTP_200_OK
    assert response_json["status"] == "success"
    assert response_json["data"]["seller"]["id"] == str(seller.id)
    assert response_json["data"]["seller"]["name"] == seller.name


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


def test_create_seller(client):
    """It should create a new seller"""
    seller_obj = SellerFactory()
    data = SellerSchema.model_validate(seller_obj).model_dump(exclude={"id"})

    response = client.post("/api/sellers", json=data)
    assert response.status_code == status.HTTP_201_CREATED

    response_json = response.json
    assert response_json["status"] == "success"
    assert response_json["data"]["seller"]["name"] == seller_obj.name
    assert response_json["data"]["seller"]["email"] == seller_obj.email


def test_update_seller_status(client, create_seller):
    """It should update a seller status"""
    seller = create_seller()

    update_data = {
        "status": "inactive",
    }

    response = client.put(f"/api/sellers/{seller.id}/status", json=update_data)
    response_json = response.json
    assert response.status_code == status.HTTP_200_OK
    assert response_json["status"] == "success"
    assert response_json["data"]["seller"]["status"] == "inactive"


def test_update_seller_by_id(client, create_seller):
    """It should update a seller by id"""
    seller = create_seller()

    update_data = {
        "name": "Updated Name",
        "phone": "Updated Phone",
        "email": "updated@example.com",
        "location": "Updated Location",
        "status": "inactive",
    }

    response = client.put(f"/api/sellers/{seller.id}", json=update_data)
    response_json = response.json
    assert response.status_code == status.HTTP_200_OK
    assert response_json["status"] == "success"
    assert response_json["data"]["seller"]["name"] == "Updated Name"
    assert response_json["data"]["seller"]["email"] == "updated@example.com"


def test_delete_seller_by_id(client, create_seller):
    """It should delete a seller by id"""
    seller = create_seller()

    response = client.delete(f"/api/sellers/{seller.id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify it's gone
    response = client.get(f"/api/sellers/{seller.id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND

    # Verify it's gone
    response = client.get(f"/api/sellers/{seller.id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND
