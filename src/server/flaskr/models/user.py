import uuid

from ..db import db
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Uuid

from flask_login import UserMixin


class User(db.Model, UserMixin):
    __tablename__ = "user"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(120), nullable=False)
