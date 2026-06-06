from pydantic import BaseModel, ConfigDict
import uuid

from .seller import SellerSchema


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
    images: str | None = None
    condition: str
    sellerId: uuid.UUID
    seller: SellerSchema | None = None
