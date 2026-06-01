import click
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from flask_login import UserMixin


import os
import uuid
from werkzeug.security import generate_password_hash


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)


class User(db.Model, UserMixin):
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(120), nullable=False)


### Database initialization and CLI command
def init_db():
    """Clear existing data and create new tables."""

    # check if there is admin user set in env
    if (
        os.getenv("APP_ADMIN_USERNAME") is None
        or os.getenv("APP_ADMIN_PASSWORD") is None
    ):
        raise Exception(
            "Admin username and password must be set in environment variables."
        )

    # create initial user
    admin_username = str(os.getenv("APP_ADMIN_USERNAME"))
    admin_password = str(os.getenv("APP_ADMIN_PASSWORD"))

    # Check if admin user already exists
    existing_admin = User.query.filter_by(username=admin_username).first()
    if not existing_admin:
        new_admin = User()
        new_admin.id = str(uuid.uuid4())
        new_admin.username = admin_username
        new_admin.password = generate_password_hash(admin_password)

        db.session.add(new_admin)
        db.session.commit()


@click.command("init-db")
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    click.echo("Initialized the database.")
