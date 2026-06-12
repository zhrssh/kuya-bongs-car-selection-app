import os
from unittest.mock import patch, MagicMock
from flaskr import status

def test_inquire_about_car_success(client, car_in_db):
    """It should successfully send an inquiry email"""
    inquiry_data = {
        "sender_name": "Test User",
        "sender_email": "test@example.com",
        "message": "I am interested in this car.",
        "interest_type": "questions",
        "consent_given": True,
    }

    env_vars = {
        "MAIL_SERVER": "smtp.example.com",
        "MAIL_PORT": "587",
        "MAIL_USERNAME": "test",
        "MAIL_PASSWORD": "test",
        "MAIL_DEFAULT_SENDER": "test@example.com",
    }

    with patch.dict(os.environ, env_vars):
        with patch("flaskr.api.inquiries.smtplib.SMTP_SSL") as mock_smtp:
            mock_server = MagicMock()
            mock_smtp.return_value.__enter__.return_value = mock_server

            response = client.post(f"/api/cars/{car_in_db.id}/inquire", json=inquiry_data)

            assert response.status_code == status.HTTP_200_OK
            assert response.json["status"] == "success"
            assert mock_server.send_message.called


def test_inquire_about_car_invalid_car(client):
    """It should return 404 for a non-existent car"""
    import uuid
    test_uuid = uuid.uuid4()

    inquiry_data = {
        "sender_name": "Test User",
        "sender_email": "test@example.com",
        "message": "I am interested in this car.",
        "interest_type": "questions",
        "consent_given": True,
    }

    response = client.post(f"/api/cars/{test_uuid}/inquire", json=inquiry_data)

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json["status"] == "fail"


def test_inquire_about_car_invalid_data(client, car_in_db):
    """It should return 400 for invalid inquiry data"""
    inquiry_data = {
        "sender_name": "Test User",
        "message": "I am interested in this car."
    }

    response = client.post(f"/api/cars/{car_in_db.id}/inquire", json=inquiry_data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json["status"] == "fail"
