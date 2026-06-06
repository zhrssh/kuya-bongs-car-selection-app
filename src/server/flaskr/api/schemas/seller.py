from pydantic import BaseModel, ConfigDict
import uuid

from flaskr.models.enums import seller


class SellerSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID | None = None
    name: str
    phone: str
    email: str
    location: str
    status: seller.SellerStatus
