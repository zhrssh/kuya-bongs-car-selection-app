import { FilterState, SortKey, CarStatus } from "@repo/shared";
import { create } from "zustand";
import { Car } from "../types";
import { useCarStore } from "./carStore";

export interface Pagination {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

const INITIAL_PAGINATION: Pagination = {
  page: 1,
  per_page: 21,
  total: 0,
  pages: 1,
  has_next: false,
  has_prev: false,
};

const INITIAL_FILTER: FilterState = {
  make: "",
  model: "",
  yearMin: "",
  yearMax: "",
  priceMin: "",
  priceMax: "",
  bodyType: "",
  fuelType: "",
  transmission: "",
  searchQuery: "",
  condition: "",
};

const ITEMS_PER_PAGE = 21;

interface InventoryState {
  filters: FilterState;
  sortKey: SortKey;
  statusTab: CarStatus;
  currentPage: number;
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;
  compareIds: string[];

  updateFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => void;
  resetFilters: () => void;
  setSortKey: (key: SortKey) => void;
  setStatusTab: (tab: CarStatus) => void;
  setCurrentPage: (page: number) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleCompareId: (id: string) => void;
  clearCompareIds: () => void;
  fetchCars: (
    page: number,
    status: CarStatus,
    filters: FilterState,
    sort: SortKey,
  ) => Promise<void>;
  handleDelete: (car: Car) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  filters: { ...INITIAL_FILTER },
  sortKey: "year-desc" as SortKey,
  statusTab: CarStatus.Available,
  currentPage: 1,
  pagination: { ...INITIAL_PAGINATION },
  isLoading: false,
  error: null,
  compareIds: [],

  updateFilter: (key, value) =>
    set((state) => {
      const updated = { ...state.filters, [key]: value };
      if (key === "make") {
        updated.model = "";
      }
      return { filters: updated, currentPage: 1 };
    }),

  resetFilters: () =>
    set({ filters: { ...INITIAL_FILTER } }),

  setSortKey: (key) => set({ sortKey: key, currentPage: 1 }),

  setStatusTab: (tab) => set({ statusTab: tab, currentPage: 1 }),

  setCurrentPage: (page) => set({ currentPage: page }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  toggleCompareId: (id) =>
    set((state) => {
      if (state.compareIds.includes(id)) {
        return { compareIds: state.compareIds.filter((i) => i !== id) };
      }
      if (state.compareIds.length >= 3) return state;
      return { compareIds: [...state.compareIds, id] };
    }),

  clearCompareIds: () => set({ compareIds: [] }),

  fetchCars: async (page, status, filters, sort) => {
    set({ isLoading: true, error: null });
    let url = `${import.meta.env.VITE_FLASK_APP_API_URL}/api/cars?page=${page}&per_page=${ITEMS_PER_PAGE}`;
    if (status) url += `&status=${status}`;
    if (filters.make) url += `&make=${filters.make}`;
    if (filters.model) url += `&model=${filters.model}`;
    if (filters.bodyType) url += `&bodyType=${filters.bodyType}`;
    if (filters.fuelType) url += `&fuelType=${filters.fuelType}`;
    if (filters.transmission)
      url += `&transmission=${filters.transmission}`;
    if (filters.condition) url += `&condition=${filters.condition}`;
    if (filters.priceMin) url += `&priceMin=${filters.priceMin}`;
    if (filters.priceMax) url += `&priceMax=${filters.priceMax}`;
    if (filters.yearMin) url += `&yearMin=${filters.yearMin}`;
    if (filters.yearMax) url += `&yearMax=${filters.yearMax}`;
    if (filters.searchQuery) url += `&search=${filters.searchQuery}`;
    if (sort) url += `&sort=${sort}`;

    try {
      const response = await fetch(url, { credentials: "include" });
      const data = await response.json();
      if (data.status === "success") {
        useCarStore.getState().setCars(data.data.cars);
        set({
          pagination: {
            ...data.data.pagination,
            per_page: ITEMS_PER_PAGE,
          },
        });
      }
    } catch (err) {
      console.error("Error fetching cars:", err);
      alert("Failed to load cars. Please try again.");
      set({ error: "Failed to load cars. Please try again." });
    } finally {
      set({ isLoading: false });
    }
  },

  handleDelete: async (car: Car) => {
    const { currentPage, statusTab, filters, sortKey } = get();
    if (!confirm(`Are you sure you want to permanently delete ${car.make} ${car.model} (${car.year})?`)) {
      return;
    }
    try {
      const res = await fetch(
        `${import.meta.env.VITE_FLASK_APP_API_URL}/api/cars/${car.id}`,
        { method: "DELETE", credentials: "include" },
      );
      if (res.ok) {
        useCarStore.getState().removeCar(car.id!);
        if (useCarStore.getState().selectedCar?.id === car.id) {
          useCarStore.getState().setSelectedCar(null);
        }
      }
    } catch (err) {
      console.error("Error deleting car:", err);
      alert("Failed to delete car. Please try again.");
      set({ error: "Failed to delete car. Please try again." });
    }
    await get().fetchCars(currentPage, statusTab, filters, sortKey);
  },
}));
