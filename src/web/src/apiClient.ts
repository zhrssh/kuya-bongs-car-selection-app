import { Car, Pagination } from "./types";
import { FilterState, SortKey } from "@repo/shared";

const API_BASE_URL = (import.meta.env as any).VITE_FLASK_APP_API_URL;
const ITEMS_PER_PAGE = 21;

interface FetchCarsResponse {
  cars: Car[];
  pagination: Pagination;
}

export async function fetchCars(
  page: number,
  filters: FilterState,
  sort: SortKey,
  status?: string,
): Promise<FetchCarsResponse> {
  let url = `${API_BASE_URL}/api/cars?page=${page}&per_page=${ITEMS_PER_PAGE}`;

  if (status) url += `&status=${status}`;

  if (filters.make) url += `&make=${filters.make}`;
  if (filters.model) url += `&model=${filters.model}`;
  if (filters.bodyType) url += `&bodyType=${filters.bodyType}`;
  if (filters.fuelType) url += `&fuelType=${filters.fuelType}`;
  if (filters.transmission) url += `&transmission=${filters.transmission}`;
  if (filters.condition) url += `&condition=${filters.condition}`;
  if (filters.priceMin) url += `&priceMin=${filters.priceMin}`;
  if (filters.priceMax) url += `&priceMax=${filters.priceMax}`;
  if (filters.yearMin) url += `&yearMin=${filters.yearMin}`;
  if (filters.yearMax) url += `&yearMax=${filters.yearMax}`;
  if (filters.searchQuery) url += `&search=${filters.searchQuery}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch cars");
  }

  const data = await response.json();
  return { cars: data.data.cars, pagination: data.data.pagination };
}

export async function sendEmail(
  car: Car,
  userName: String,
  userEmail: String,
  message: String,
  interestType: String,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/cars/${car.id}/inquire`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender_name: userName,
      sender_email: userEmail,
      message: message,
      interest_type: interestType,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send inquiry");
  }
}