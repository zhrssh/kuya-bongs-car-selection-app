from enum import StrEnum


class CarStatus(StrEnum):
    available = "available"
    sold = "sold"
    archived = "archived"


class CarFuelType(StrEnum):
    gasoline = "gasoline"
    electric = "electric"
    hybrid = "hybrid"
    diesel = "diesel"


class CarTransmission(StrEnum):
    automatic = "automatic"
    manual = "manual"


class CarBodyType(StrEnum):
    suv = "suv"
    sedan = "sedan"
    coupe = "coupe"
    truck = "truck"
    hatchback = "hatchback"
    convertible = "convertible"
    van = "van"
    wagon = "wagon"


class CarCondition(StrEnum):
    excellent = "excellent"
    very_good = "very Good"
    good = "good"
