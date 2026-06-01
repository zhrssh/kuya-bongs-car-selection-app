import functools

from .db import User

from flask import Blueprint, flash, g, redirect, request, session, url_for
from flask_login import login_user, logout_user, current_user, login_required

from werkzeug.security import check_password_hash, generate_password_hash

bp = Blueprint("admin", __name__, url_prefix="/admin")


@bp.route("/auth/status", methods=["GET"])
def auth_status():
    """Check if the user is authenticated."""
    if current_user.is_authenticated:
        return {"authenticated": True, "username": current_user.username}, 200
    else:
        return {"authenticated": False}, 200


@bp.route("/login", methods=["POST"])
def login():
    """Log in."""
    data = request.get_json()
    username = data["username"]
    password = data["password"]

    # Sanitize username and password
    username = username.strip().lower()
    password = password.strip()

    error = None

    user = User.query.filter_by(username=username).first()
    if user is None or not check_password_hash(user.password, password):
        error = "Incorrect username or password."

    if error is None:
        login_user(user)
        return {"message": "Login successful."}, 200

    return {"error": error}, 401


@bp.route("/logout", methods=["POST"])
def logout():
    """Log out the current user."""
    logout_user()
    return {"message": "Logout successful."}, 200
