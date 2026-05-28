DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS cars;

/* For admin credentials only */
CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

/*
Example json data:
{
    id: 'car-1',
    make: 'Tesla',
    model: 'Model 3',
    year: 2022,
    price: 38400,
    mileage: 18200,
    fuelType: 'Electric',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    exteriorColor: 'Pearl White Multi-Coat',
    interiorColor: 'All Black premium',
    engine: 'Dual Motor All-Wheel Drive',
    drivetrain: 'AWD',
    features: ['Autopilot', 'Panoramic Glass Roof', 'Heated Seats (Front & Rear)', '15-inch Touchscreen', 'Premium Audio System', 'Wireless Charging', 'Sentry Mode'],
    description: 'Immaculate single-owner Tesla Model 3 Long Range. Featuresdual motor AWD, outstanding battery health (96% capacity), and full premium interior. Garaged daily, charging mostly done at home. Autopilot is included, and physical tires are in excellent condition.',
    imageUrl: 'https://picsum.photos/seed/tesla3/800/600',
    condition: 'Excellent',
    seller: {
      name: 'Eleanor Vance',
      phone: '(415) 555-0182',
      email: 'eleanor.v@ev-owners.com',
      location: 'San Francisco, CA'
    }
  },
*/

CREATE TABLE seller (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    location TEXT NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE car (
    id TEXT PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    price REAL NOT NULL,
    mileage INTEGER NOT NULL,
    fuelType TEXT NOT NULL,
    transmission TEXT NOT NULL,
    bodyType TEXT NOT NULL,
    exteriorColor TEXT NULL,
    interiorColor TEXT NULL,
    engine TEXT NULL,
    drivetrain TEXT NULL,
    features TEXT NULL, -- Store as JSON string
    description TEXT NOT NULL,
    imageUrl TEXT NOT NULL,
    condition TEXT NOT NULL,
    sellerId TEXT NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sellerId) REFERENCES seller(id)
);