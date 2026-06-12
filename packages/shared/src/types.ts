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
  | "mileage-asc";
