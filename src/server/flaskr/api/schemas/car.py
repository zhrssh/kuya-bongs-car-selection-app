import json

from pydantic import BaseModel, ConfigDict, field_validator
import uuid

from .seller import SellerSchema

STRING_FIELDS_TO_STRIP = {
    "make", "model", "exteriorColor", "interiorColor", "engine",
    "drivetrain", "features", "description",
}

STRING_FIELDS_TO_LOWER = {
    "status", "fuelType", "transmission", "bodyType", "condition",
}


class CarSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID | None = None
    status: str
    make: str
    model: str
    year: int
    price: int
    mileage: int
    fuelType: str
    transmission: str
    bodyType: str
    exteriorColor: str | None = None
    interiorColor: str | None = None
    engine: str | None = None
    drivetrain: str | None = None
    features: str | None = None
    description: str
    imageUrl: str
    images: list[str] | None = None
    condition: str
    sellerId: uuid.UUID
    seller: SellerSchema | None = None

    @field_validator("images", mode="before")
    @classmethod
    def parse_images(cls, value):
        if value is None:
            return None
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return parsed
            except (json.JSONDecodeError, TypeError):
                pass
        return None

    @field_validator(*STRING_FIELDS_TO_STRIP, mode="before")
    @classmethod
    def strip_strings(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator(*STRING_FIELDS_TO_LOWER, mode="before")
    @classmethod
    def strip_lower_strings(cls, value):
        if isinstance(value, str):
            return value.strip().lower()
        return value
