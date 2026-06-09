import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy.exc import OperationalError

from ..db import db
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text, DateTime

logger = logging.getLogger(__name__)


class EventLog(db.Model):
    __tablename__ = "event_logs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    car_id: Mapped[str] = mapped_column(String(36), nullable=True)
    car_name: Mapped[str] = mapped_column(String(200), nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)

    def __repr__(self):
        return f"<EventLog {self.id} [{self.type}]>"

    @classmethod
    def safe_log(cls, **kwargs):
        try:
            entry = cls(**kwargs)
            db.session.add(entry)
            db.session.commit()
        except OperationalError:
            db.session.rollback()
            logger.warning("event_logs table not found — skipping log entry")
