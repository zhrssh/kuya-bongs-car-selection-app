from flaskr import status
import logging

logger = logging.getLogger(__name__)


def test_get_cars_list(client):
    """It should fetch all cars from the list"""
    response = client.get("/api/cars")
    assert response.status_code == status.HTTP_200_OK
    assert "data" in response.json
    assert len(response.json["data"]) > 0
