import logging
import os
import smtplib
import uuid
import ssl
from email.message import EmailMessage
from flask import Blueprint, jsonify, request
from flaskr import status
from .schemas.inquiry import InquirySchema
from ..models.car import Car
from ..models.lead import Lead
from ..db import db

bp = Blueprint("inquiries", __name__, url_prefix="/api")
logger = logging.getLogger(__name__)


def send_email(subject, body, to_email):
    msg = EmailMessage()
    msg.set_content(body)
    msg["Subject"] = subject
    msg["From"] = os.environ.get("MAIL_DEFAULT_SENDER")
    msg["To"] = to_email
    context = ssl.create_default_context()

    with smtplib.SMTP_SSL(
        os.environ.get("MAIL_SERVER"), int(os.environ.get("MAIL_PORT")), context=context
    ) as server:
        server.login(os.environ.get("MAIL_USERNAME"), os.environ.get("MAIL_PASSWORD"))
        server.send_message(msg)


@bp.route("/cars/<car_id>/inquire", methods=["POST"])
def inquire_about_car(car_id):
    """Trigger an email inquiry about a car."""
    logger.info("Request to inquire about car: %s", car_id)

    # Sanitize the input id
    try:
        car_id = uuid.UUID(car_id)
    except ValueError:
        return (
            jsonify({"status": "fail", "data": {"id": "Invalid car id."}}),
            status.HTTP_400_BAD_REQUEST,
        )

    # Validate car exists
    car = db.session.query(Car).filter(Car.id == car_id).first()
    if not car:
        logger.info("Car not found: %s", car_id)
        return (
            jsonify({"status": "fail", "data": {"id": "Car not found."}}),
            status.HTTP_404_NOT_FOUND,
        )

    # Validate request data
    try:
        data = InquirySchema(**request.get_json())
    except Exception as e:
        logger.error("Invalid inquiry data: %s", e)
        return (
            jsonify({"status": "fail", "data": {"message": "Invalid inquiry data."}}),
            status.HTTP_400_BAD_REQUEST,
        )

    # Persist lead
    lead = Lead(
        carId=car_id,
        sender_name=data.sender_name,
        sender_email=data.sender_email,
        message=data.message,
        interest_type=data.interest_type,
        consent_given=data.consent_given,
    )
    db.session.add(lead)
    db.session.commit()

    # Send email
    subject = f"New Inquiry: {car.make} {car.model}"
    consent_label = "Yes" if data.consent_given else "No"
    body = f"""
    New Inquiry for {car.make} {car.model} (ID: {car.id})

    From: {data.sender_name} ({data.sender_email})
    Type: {data.interest_type}
    Consent Given: {consent_label}

    Message:
    {data.message}
    """

    try:
        send_email(subject, body, car.seller.email)
        logger.info("Email sent successfully for car %s", car_id)
    except Exception as e:
        logger.error("Failed to send email: %s", e)
        return (
            jsonify({"status": "fail", "message": "Failed to send inquiry."}),
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return (
        jsonify({"status": "success", "message": "Inquiry sent successfully."}),
        status.HTTP_200_OK,
    )
