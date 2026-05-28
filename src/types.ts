/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CarHistory {
  owners: number;
  accidents: number;
  serviceHistory: string;
}

export interface SellerContact {
  name: string;
  phone: string;
  email: string;
  rating: number;
  location: string;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: 'Gasoline' | 'Electric' | 'Hybrid' | 'Diesel';
  transmission: 'Automatic' | 'Manual';
  bodyType: 'SUV' | 'Sedan' | 'Coupe' | 'Truck' | 'Hatchback' | 'Convertible';
  exteriorColor: string;
  interiorColor: string;
  engine: string;
  drivetrain: string;
  features: string[];
  description: string;
  imageUrl: string;
  condition: 'Excellent' | 'Very Good' | 'Good';
  history: CarHistory;
  seller: SellerContact;
}

export interface FilterState {
  make: string;
  model: string;
  yearMin: string;
  yearMax: string;
  priceMin: string;
  priceMax: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
  searchQuery: string;
  condition: string;
}

export type SortKey = 'price-asc' | 'price-desc' | 'year-desc' | 'year-asc' | 'mileage-asc' | 'relevance';
