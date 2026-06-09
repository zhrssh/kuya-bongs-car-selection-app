from pydantic import BaseModel, ConfigDict, field_validator
import uuid


def to_sentence_case(s: str) -> str:
    return " ".join(word.capitalize() for word in s.strip().split())


class SellerSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID | None = None
    name: str
    phone: str
    email: str
    location: str
    status: str
    stock: int = 0

    @field_validator("status", "phone", "email", mode="before")
    @classmethod
    def strip_lower_strings(cls, value):
        if isinstance(value, str):
            return value.strip().lower()
        return value

    @field_validator("name", mode="before")
    @classmethod
    def sentence_case_name(cls, value):
        if isinstance(value, str):
            return to_sentence_case(value)
        return value

    @field_validator("location", mode="before")
    @classmethod
    def strip_location(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value
