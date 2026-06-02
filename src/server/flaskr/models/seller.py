import uuid
from typing import List, TYPE_CHECKING

from ..db import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Uuid

if TYPE_CHECKING:
    from .car import Car


class Seller(db.Model):
    __tablename__ = "seller"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), nullable=False)
    location: Mapped[str] = mapped_column(String(120), nullable=False)
    cars: Mapped[List["Car"]] = relationship("Car", back_populates="seller")
