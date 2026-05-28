/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Car } from './types';

export const usedCars: Car[] = [
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
    history: {
      owners: 1,
      accidents: 0,
      serviceHistory: 'Full digital service logs via Tesla. Excellent health checklist.'
    },
    seller: {
      name: 'Eleanor Vance',
      phone: '(415) 555-0182',
      email: 'eleanor.v@ev-owners.com',
      rating: 4.9,
      location: 'San Francisco, CA'
    }
  },
  {
    id: 'car-2',
    make: 'BMW',
    model: 'M4 Coupe',
    year: 2021,
    price: 64900,
    mileage: 24500,
    fuelType: 'Gasoline',
    transmission: 'Manual',
    bodyType: 'Coupe',
    exteriorColor: 'Isle of Man Green Metallic',
    interiorColor: 'Kyalami Orange Full Merino Leather',
    engine: '3.0L TwinPower Turbo I6',
    drivetrain: 'RWD',
    features: ['M Carbon Bucket Seats', 'Executive Package', 'Harman Kardon Surround Sound', 'M Adaptive Suspension', 'Carbon Fiber Interior Trim', 'Head-Up Display', 'Apple CarPlay/Android Auto'],
    description: 'Stunning 2021 BMW M4 in the highly coveted Isle of Man Green over Kyalami Orange leather. Enthusiast-spec 6-speed manual transmission. Thoroughly loved, completely stock, with zero track time. PPF applied on the front bumper and hood.',
    imageUrl: 'https://picsum.photos/seed/bmwm4/800/600',
    condition: 'Excellent',
    history: {
      owners: 1,
      accidents: 0,
      serviceHistory: 'Services completed purely at authorized BMW Dealerships every 8,000 km.'
    },
    seller: {
      name: 'Apex Motor Group',
      phone: '(650) 555-0194',
      email: 'sales@apexmotorgroup.com',
      rating: 4.8,
      location: 'Redwood City, CA'
    }
  },
  {
    id: 'car-3',
    make: 'Porsche',
    model: '911 Carrera S',
    year: 2018,
    price: 94500,
    mileage: 31200,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'Coupe',
    exteriorColor: 'GT Silver Metallic',
    interiorColor: 'Bordeaux Red Leather',
    engine: '3.0L Twin-Turbo Flat-6',
    drivetrain: 'RWD',
    features: ['Sport Chrono Package', 'Sport Exhaust System', 'PASM Sport Suspension', '20/21-inch Carrera S Wheels', 'Bose Surround Sound', '14-Way Power Sport Seats'],
    description: 'A masterpiece of precision engineering. This 991.2 generation Carrera S features PDK dual-clutch transmission, active suspension, and the iconic Bordeaux Red leather interior. Perfect paint, professionally detailed quarterly.',
    imageUrl: 'https://picsum.photos/seed/porsche911/800/600',
    condition: 'Excellent',
    history: {
      owners: 2,
      accidents: 0,
      serviceHistory: 'Major 48,000-km service recently performed at Porsche Beverly Hills.'
    },
    seller: {
      name: 'Prestige Auto Boutique',
      phone: '(310) 555-0143',
      email: 'contact@prestigeautoboutique.com',
      rating: 5.0,
      location: 'Beverly Hills, CA'
    }
  },
  {
    id: 'car-4',
    make: 'Toyota',
    model: 'RAV4 Hybrid',
    year: 2020,
    price: 28900,
    mileage: 42100,
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    bodyType: 'SUV',
    exteriorColor: 'Magnetic Gray Metallic',
    interiorColor: 'Black SofTex Trimmed Seats',
    engine: '2.5L 4-Cylinder Hybrid',
    drivetrain: 'AWD',
    features: ['Toyota Safety Sense 2.0', 'All-Wheel Drive', 'Power Moonroof', 'Heated Front Seats', 'Apple CarPlay Compatible', 'Smart Key System', 'Dual-Zone Climate Control'],
    description: 'Fuel-efficient and highly versatile 2020 Toyota RAV4 XLE Hybrid. Averaging 40 MPG combined. Extremely comfortable ride with spacious cargo utility and state-of-the-art safety sense packages. Clean interior, free of pet and smoke odors.',
    imageUrl: 'https://picsum.photos/seed/toyotarav4/800/600',
    condition: 'Very Good',
    history: {
      owners: 1,
      accidents: 0,
      serviceHistory: 'Regularly serviced with full records available. 64,000-km service completed.'
    },
    seller: {
      name: 'David Miller',
      phone: '(408) 555-0129',
      email: 'dmiller.work@gmail.com',
      rating: 4.7,
      location: 'San Jose, CA'
    }
  },
  {
    id: 'car-5',
    make: 'Honda',
    model: 'Civic Type R',
    year: 2019,
    price: 33800,
    mileage: 39800,
    fuelType: 'Gasoline',
    transmission: 'Manual',
    bodyType: 'Hatchback',
    exteriorColor: 'Championship White',
    interiorColor: 'Type R Red/Black Suede-effect',
    engine: '2.0L Turbocharged inline-4',
    drivetrain: 'FWD',
    features: ['306-HP VTEC Turbo Engine', 'Brembo Brake Calipers', 'Adaptive Damper System', 'LogR Datalogger', '20-inch Gloss Black Alloy Wheels', 'Type R Spoiler'],
    description: 'Rare opportunity to acquire an unmodded Civic Type R in signature Championship White. This hot hatch delivers 306 HP with unmatched responsiveness on daily routes and corners. Fully stock exterior and powertrain. Carefully kept.',
    imageUrl: 'https://picsum.photos/seed/hondacivic/800/600',
    condition: 'Excellent',
    history: {
      owners: 2,
      accidents: 0,
      serviceHistory: 'Serviced regularly. Transmission fluid and brake pad changes logged at 56,000 km.'
    },
    seller: {
      name: 'Marcus Chen',
      phone: '(510) 555-0111',
      email: 'm.chen.itr@honda-fans.org',
      rating: 4.8,
      location: 'Oakland, CA'
    }
  },
  {
    id: 'car-6',
    make: 'Ford',
    model: 'F-150 Lightning',
    year: 2023,
    price: 59900,
    mileage: 8400,
    fuelType: 'Electric',
    transmission: 'Automatic',
    bodyType: 'Truck',
    exteriorColor: 'Antimatter Blue Metallic',
    interiorColor: 'Medium Dark Slate Cloth',
    engine: 'Dual 3-Phase AC Electric Motors',
    drivetrain: 'AWD',
    features: ['Pro Power Onboard (9.6kW)', 'Ford Co-Pilot360 2.0', 'Mega Power Frunk', '12-inch Center Screen', 'Class IV Hitch Receiver', 'Pre-Collision Assist'],
    description: 'Get electric-powered utility with the 2023 F-150 Lightning XLT. Incredible low mileage, superb condition, and extensive home battery charging capabilities. Standard range battery targets 380 km of reliable range.',
    imageUrl: 'https://picsum.photos/seed/fordf150/800/600',
    condition: 'Excellent',
    history: {
      owners: 1,
      accidents: 0,
      serviceHistory: 'Inspected under Ford certified pre-owned program. Fully up-to-date firmware.'
    },
    seller: {
      name: 'Sierra Valley Ford',
      phone: '(916) 555-0275',
      email: 'fleet@sierravalleyford.com',
      rating: 4.6,
      location: 'Sacramento, CA'
    }
  },
  {
    id: 'car-7',
    make: 'Chevrolet',
    model: 'Corvette Stingray',
    year: 2020,
    price: 61500,
    mileage: 12100,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'Coupe',
    exteriorColor: 'Torch Red',
    interiorColor: 'Adrenaline Red Leather',
    engine: '6.2L V8 DI (495 HP)',
    drivetrain: 'RWD',
    features: ['2LT Preferred Equipment Group', 'Z51 Performance Package', 'Performance Data Recorder', 'Front Lift Adjustable Height', 'Carbon Flash Accents', 'GT2 Bucket Seats'],
    description: 'Sensational mid-engine Corvette C8 featuring the highly requested Z51 performance package. Complete dual-mode exhaust, larger Brembos, magnetic ride suspension. Always hand-washed, stored in a climate-controlled residential garage.',
    imageUrl: 'https://picsum.photos/seed/chevroletcorvette/800/600',
    condition: 'Excellent',
    history: {
      owners: 1,
      accidents: 0,
      serviceHistory: 'Annual service and multi-point inspection registered directly at local Chevy specialist.'
    },
    seller: {
      name: 'Velocity Exotics',
      phone: '(619) 555-0312',
      email: 'deals@velocityexotics.com',
      rating: 4.9,
      location: 'San Diego, CA'
    }
  },
  {
    id: 'car-8',
    make: 'Audi',
    model: 'e-tron GT',
    year: 2022,
    price: 68900,
    mileage: 14700,
    fuelType: 'Electric',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    exteriorColor: 'Kemora Gray Metallic',
    interiorColor: 'Arras Red Fine Nappa Leather',
    engine: 'Dual Synchronous Electric Motors (469 HP)',
    drivetrain: 'AWD',
    features: ['quattro AWD system', 'Bang & Olufsen 3D Sound', 'Panoramic Fixed Glass Roof', 'Matrix-design LED Headlights', 'Adaptive Air Suspension', 'Audi Virtual Cockpit Plus'],
    description: 'The pinnacle of grand touring luxury. This immaculate e-tron GT merges performance with exquisite Audi craftsmanship. Active aerodynamics, 270 kW high-speed charging. Extremely quiet cabin with robust handling precision.',
    imageUrl: 'https://picsum.photos/seed/audietron/800/600',
    condition: 'Excellent',
    history: {
      owners: 1,
      accidents: 0,
      serviceHistory: 'Full certified inspection and software patches successfully compiled at Audi Marin.'
    },
    seller: {
      name: 'Julian Vance',
      phone: '(415) 555-0231',
      email: 'julian.vance@vanceholdings.org',
      rating: 4.8,
      location: 'Marin County, CA'
    }
  },
  {
    id: 'car-9',
    make: 'Tesla',
    model: 'Model Y',
    year: 2021,
    price: 36900,
    mileage: 29500,
    fuelType: 'Electric',
    transmission: 'Automatic',
    bodyType: 'SUV',
    exteriorColor: 'Midnight Silver Metallic',
    interiorColor: 'All Black premium',
    engine: 'Dual Motor All-Wheel Drive',
    drivetrain: 'AWD',
    features: ['7-Seat Interior Cabin', 'Autopilot', 'Premium Audio', 'Heated Steering Wheel & All Seats', 'Wireless Phone Charger', 'Power Liftgate'],
    description: 'Family-friendly 7-seater Tesla Model Y Long Range. Excellent range potential (510 km EPA). Perfect glass roof, upgraded wood interior trim accents. Perfect daily driver with superb cargo room and safety records.',
    imageUrl: 'https://picsum.photos/seed/teslay/800/600',
    condition: 'Very Good',
    history: {
      owners: 1,
      accidents: 0,
      serviceHistory: 'Remote tire rotation logged twice. Software logs exhibit immaculate system health.'
    },
    seller: {
      name: 'Sarah Peterson',
      phone: '(510) 555-0487',
      email: 'speterson@familyrides.co',
      rating: 4.8,
      location: 'Berkeley, CA'
    }
  },
  {
    id: 'car-10',
    make: 'Mercedes-Benz',
    model: 'C300 Sport',
    year: 2019,
    price: 24900,
    mileage: 46100,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    exteriorColor: 'Obsidian Black Metallic',
    interiorColor: 'Silk Beige MB-Tex',
    engine: '2.0L Inline-4 Turbo',
    drivetrain: 'RWD',
    features: ['AMG Styling Theme Pack', 'Panoramic Roof', 'Burmester Sound System', 'Blind Spot Assist', 'Dynamic Select', '64-Color Ambient Lighting', 'Heated Steering Wheel'],
    description: 'An elegant commuter with a highly athletic AMG exterior styling package. Excellent fuel economy (up to 35 MPG highway). Luxurious ambient atmosphere makes every drive feel first-class. Thoroughly maintained with single ownership record.',
    imageUrl: 'https://picsum.photos/seed/mercedesc300/800/600',
    condition: 'Very Good',
    history: {
      owners: 1,
      accidents: 0,
      serviceHistory: 'Mercedes-Benz routine maintenance scheduled on a strict annual cycle. Fully documented.'
    },
    seller: {
      name: 'Thomas Wu',
      phone: '(408) 555-0352',
      email: 'twu_c300@fastcommute.com',
      rating: 4.9,
      location: 'Milpitas, CA'
    }
  },
  {
    id: 'car-11',
    make: 'Subaru',
    model: 'Outback Wilderness',
    year: 2022,
    price: 31200,
    mileage: 19800,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'SUV',
    exteriorColor: 'Geyser Blue',
    interiorColor: 'Gray StarTex Water-Repellent Seats',
    engine: '2.4L DOHC Turbocharged Subaru BOXER',
    drivetrain: 'AWD',
    features: ['High Ground Clearance (9.5-inch)', 'Dual-Function X-MODE', 'Yokohama GEOLANDAR All-Terrain Tires', 'Roof Rails with Copper Accents', 'EyeSight Driver Assist Technology'],
    description: 'The ultimate adventure wagon. This Subaru Outback Wilderness looks highly distinct with its Geyser Blue paint and matte-black styling accents. Excellent for snow, trails, and highway cruising. Spacious layout, all-weather mats included.',
    imageUrl: 'https://picsum.photos/seed/subaruoutback/800/600',
    condition: 'Excellent',
    history: {
      owners: 1,
      accidents: 0,
      serviceHistory: 'Serviced at Subaru of Walnut Creek at 10,000 km, 20,000 km, and 30,000 km.'
    },
    seller: {
      name: 'Walnut Creek Subaru Corp',
      phone: '(925) 555-0145',
      email: 'certified-sales@wcsubaru.com',
      rating: 4.7,
      location: 'Walnut Creek, CA'
    }
  },
  {
    id: 'car-12',
    make: 'BMW',
    model: 'X5 xDrive',
    year: 2017,
    price: 21800,
    mileage: 72400,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'SUV',
    exteriorColor: 'Mineral White Metallic',
    interiorColor: 'Canberra Beige Dakota Leather',
    engine: '3.0L Turbocharged inline-6',
    drivetrain: 'AWD',
    features: ['Premium Package', 'Driving Assistance Package', 'Panoramic Sunroof', 'Navigation System', 'Soft Close Automatic Doors', '3rd Row Seat option Included'],
    description: 'Impeccably maintained family SUV at a highly accessible price tier. Features premium leather, panoramic roof, soft-close doors, and three rows of seating. Active safety assists make standard driving a secure pleasure.',
    imageUrl: 'https://picsum.photos/seed/bmwx5/800/600',
    condition: 'Good',
    history: {
      owners: 2,
      accidents: 1,
      serviceHistory: 'Rear bumper replaced professionally in 2020 due to low-speed minor parking dent, flawless finish.'
    },
    seller: {
      name: 'Robert Miller',
      phone: '(925) 555-0814',
      email: 'robert.m.x5@familycarbuyers.com',
      rating: 4.6,
      location: 'Concord, CA'
    }
  },
  {
    id: 'car-13',
    make: 'Ford',
    model: 'Mustang GT',
    year: 2015,
    price: 18900,
    mileage: 68100,
    fuelType: 'Gasoline',
    transmission: 'Manual',
    bodyType: 'Coupe',
    exteriorColor: 'Deep Impact Blue Metallic',
    interiorColor: 'Ebony Leather-Trimmed Seats',
    engine: '5.0L Ti-VCT V8 Coyote Engine',
    drivetrain: 'RWD',
    features: ['GT Performance Package', 'Selectable Drive Modes', 'Shaker Pro Audio System with 12 Speakers', 'Track Apps', 'Line Lock Capability'],
    description: 'A pure muscle car experience. Featuring the robust 5.0L Coyote V8 paired with a satisfying manual 6-speed gear shifter. Included performance pack brings black gloss wheels, stiffer suspension tuning, and Brembos. Sounds and feels fantastic.',
    imageUrl: 'https://picsum.photos/seed/mustanggt/800/600',
    condition: 'Very Good',
    history: {
      owners: 3,
      accidents: 0,
      serviceHistory: 'Detailed logs. Oil changed exactly every 6,550 km. Brand new performance tires and updated clutch.'
    },
    seller: {
      name: 'Ethan Hunt',
      phone: '(209) 555-0524',
      email: 'ehunt.coyote@mustangGTclub.net',
      rating: 4.7,
      location: 'Modesto, CA'
    }
  },
  {
    id: 'car-14',
    make: 'Honda',
    model: 'Accord Hybrid',
    year: 2022,
    price: 29500,
    mileage: 15400,
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    exteriorColor: 'Sonic Gray Pearl',
    interiorColor: 'Black Leatherette Trim',
    engine: '2.0L ivtec 4cyl hybrid engine',
    drivetrain: 'FWD',
    features: ['Honda SENSING package', '19-inch Premium Alloy Wheels', 'Head-up display HUD', 'Wireless Apple CarPlay', 'Wireless Phone Charger', 'Ventilated Front Seats'],
    description: 'Stylish, sporty Sonic Gray Pearl Accord Touring. Merges premium hybrid economy (47/47 MPG) with an extremely spacious, modern executive style executive layout. Immaculate condition inside and out. Wireless CarPlay enables instant connection.',
    imageUrl: 'https://picsum.photos/seed/hondaaccord/800/600',
    condition: 'Excellent',
    history: {
      owners: 1,
      accidents: 0,
      serviceHistory: 'Standard maintenance checklists registered at Honda San Francisco Dealer. Tires in perfect condition.'
    },
    seller: {
      name: 'Jessica Reynolds',
      phone: '(415) 555-0741',
      email: 'jess.reynolds@sf-commuters.co',
      rating: 4.9,
      location: 'San Francisco, CA'
    }
  }
];
