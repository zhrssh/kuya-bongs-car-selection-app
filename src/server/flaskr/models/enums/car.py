from enum import StrEnum


class CarStatus(StrEnum):
    available = "Available"
    sold = "Sold"
    archived = "Archived"


class CarFuelType(StrEnum):
    gasoline = "Gasoline"
    electric = "Electric"
    hybrid = "Hybrid"
    diesel = "Diesel"


class CarTransmission(StrEnum):
    automatic = "Automatic"
    manual = "Manual"


class CarBodyType(StrEnum):
    suv = "SUV"
    sedan = "Sedan"
    coupe = "Coupe"
    truck = "Truck"
    hatchback = "Hatchback"
    convertible = "Convertible"
    van = "Van"
    wagon = "Wagon"


class CarCondition(StrEnum):
    excellent = "Excellent"
    very_good = "Very Good"
    good = "Good"
