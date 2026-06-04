import enum


class CarStatus(enum.Enum):
    available = "Available"
    sold = "Sold"
    archived = "Archived"


class CarFuelType(enum.Enum):
    gasoline = "Gasoline"
    electric = "Electric"
    hybrid = "Hybrid"
    diesel = "Diesel"


class CarTransmission(enum.Enum):
    automatic = "Automatic"
    manual = "Manual"


class CarBodyType(enum.Enum):
    suv = "SUV"
    sedan = "Sedan"
    coupe = "Coupe"
    truck = "Truck"
    hatchback = "Hatchback"
    convertible = "Convertible"
    van = "Van"
    wagon = "Wagon"


class CarCondition(enum.Enum):
    excellent = "Excellent"
    very_good = "Very Good"
    good = "Good"
