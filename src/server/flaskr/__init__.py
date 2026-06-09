import os
import uuid
import json

from .db import db
from .models.user import User
from .utils.db import init_db_command
from flask import Flask, send_from_directory
from flask_login import LoginManager
from flask_talisman import Talisman
from flask_migrate import Migrate

from werkzeug.middleware.proxy_fix import ProxyFix

from dotenv import load_dotenv

load_dotenv()

migrate = Migrate()


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
            "http://localhost:3001",
            "http://localhost:3000",
        ],
    )
    app.config["CORS_HEADERS"] = "Content-Type"

    upload_folder = os.path.join(app.root_path, os.pardir, "public", "images")

    # setup additional config
    app.config.from_mapping(
        TESTING=os.getenv("TESTING", False),
        SECRET_KEY=os.getenv("SECRET_KEY", "dev"),
        SESSION_COOKIE_DOMAIN=os.getenv("SESSION_COOKIE_DOMAIN", "localhost"),
        SQLALCHEMY_DATABASE_URI=os.getenv(
            "SQLALCHEMY_DATABASE_URI",
            f"sqlite:///{os.path.join(app.instance_path, 'flaskr.sqlite')}",
        ),
        SQLALCHEMY_TRACK_MODIFICATIONS=os.getenv(
            "SQLALCHEMY_TRACK_MODIFICATIONS", False
        ),
        UPLOAD_FOLDER=upload_folder,
        MAX_CONTENT_LENGTH=16 * 1024 * 1024,
    )

    if test_config is not None:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # ensure the upload folder exists
    try:
        os.makedirs(upload_folder)
    except OSError:
        pass

    # setup sqlalchemy
    db.init_app(app)
    migrate.init_app(app, db)

    # register CLI commands
    app.cli.add_command(init_db_command)

    # setup flask login manager
    login_manager = LoginManager()
    login_manager.init_app(app)

    # Configure talisman
    csp = {"default-src": ["'self'"], "connect-src": ["'self'", "*.docker.localhost"]}
    if app.testing:
        Talisman(
            app,
            content_security_policy=csp,
            force_https=False,
        )
    else:
        Talisman(app, content_security_policy=csp)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.filter_by(id=uuid.UUID(user_id)).first()

    # healthcheck
    @app.route("/health")
    def healthcheck():
        """Used for health checking the app. Returns 200 if the app is healthy."""
        return "OK", 200

    @app.cli.command("cleanup-orphan-uploads")
    def cleanup_orphan_uploads():
        """Remove uploaded image files not referenced by any car record."""
        from .models.car import Car

        upload_folder = app.config["UPLOAD_FOLDER"]
        if not os.path.exists(upload_folder):
            print("Upload folder does not exist. Nothing to clean.")
            return

        all_cars = Car.query.with_entities(Car.imageUrl, Car.images).all()
        referenced = set()
        for image_url, images_json in all_cars:
            if image_url:
                referenced.add(os.path.basename(image_url))
            if images_json:
                try:
                    for url in json.loads(images_json):
                        referenced.add(os.path.basename(url))
                except (json.JSONDecodeError, TypeError):
                    pass

        removed = 0
        for filename in os.listdir(upload_folder):
            filepath = os.path.join(upload_folder, filename)
            if not os.path.isfile(filepath):
                continue
            if filename not in referenced:
                os.remove(filepath)
                removed += 1
                print(f"Deleted orphan: {filename}")

        print(f"Cleanup complete. Removed {removed} orphan file(s).")

    from . import admin

    app.register_blueprint(admin.bp)

    from .api import cars, sellers, inquiries, uploads

    app.register_blueprint(cars.bp)
    app.register_blueprint(sellers.bp)
    app.register_blueprint(inquiries.bp)
    app.register_blueprint(uploads.bp)

    @app.route("/public/images/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    # Initialize the database
    with app.app_context():
        db.create_all()

    return app
