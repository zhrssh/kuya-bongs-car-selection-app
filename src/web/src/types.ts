/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CarBodyType,
  CarCondition,
  CarFuelType,
  CarTransmission,
} from "@repo/shared";

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

export interface Pagination {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}
