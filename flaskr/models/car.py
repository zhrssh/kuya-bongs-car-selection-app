import logging
import uuid
from typing import TYPE_CHECKING

from ..db import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, DateTime, Uuid, ForeignKey, func

from datetime import datetime

if TYPE_CHECKING:
    from .seller import Seller

logger = logging.getLogger(__name__)


class Car(db.Model):
    __tablename__ = "car"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    make: Mapped[str] = mapped_column(String(80), nullable=False)
    model: Mapped[str] = mapped_column(String(80), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[float] = mapped_column(Integer, nullable=False)
    mileage: Mapped[int] = mapped_column(Integer, nullable=False)
    fuelType: Mapped[str] = mapped_column(String(80), nullable=False)
    transmission: Mapped[str] = mapped_column(String(80), nullable=False)
    bodyType: Mapped[str] = mapped_column(String(80), nullable=False)
    exteriorColor: Mapped[str] = mapped_column(String(80), nullable=True)
    interiorColor: Mapped[str] = mapped_column(String(80), nullable=True)
    engine: Mapped[str] = mapped_column(String(80), nullable=True)
    drivetrain: Mapped[str] = mapped_column(String(80), nullable=True)
    features: Mapped[str] = mapped_column(String(255), nullable=True)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    imageUrl: Mapped[str] = mapped_column(String(80), nullable=False)
    images: Mapped[str] = mapped_column(String(255), nullable=True)
    condition: Mapped[str] = mapped_column(String(80), nullable=False)
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
        """Creates a Account to the database"""
        logger.info("Creating %s", self.id)
        db.session.add(self)
        db.session.commit()
