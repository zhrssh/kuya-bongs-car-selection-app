import os
from typing import Dict

from .db import db, init_db_command, User
from flask import Flask
from flask_cors import CORS, cross_origin
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from flask_talisman import Talisman

from werkzeug.middleware.proxy_fix import ProxyFix

from dotenv import load_dotenv

load_dotenv()


def create_app(test_config=None) -> Flask:
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

    # setup CORS
    cors = CORS(
        app,
        supports_credentials=True,
        origins=[
            "https://web.docker.localhost",
            "https://admin.docker.localhost",
        ],
    )
    app.config["CORS_HEADERS"] = "Content-Type"

    # setup additional config
    app.config.from_mapping(
        SECRET_KEY="dev",
        SESSION_COOKIE_DOMAIN=".docker.localhost",
        SQLALCHEMY_DATABASE_URI=f"sqlite:///{os.path.join(app.instance_path, 'flaskr.sqlite')}",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile("config.py", silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # setup sqlalchemy
    db.init_app(app)

    # register CLI commands
    app.cli.add_command(init_db_command)

    # setup flask login manager
    login_manager = LoginManager()
    login_manager.init_app(app)

    # Configure talisman
    csp = {"default-src": ["'self'"], "connect-src": ["'self'", "*.docker.localhost"]}
    Talisman(app, content_security_policy=csp)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(user_id)

    # healthcheck
    @app.route("/health")
    def healthcheck():
        """Used for health checking the app. Returns 200 if the app is healthy."""
        return "OK", 200

    from . import admin

    app.register_blueprint(admin.bp)

    # Initialize the database
    with app.app_context():
        db.create_all()

    return app
