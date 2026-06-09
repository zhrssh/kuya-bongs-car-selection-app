import logging
import uuid
from typing import TYPE_CHECKING, Any

from ..db import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Text, DateTime, Uuid, ForeignKey, func

from datetime import datetime

from .enums.car import (
    CarStatus,
    CarFuelType,
    CarTransmission,
    CarBodyType,
    CarCondition,
)

if TYPE_CHECKING:
    from .seller import Seller

logger = logging.getLogger(__name__)


class Car(db.Model):
    __tablename__ = "car"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    status: Mapped[CarStatus] = mapped_column(nullable=False, default="Available")
    make: Mapped[str] = mapped_column(String(80), nullable=False)
    model: Mapped[str] = mapped_column(String(80), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    mileage: Mapped[int] = mapped_column(Integer, nullable=False)
    fuelType: Mapped[CarFuelType] = mapped_column(nullable=False)
    transmission: Mapped[CarTransmission] = mapped_column(nullable=False)
    bodyType: Mapped[CarBodyType] = mapped_column(nullable=False)
    exteriorColor: Mapped[str] = mapped_column(String(80), nullable=True)
    interiorColor: Mapped[str] = mapped_column(String(80), nullable=True)
    engine: Mapped[str] = mapped_column(String(80), nullable=True)
    drivetrain: Mapped[str] = mapped_column(String(80), nullable=True)
    features: Mapped[str] = mapped_column(String(255), nullable=True)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    imageUrl: Mapped[str] = mapped_column(String(255), nullable=False)
    images: Mapped[str] = mapped_column(Text, nullable=True)
    condition: Mapped[CarCondition] = mapped_column(nullable=False)
    sellerId: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("seller.id", name="fk_car_seller_id"), nullable=False
    )
    seller: Mapped["Seller"] = relationship("Seller", back_populates="cars")
    created: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now()
    )

    def __repr__(self):
        return "<Car {}>".format(self.id)

    def create(self) -> None:
        """Create the car in the database."""
        logger.info("Creating car: %s", self.id)
        db.session.add(self)
        db.session.commit()

    def update(self) -> None:
        """Update the car in the database."""
        logger.info("Updating car: %s", self.id)
        if not self.id:
            raise ValueError("Car id is not set.")

        db.session.commit()

    def delete(self) -> None:
        """Delete the car from the database."""
        logger.info("Deleting car: %s", self.id)
        if not self.id:
            raise ValueError("Car id is not set.")

        db.session.delete(self)
        db.session.commit()
