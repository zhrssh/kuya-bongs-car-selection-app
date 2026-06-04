"""
Factory classes for creating models for testing.
"""

import factory
import uuid
from factory.declarations import LazyFunction, SubFactory
from factory.faker import Faker
from factory.fuzzy import FuzzyInteger, FuzzyChoice
from flaskr.models.car import Car
from flaskr.models.enums import car
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
    status = FuzzyChoice(
        [car.CarStatus.available, car.CarStatus.sold, car.CarStatus.archived]
    )
    make = Faker("company")
    model = Faker("city")
    year = FuzzyInteger(low=1900, high=2050)
    price = FuzzyInteger(low=100000, high=5000000)
    mileage = FuzzyInteger(low=10000, high=50000)
    fuelType = FuzzyChoice(
        [
            car.CarFuelType.gasoline,
            car.CarFuelType.electric,
            car.CarFuelType.hybrid,
            car.CarFuelType.diesel,
        ]
    )
    transmission = FuzzyChoice(
        [car.CarTransmission.automatic, car.CarTransmission.manual]
    )
    bodyType = FuzzyChoice(
        [
            car.CarBodyType.sedan,
            car.CarBodyType.suv,
            car.CarBodyType.coupe,
            car.CarBodyType.truck,
            car.CarBodyType.hatchback,
            car.CarBodyType.convertible,
            car.CarBodyType.van,
            car.CarBodyType.wagon,
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
    condition = FuzzyChoice(
        [car.CarCondition.excellent, car.CarCondition.very_good, car.CarCondition.good]
    )
    seller = SubFactory(SellerFactory)
