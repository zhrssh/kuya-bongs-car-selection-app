import logging
import json
import uuid
from flask import Blueprint, jsonify, request
from flask_login import login_required

from flaskr import status
from ..db import db
from ..models.seller import Seller
from ..models.enums.seller import SellerStatus
from .schemas.seller import SellerSchema
from pydantic import TypeAdapter, ValidationError

bp = Blueprint("sellers", __name__, url_prefix="/api")
logger = logging.getLogger(__name__)


@bp.route("/sellers", methods=["GET"])
def get_sellers_list():
    """Get a list of sellers."""
    logger.info("Request to get all sellers")

    sellers = Seller.query.all()

    return (
        jsonify(
            {
                "status": "success",
                "data": {
                    "sellers": [
                        SellerSchema.model_validate(seller).model_dump()
                        for seller in sellers
                    ],
                },
            }
        ),
        status.HTTP_200_OK,
    )


@bp.route("/sellers/<seller_id>", methods=["GET"])
def get_seller_by_id(seller_id):
    """Get a seller by id."""
    logger.info("Request to get seller by id: %s", seller_id)

    # Sanitize the input id
    try:
        seller_id = uuid.UUID(seller_id)
    except ValueError:
        return (
            jsonify({"status": "fail", "data": {"id": "Invalid seller id."}}),
            status.HTTP_400_BAD_REQUEST,
        )

    seller = db.session.get(Seller, seller_id)
    if not seller:
        return (
            jsonify({"status": "fail", "data": {"id": "Seller not found."}}),
            status.HTTP_404_NOT_FOUND,
        )

    return (
        jsonify(
            {
                "status": "success",
                "data": {"seller": SellerSchema.model_validate(seller).model_dump()},
            }
        ),
        status.HTTP_200_OK,
    )


@bp.route("/sellers", methods=["POST"])
@login_required
def create_seller():
    """Create a new seller."""
    logger.info("Request to create a new seller")

    try:
        request_data = SellerSchema(**request.get_json())
        logger.debug("Request data: %s", request_data)
    except ValidationError as e:
        logger.error("Invalid request data: %s", e)
        return (
            jsonify(
                {
                    "status": "fail",
                    "data": {"seller": "Seller data is invalid."},
                }
            ),
            status.HTTP_400_BAD_REQUEST,
        )

    # Create the seller
    seller = Seller(**request_data.model_dump(exclude_unset=True, exclude={"id"}))

    try:
        db.session.add(seller)
        db.session.commit()
        logger.debug("Created seller: %s", seller)
    except Exception as e:
        db.session.rollback()
        logger.error("Failed to create seller: %s", e)
        return (
            jsonify(
                {"status": "fail", "message": "There was an error creating the seller."}
            ),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return (
        jsonify(
            {
                "status": "success",
                "data": {"seller": SellerSchema.model_validate(seller).model_dump()},
            }
        ),
        status.HTTP_201_CREATED,
    )


@bp.route("/sellers/<seller_id>/status", methods=["PUT"])
@login_required
def update_seller_status(seller_id):
    """Update a seller status by id."""
    logger.info("Request to update seller status by id: %s", seller_id)

    try:
        seller_id = uuid.UUID(seller_id)
    except ValueError:
        return (
            jsonify({"status": "fail", "data": {"id": "Invalid seller id."}}),
            status.HTTP_400_BAD_REQUEST,
        )

    # Check if seller to update exists
    seller = db.session.get(Seller, seller_id)
    if not seller:
        return (
            jsonify({"status": "fail", "data": {"id": "Seller not found."}}),
            status.HTTP_404_NOT_FOUND,
        )

    # Fetch the request data
    try:
        raw_status = request.json.get("status", "").strip().lower()
        validated_data = SellerStatus(raw_status)
    except (ValueError, AttributeError) as e:
        logger.error("Invalid request data: %s", e)
        return (
            jsonify(
                {
                    "status": "fail",
                    "data": {"seller": "Seller data is invalid."},
                }
            ),
            status.HTTP_400_BAD_REQUEST,
        )

    # Update the seller status
    seller.status = validated_data

    try:
        seller.update()
        logger.debug("Updated seller: %s", seller)
    except Exception as e:
        db.session.rollback()
        logger.error("Failed to update seller: %s", e)
        return (
            jsonify(
                {"status": "fail", "message": "There was an error updating the seller."}
            ),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return (
        jsonify(
            {
                "status": "success",
                "data": {"seller": SellerSchema.model_validate(seller).model_dump()},
            }
        ),
        status.HTTP_200_OK,
    )


@bp.route("/sellers/<seller_id>", methods=["PUT"])
@login_required
def update_seller_by_id(seller_id):
    """Update a seller by id."""
    logger.info("Request to update seller by id: %s", seller_id)

    # Sanitize the input id
    try:
        seller_id = uuid.UUID(seller_id)
    except ValueError:
        return (
            jsonify({"status": "fail", "data": {"id": "Invalid seller id."}}),
            status.HTTP_400_BAD_REQUEST,
        )

    # Check if seller to update exists
    seller = db.session.get(Seller, seller_id)
    if not seller:
        return (
            jsonify({"status": "fail", "data": {"id": "Seller not found."}}),
            status.HTTP_404_NOT_FOUND,
        )

    # Fetch the request data
    try:
        request_data = SellerSchema(**request.get_json())
        update_data = request_data.model_dump(exclude_unset=True, exclude={"id"})
    except ValidationError as e:
        logger.error("Invalid request data: %s", e)
        return (
            jsonify(
                {
                    "status": "fail",
                    "data": {"seller": "Seller data is invalid."},
                }
            ),
            status.HTTP_400_BAD_REQUEST,
        )

    logger.debug("Request data: %s", update_data)

    # Update the seller fields
    for field, value in update_data.items():
        setattr(seller, field, value)

    try:
        db.session.commit()
        logger.debug("Updated seller: %s", seller)
    except Exception as e:
        db.session.rollback()
        logger.error("Failed to update seller: %s", e)
        return (
            jsonify(
                {"status": "fail", "message": "There was an error updating the seller."}
            ),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return (
        jsonify(
            {
                "status": "success",
                "data": {"seller": SellerSchema.model_validate(seller).model_dump()},
            }
        ),
        status.HTTP_200_OK,
    )


@bp.route("/sellers/<seller_id>", methods=["DELETE"])
@login_required
def delete_seller_by_id(seller_id):
    """Delete a seller by id."""
    logger.info("Request to delete seller by id: %s", seller_id)

    # Sanitize the input id
    try:
        seller_id = uuid.UUID(seller_id)
    except ValueError:
        return (
            jsonify({"status": "fail", "data": {"id": "Invalid seller id."}}),
            status.HTTP_400_BAD_REQUEST,
        )

    # Check if seller to delete exists
    seller = db.session.get(Seller, seller_id)
    if not seller:
        return (
            jsonify({"status": "fail", "data": {"id": "Seller not found."}}),
            status.HTTP_404_NOT_FOUND,
        )

    # Delete the seller
    try:
        db.session.delete(seller)
        db.session.commit()
        logger.debug("Deleted seller: %s", seller)
    except Exception as e:
        db.session.rollback()
        logger.error("Failed to delete seller: %s", e)
        return (
            jsonify(
                {"status": "fail", "message": "There was an error deleting the seller."}
            ),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return (
        "",
        status.HTTP_204_NO_CONTENT,
    )
