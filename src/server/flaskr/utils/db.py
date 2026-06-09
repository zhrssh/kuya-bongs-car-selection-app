import os
import click

from ..models.user import User
from werkzeug.security import generate_password_hash

from ..db import db

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
        new_admin.username = admin_username
        new_admin.password = generate_password_hash(admin_password)

        db.session.add(new_admin)
        db.session.commit()


@click.command("init-db")
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    click.echo("Initialized the database.")
