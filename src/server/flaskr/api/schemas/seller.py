from pydantic import BaseModel, ConfigDict, field_validator
import uuid


class SellerSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID | None = None
    name: str
    phone: str
    email: str
    location: str
    status: str

    @field_validator("name", "phone", "email", "location", "status", mode="before")
    @classmethod
    def strip_lower_strings(cls, value):
        if isinstance(value, str):
            return value.strip().lower()
        return value
