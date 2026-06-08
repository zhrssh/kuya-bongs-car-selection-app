/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CarBodyType,
  CarCondition,
  CarFuelType,
  CarTransmission,
} from "./enums";

export interface SellerContact {
  name: string;
  phone: string;
  email: string;
  location: string;
}

export interface Car {
  id: string;
  status?: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: CarFuelType;
  transmission: CarTransmission;
  bodyType: CarBodyType;
  exteriorColor: string;
  interiorColor: string;
  engine: string;
  drivetrain: string;
  features: string;
  description: string;
  imageUrl: string;
  images?: string[];
  condition: CarCondition;
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

export type SortKey =
  | "price-asc"
  | "price-desc"
  | "year-desc"
  | "year-asc"
  | "mileage-asc"
  | "relevance";

export interface Pagination {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}
