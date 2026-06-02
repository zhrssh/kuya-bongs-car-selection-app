"""
Factory classes for creating models for testing.
"""

import factory
import uuid
from factory.declarations import LazyFunction, SubFactory
from factory.faker import Faker
from factory.fuzzy import FuzzyInteger, FuzzyChoice
from flaskr.models.car import Car
from flaskr.models.seller import Seller


class SellerFactory(factory.base.Factory):
    """Factory for creating Seller objects."""

    class Meta:  # type: ignore
        model = Seller

    id = LazyFunction(lambda: uuid.uuid4())
    name = Faker("name")
    phone = Faker("phone_number")
    email = Faker("email")
    location = Faker("city")


class CarFactory(factory.base.Factory):
    """Factory for creating Car objects."""

    class Meta:  # type: ignore
        model = Car

    id = LazyFunction(lambda: uuid.uuid4())
    make = Faker("company")
    model = Faker("city")
    year = FuzzyInteger(low=1900, high=2050)
    price = FuzzyInteger(low=100000, high=5000000)
    mileage = FuzzyInteger(low=10000, high=50000)
    fuelType = FuzzyChoice(["Gasoline", "Electric", "Hybrid", "Diesel"])
    transmission = FuzzyChoice(["Automatic", "Manual"])
    bodyType = FuzzyChoice(
        [
            "Sedan",
            "SUV",
            "Truck",
            "Hatchback",
            "Coupe",
            "Convertible",
            "Van",
            "Wagon",
        ]
    )
    exteriorColor = Faker("safe_color_name")
    interiorColor = Faker("safe_color_name")
    engine = "Engine X"
    drivetrain = FuzzyChoice(["FWD", "RWD", "AWD"])
    features = "Some features"
    description = Faker("catch_phrase")
    imageUrl = "https://picsum.photos/seed/tesla3/800/600"
    images = None
    condition = FuzzyChoice(["Excellent", "Very Good", "Good"])
    seller = SubFactory(SellerFactory)
