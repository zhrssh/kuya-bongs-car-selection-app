from pydantic import BaseModel, ConfigDict
import uuid


class SellerSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    phone: str
    email: str
    location: str
