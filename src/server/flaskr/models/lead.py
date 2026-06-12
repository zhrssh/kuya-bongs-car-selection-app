import uuid
from typing import TYPE_CHECKING

from ..db import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, DateTime, Uuid, ForeignKey, func

from datetime import datetime

if TYPE_CHECKING:
    from .car import Car


class Lead(db.Model):
    __tablename__ = "lead"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    carId: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("car.id", name="fk_lead_car_id"), nullable=False
    )
    car: Mapped["Car"] = relationship("Car")
    sender_name: Mapped[str] = mapped_column(String(120), nullable=False)
    sender_email: Mapped[str] = mapped_column(String(120), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    interest_type: Mapped[str] = mapped_column(String(50), nullable=False)
    consent_given: Mapped[bool] = mapped_column(nullable=False, default=False)
    created: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    def __repr__(self):
        return "<Lead {}>".format(self.id)
