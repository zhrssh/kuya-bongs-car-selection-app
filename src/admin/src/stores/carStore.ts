import { create } from "zustand";
import { Car } from "../types";

interface CarStore {
  cars: Car[];
  selectedCar: Car | null;
  setCars: (cars: Car[]) => void;
  addCar: (car: Car) => void;
  updateCar: (car: Car) => void;
  removeCar: (id: string) => void;
  setSelectedCar: (car: Car | null) => void;
}

export const useCarStore = create<CarStore>((set) => ({
  cars: [],
  selectedCar: null,
  setCars: (cars) => set({ cars }),
  addCar: (car) => set((state) => ({ cars: [car, ...state.cars] })),
  updateCar: (car) =>
    set((state) => ({
      cars: state.cars.map((c) => (c.id === car.id ? car : c)),
    })),
  removeCar: (id) =>
    set((state) => ({
      cars: state.cars.filter((c) => c.id !== id),
    })),
  setSelectedCar: (car) => set({ selectedCar: car }),
}));
