from flaskr import status

from .models.user import User
from .models.event_log import EventLog
from .db import db

from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, current_user

from werkzeug.security import check_password_hash

import pydantic_core
from pydantic import BaseModel

bp = Blueprint("admin", __name__, url_prefix="/admin")


class LoginSchema(BaseModel):
    username: str
    password: str


@bp.route("/auth/status", methods=["GET"])
def auth_status():
    """Check if the user is authenticated."""
    if current_user.is_authenticated:
        return {
            "status": "success",
            "authenticated": True,
            "data": {"username": current_user.username},
        }, 200
    else:
        return jsonify({"status": "fail", "authenticated": False, "data": None}), 200


@bp.route("/login", methods=["POST"])
def login():
    """Log in."""
    try:
        data = LoginSchema(**request.get_json())
        username = data.username.strip().lower()
        password = data.password
    except pydantic_core.ValidationError as e:
        return {"error": str(e)}, status.HTTP_400_BAD_REQUEST

    error = None
    user = User.query.filter_by(username=username).first()
    if user is None:
        error = "User does not exists."
    elif not check_password_hash(user.password, password):
        error = "Incorrect username or password."

    if error is None:
        login_user(user)
        EventLog.safe_log(
            type="login",
            car_name="System Auth",
            message="Administrator authenticated successfully",
        )
        return (
            jsonify(
                {
                    "status": "success",
                    "data": {"message": "Login successful."},
                }
            ),
            status.HTTP_200_OK,
        )

    return (
        jsonify(
            {
                "status": "fail",
                "error": {"message": error},
            }
        ),
        status.HTTP_401_UNAUTHORIZED,
    )


@bp.route("/logout", methods=["POST"])
def logout():
    """Log out the current user."""
    logout_user()
    EventLog.safe_log(
        type="logout",
        car_name="System Auth",
        message="Administrator session terminated (logged out)",
    )
    return (
        jsonify(
            {
                "status": "success",
                "data": {"message": "Logout successful."},
            }
        ),
        status.HTTP_200_OK,
    )
