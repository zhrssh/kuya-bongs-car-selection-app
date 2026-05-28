export interface SellerContact {
  name: string;
  phone: string;
  email: string;
  location: string;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: "Gasoline" | "Electric" | "Hybrid" | "Diesel";
  transmission: "Automatic" | "Manual";
  bodyType:
    | "Sedan"
    | "SUV"
    | "Truck"
    | "Hatchback"
    | "Coupe"
    | "Convertible"
    | "Van"
    | "Wagon";
  exteriorColor: string;
  interiorColor: string;
  engine: string;
  drivetrain: string;
  features: string[];
  description: string;
  imageUrl: string;
  condition: "Excellent" | "Very Good" | "Good";
  status?: "available" | "sold" | "archived";
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

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: "view" | "enquiry" | "search" | "create" | "update" | "delete";
  carId?: string;
  carName: string;
  message: string;
  userLocation: string;
}

export interface DailyMetricData {
  date: string;
  views: number;
  leads: number;
  searches: number;
}
