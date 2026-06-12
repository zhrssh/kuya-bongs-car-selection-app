import uuid
from flaskr import status
from flaskr.models.lead import Lead
from flaskr.db import db


def test_delete_lead_success(auth_client, car_in_db):
    """It should delete a lead by id when authenticated"""
    lead = Lead(
        carId=car_in_db.id,
        sender_name="Test User",
        sender_email="test@example.com",
        message="I am interested.",
        interest_type="questions",
        consent_given=True,
    )
    db.session.add(lead)
    db.session.commit()

    response = auth_client.delete(f"/api/leads/{lead.id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json["status"] == "success"

    deleted = db.session.get(Lead, lead.id)
    assert deleted is None


def test_delete_lead_not_found(auth_client):
    """It should return 404 if the lead does not exist"""
    test_uuid = uuid.uuid4()
    response = auth_client.delete(f"/api/leads/{test_uuid}")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json["status"] == "fail"


def test_delete_lead_invalid_id(auth_client):
    """It should return 400 if the lead id is invalid"""
    response = auth_client.delete("/api/leads/invalid-id")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json["status"] == "fail"


def test_delete_lead_unauthorized(client, car_in_db):
    """It should return 401 if not authenticated"""
    lead = Lead(
        carId=car_in_db.id,
        sender_name="Test User",
        sender_email="test@example.com",
        message="I am interested.",
        interest_type="questions",
        consent_given=True,
    )
    db.session.add(lead)
    db.session.commit()

    response = client.delete(f"/api/leads/{lead.id}")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
