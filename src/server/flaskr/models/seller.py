import uuid
import logging
from typing import List, TYPE_CHECKING

from ..db import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Uuid

from .enums.seller import SellerStatus

if TYPE_CHECKING:
    from .car import Car

logger = logging.getLogger(__name__)


class Seller(db.Model):
    __tablename__ = "seller"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), nullable=False)
    location: Mapped[str] = mapped_column(String(120), nullable=False)
    status: Mapped[SellerStatus] = mapped_column(nullable=False, default="active")
    cars: Mapped[List["Car"]] = relationship("Car", back_populates="seller")

    def __repr__(self):
        return "<Seller {}>".format(self.id)

    def create(self) -> None:
        """Create the seller in the database."""
        logger.info("Creating seller: %s", self.id)
        db.session.add(self)
        db.session.commit()

    def update(self) -> None:
        """Update the seller in the database."""
        logger.info("Updating seller: %s", self.id)
        if not self.id:
            raise ValueError("Seller id is not set.")

        db.session.commit()

    def delete(self) -> None:
        """Delete the seller from the database."""
        logger.info("Deleting seller: %s", self.id)
        if not self.id:
            raise ValueError("Seller id is not set.")

        db.session.delete(self)
        db.session.commit()
