import functools

from flask import Blueprint, flash, g, redirect, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash
from flaskr.db import get_db

bp = Blueprint("admin", __name__, url_prefix="/admin")


@bp.before_app_request
def load_logged_in_user():
    user_id = session.get("user_id")
    if user_id is None:
        g.user = None
    else:
        g.user = (
            get_db().execute("SELECT * FROM user WHERE id = ?", (user_id,)).fetchone()
        )


@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data["username"]
    password = data["password"]

    # Sanitize username and password
    username = username.strip().lower()
    password = password.strip()

    db = get_db()
    error = None

    user = db.execute("SELECT * FROM user WHERE username = ?", (username,)).fetchone()

    if user is None or not check_password_hash(user["password"], password):
        error = "Incorrect username or password."

    if error is None:
        session.clear()
        session["user_id"] = user["id"]
        return {"message": "Login successful."}, 200

    return {"error": error}, 401


@bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return {"message": "Logout successful."}, 200


def login_required(route):
    """Route decorator that requires login."""

    @functools.wraps(route)
    def wrapped_route(**kwargs):
        if g.user is None:
            return {"error": "Unauthorized."}, 401
        return route(**kwargs)

    return wrapped_route
