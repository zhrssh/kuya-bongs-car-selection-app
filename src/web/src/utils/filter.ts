
import { Car, FilterState } from '../types';

export const filterCars = (cars: Car[], filters: FilterState): Car[] => {
  return cars.filter((car) => {
    // Make / Brand
    if (filters.make && car.make !== filters.make) return false;

    // Model
    if (filters.model && car.model !== filters.model) return false;

    // Body Type
    if (filters.bodyType && car.bodyType !== filters.bodyType) return false;

    // Fuel Type
    if (filters.fuelType && car.fuelType !== filters.fuelType) return false;

    // Transmission
    if (filters.transmission && car.transmission !== filters.transmission) return false;

    // Condition
    if (filters.condition && car.condition.toLowerCase() !== filters.condition.toLowerCase()) return false;

    // Minimum Year
    if (filters.yearMin && car.year < parseInt(filters.yearMin, 10)) return false;

    // Maximum Year
    if (filters.yearMax && car.year > parseInt(filters.yearMax, 10)) return false;

    // Minimum Price
    if (filters.priceMin && car.price < parseInt(filters.priceMin, 10)) return false;

    // Maximum Price
    if (filters.priceMax && car.price > parseInt(filters.priceMax, 10)) return false;

    // Keyword Search query matches (Make, Model, Description)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase().trim();
      const matchesMake = car.make.toLowerCase().includes(query);
      const matchesModel = car.model.toLowerCase().includes(query);
      const matchesDesc = car.description.toLowerCase().includes(query);
      const matchesBody = car.bodyType.toLowerCase().includes(query);

      if (!matchesMake && !matchesModel && !matchesDesc && !matchesBody) {
        return false;
      }
    }

    return true;
  });
};
