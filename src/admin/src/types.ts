import {
  CarBodyType,
  CarCondition,
  CarFuelType,
  CarStatus,
  CarTransmission,
} from "@repo/shared";

export interface SellerContact {
  id?: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  status?: "active" | "inactive";
  stock?: number;
}
export interface Car {
  id?: string;
  status: CarStatus;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: CarFuelType;
  transmission: CarTransmission;
  bodyType: CarBodyType;
  exteriorColor?: string;
  interiorColor?: string;
  engine?: string;
  drivetrain?: string;
  features?: string;
  description: string;
  imageUrl: string;
  images?: string[];
  condition: CarCondition;
  sellerId?: string;
  seller?: SellerContact;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: "view" | "enquiry" | "search" | "create" | "update" | "delete" | "login" | "logout";
  carId?: string;
  carName: string;
  message: string;
}


