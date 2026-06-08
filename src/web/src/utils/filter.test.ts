
import { filterCars } from './filter';
import { Car, FilterState } from '../types';

const mockCars: Car[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    price: 1000000,
    mileage: 50000,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    exteriorColor: 'White',
    interiorColor: 'Black',
    engine: '2.5L',
    drivetrain: 'FWD',
    features: 'None',
    description: 'Good condition',
    imageUrl: '',
    condition: 'Good',
    seller: { name: 'Seller', phone: '123', email: 'a@b.com', location: 'City' }
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    price: 1200000,
    mileage: 30000,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    exteriorColor: 'Blue',
    interiorColor: 'Black',
    engine: '1.5L',
    drivetrain: 'FWD',
    features: 'None',
    description: 'Excellent condition',
    imageUrl: '',
    condition: 'Excellent',
    seller: { name: 'Seller', phone: '123', email: 'a@b.com', location: 'City' }
  }
];

const defaultFilters: FilterState = {
  make: '',
  model: '',
  yearMin: '',
  yearMax: '',
  priceMin: '',
  priceMax: '',
  bodyType: '',
  fuelType: '',
  transmission: '',
  searchQuery: '',
  condition: '',
};

console.log('Testing condition filter with mismatched casing...');
const filters: FilterState = { ...defaultFilters, condition: 'excellent' }; // Lowercase
const filtered = filterCars(mockCars, filters);

console.log('Filtered cars:', filtered.length);
if (filtered.length !== 1 || filtered[0].condition.toLowerCase() !== filters.condition.toLowerCase()) {
  console.error('Test failed: Condition filter not working correctly');
  process.exit(1);
} else {
  console.log('Test passed: Condition filter working correctly');
}
