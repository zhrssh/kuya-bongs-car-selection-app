import { useState, useMemo, useEffect } from 'react';
import { Car, Pagination } from './types';
import { FilterState, SortKey, CarStatus } from '@repo/shared';
import { fetchCars } from './apiClient';
import { useDebounce } from './hooks/useDebounce';
import { FilterSidebar } from './components/FilterSidebar';
import { CarCard } from './components/CarCard';
import { CarDetailModal } from './components/CarDetailModal';
import { ComparePanel } from './components/ComparePanel';
import {
  Car as CarIcon,
  Search,
  ArrowUpDown,
  Filter,
  X,
  BadgeAlert,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const INITIAL_FILTER: FilterState = {
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

const ITEMS_PER_PAGE = 21;

export default function App() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER);
  const [sortKey, setSortKey] = useState<SortKey>('relevance');
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [comparingCars, setComparingCars] = useState<Car[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    per_page: ITEMS_PER_PAGE,
    total: 0,
    pages: 1,
    has_next: false,
    has_prev: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(filters.searchQuery, 300);
  const debouncedPriceMin = useDebounce(filters.priceMin, 300);
  const debouncedPriceMax = useDebounce(filters.priceMax, 300);

  const effectiveFilters = useMemo<FilterState>(
    () => ({
      ...filters,
      searchQuery: debouncedSearchQuery,
      priceMin: debouncedPriceMin,
      priceMax: debouncedPriceMax,
    }),
    [
      filters.make,
      filters.model,
      filters.yearMin,
      filters.yearMax,
      filters.bodyType,
      filters.fuelType,
      filters.transmission,
      filters.condition,
      debouncedSearchQuery,
      debouncedPriceMin,
      debouncedPriceMax,
    ],
  );

  useEffect(() => {
    setIsLoading(true);
    fetchCars(currentPage, effectiveFilters, sortKey, CarStatus.Available)
      .then((data) => {
        setCars(data.cars);
        setPagination(data.pagination);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [currentPage, effectiveFilters, sortKey]);

  const handleChange = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === 'make') {
        updated.model = '';
      }
      return updated;
    });
    setCurrentPage(1);
  };

  const handlePriceQuickSelect = (min: string, max: string) => {
    setFilters((prev) => ({ ...prev, priceMin: min, priceMax: max }));
    setCurrentPage(1);
  };

  const handleYearQuickSelect = (min: string, max: string) => {
    setFilters((prev) => ({ ...prev, yearMin: min, yearMax: max }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTER);
    setCurrentPage(1);
  };

  const sortedCars = useMemo(() => {
    const list = [...cars];
    switch (sortKey) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'year-desc':
        return list.sort((a, b) => b.year - a.year);
      case 'year-asc':
        return list.sort((a, b) => a.year - b.year);
      case 'mileage-asc':
        return list.sort((a, b) => a.mileage - b.mileage);
      case 'relevance':
      default:
        return list;
    }
  }, [cars, sortKey]);

  const handleToggleCompare = (car: Car) => {
    setComparingCars((prev: Car[]) => {
      const exists = prev.some((c) => c.id === car.id);
      if (exists) {
        return prev.filter((c) => c.id !== car.id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, car];
    });
  };

  const handleRemoveFromCompare = (car: Car) => {
    setComparingCars((prev: Car[]) => prev.filter((c) => c.id !== car.id));
  };

  const handleClearCompare = () => {
    setComparingCars([]);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.make) count++;
    if (filters.model) count++;
    if (filters.yearMin) count++;
    if (filters.yearMax) count++;
    if (filters.priceMin) count++;
    if (filters.priceMax) count++;
    if (filters.bodyType) count++;
    if (filters.fuelType) count++;
    if (filters.transmission) count++;
    if (filters.searchQuery) count++;
    if (filters.condition) count++;
    return count;
  }, [filters]);

  return (
    <div className="min-h-screen bg-slate-55/40 font-sans text-slate-800 antialiased flex flex-col pb-36">

      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white rounded-xl p-2.5 shadow-sm">
              <CarIcon className="h-5.5 w-5.5 stroke-[2]" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg tracking-tight text-slate-900 leading-none">
                PRESTIGE <span className="font-light text-slate-500">MARQUE</span>
              </h1>
              <span className="text-[10px] font-mono tracking-widest text-blue-600 uppercase block font-bold mt-1">
                Curated Used Vehicles
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 max-w-xs w-full relative">
            <input
              type="text"
              placeholder="Search by brand, model or keyword..."
              value={filters.searchQuery}
              onChange={(e) => handleChange('searchQuery', e.target.value)}
              className="w-full bg-slate-100 border-none py-2 px-9 rounded-full text-xs outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-800"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />

            {filters.searchQuery && (
              <button
                onClick={() => handleChange('searchQuery', '')}
                className="absolute right-3 top-2.5 bg-slate-200 hover:bg-slate-300 text-slate-600 p-0.5 rounded-full text-xs cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">

        <div className="relative bg-slate-900 text-white rounded-3xl p-6 sm:p-10 md:p-12 overflow-hidden shadow-sm flex flex-col justify-center min-h-[160px] md:min-h-[180px] border border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-700/10 via-slate-900/40 to-slate-950/90 pointer-events-none" />

          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-semibold text-blue-300 mb-3.5 tracking-wide uppercase leading-none">
              <Star className="h-3 w-3 text-blue-400" />
              CURATED PREMIUM PRESTIGE
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl leading-tight tracking-tight">
              Find your next <br />automotive masterpiece
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2.5 max-w-sm">
              Discover an elite showcase of fine pre-owned automobiles. Meticulously inspected, mechanically certified, and detailed to pristine condition.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr] gap-8 items-start">

          <div className="hidden lg:block sticky top-28 self-start">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleChange}
              onPriceQuickSelect={handlePriceQuickSelect}
              onYearQuickSelect={handleYearQuickSelect}
              cars={cars}
              onReset={handleResetFilters}
            />
          </div>

          <div className="flex flex-col gap-6">

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_4px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row items-center justify-between gap-4">

              <div className="text-xs text-slate-500 font-medium self-start sm:self-auto select-none uppercase tracking-wider">
                Showing{' '}
                <span className="font-bold text-slate-900">{sortedCars.length}</span>{' '}
                {sortedCars.length === 1 ? 'vehicle' : 'vehicles'}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">

                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-4.5 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all cursor-pointer select-none focus:outline-none"
                >
                  <Filter className="h-3.5 w-3.5 mr-0.5" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-600 text-white rounded-full w-4.5 h-4.5 text-[9px] flex items-center justify-center font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto relative max-w-[180px] sm:max-w-none">
                  <span className="hidden md:inline text-[11px] font-semibold text-slate-400 uppercase tracking-wider select-none">
                    Sort By:
                  </span>
                  <div className="relative flex-1">
                    <select
                      value={sortKey}
                      onChange={(e) => {
                        setSortKey(e.target.value as SortKey);
                        setCurrentPage(1);
                      }}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-full py-1.5 px-3 pl-8 pr-8 text-xs font-medium text-slate-800 outline-none hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                    >
                      <option value="relevance">Featured & Relevance</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="year-desc">Year: Newest First</option>
                      <option value="year-asc">Year: Oldest First</option>
                      <option value="mileage-asc">Mileage: Lowest First</option>
                    </select>
                    <ArrowUpDown className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <div className="absolute right-3 top-3.5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500" />
                  </div>
                </div>

              </div>

            </div>

            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center bg-slate-100/60 border border-slate-200/50 p-3 rounded-2xl animate-in fade-in duration-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest select-none mr-1.5 leading-none">
                  Active Filters ({activeFiltersCount}):
                </span>

                {filters.make && (
                  <span className="inline-flex items-center gap-1.5 bg-white text-xs text-slate-800 border border-slate-200 px-3 py-1 rounded-full">
                    {filters.make}
                    <button onClick={() => handleChange('make', '')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.model && (
                  <span className="inline-flex items-center gap-1.5 bg-white text-xs text-slate-800 border border-slate-200 px-3 py-1 rounded-full">
                    {filters.model}
                    <button onClick={() => handleChange('model', '')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(filters.priceMin || filters.priceMax) && (
                  <span className="inline-flex items-center gap-1.5 bg-white text-xs text-slate-800 border border-slate-200 px-3 py-1 rounded-full">
                    Price: {filters.priceMin ? `₱${Number(filters.priceMin).toLocaleString('en-PH')}` : '₱0'} - {filters.priceMax ? `₱${Number(filters.priceMax).toLocaleString('en-PH')}` : 'No Max'}
                    <button onClick={() => { handleChange('priceMin', ''); handleChange('priceMax', ''); }} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.condition && (
                  <span className="inline-flex items-center gap-1.5 bg-white text-xs text-slate-800 border border-slate-200 px-3 py-1 rounded-full">
                    Condition: {filters.condition}
                    <button onClick={() => handleChange('condition', '')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(filters.yearMin || filters.yearMax) && (
                  <span className="inline-flex items-center gap-1.5 bg-white text-xs text-slate-800 border border-slate-250 px-3 py-1 rounded-full">
                    Year: {filters.yearMin || 'Before'} - {filters.yearMax || 'Latest'}
                    <button onClick={() => { handleChange('yearMin', ''); handleChange('yearMax', ''); }} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.bodyType && (
                  <span className="inline-flex items-center gap-1.5 bg-white text-xs text-slate-800 border border-slate-200 px-3 py-1 rounded-full">
                    {filters.bodyType}
                    <button onClick={() => handleChange('bodyType', '')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.fuelType && (
                  <span className="inline-flex items-center gap-1.5 bg-white text-xs text-slate-800 border border-slate-200 px-3 py-1 rounded-full">
                    {filters.fuelType}
                    <button onClick={() => handleChange('fuelType', '')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.transmission && (
                  <span className="inline-flex items-center gap-1.5 bg-white text-xs text-slate-800 border border-slate-200 px-3 py-1 rounded-full">
                    {filters.transmission}
                    <button onClick={() => handleChange('transmission', '')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.searchQuery && (
                  <span className="inline-flex items-center gap-1.5 bg-white text-xs text-slate-800 border border-slate-200 px-3 py-1 rounded-full">
                    "{filters.searchQuery}"
                    <button onClick={() => handleChange('searchQuery', '')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={handleResetFilters}
                  className="text-xs text-blue-650 hover:text-blue-700 font-semibold ml-auto px-2 py-1 rounded cursor-pointer transition-colors focus:outline-none"
                >
                  Reset All
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-400 font-medium">Loading vehicles...</span>
                </div>
              </div>
            ) : sortedCars.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedCars.map((car) => (
                    <CarCard
                      key={car.id}
                      car={car}
                      onSelect={setSelectedCar}
                      isComparing={comparingCars.some((c) => c.id === car.id)}
                      onToggleCompare={handleToggleCompare}
                      canCompare={comparingCars.length < 3}
                    />
                  ))}
                </div>

                {pagination.total > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-8 border-t border-zinc-200">
                    <div className="text-xs text-zinc-500 font-sans">
                      Showing{' '}
                      <span className="font-semibold text-zinc-800">
                        {Math.min(
                          (pagination.page - 1) * ITEMS_PER_PAGE + 1,
                          pagination.total,
                        )}
                      </span>{' '}
                      to{' '}
                      <span className="font-semibold text-zinc-800">
                        {Math.min(pagination.page * ITEMS_PER_PAGE, pagination.total)}
                      </span>{' '}
                      of{' '}
                      <span className="font-bold text-zinc-900">
                        {pagination.total}
                      </span>{' '}
                      vehicles
                    </div>

                    {pagination.pages > 1 && (
                      <div className="flex items-center gap-1.5 font-sans">
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={pagination.page === 1}
                          className="p-2 border border-zinc-200 hover:border-zinc-300 rounded-lg bg-white text-zinc-650 hover:text-zinc-800 disabled:opacity-40 disabled:hover:border-zinc-200 disabled:hover:text-zinc-650 cursor-pointer transition focus:outline-none flex items-center justify-center"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        {Array.from(
                          { length: pagination.pages },
                          (_, i) => i + 1,
                        ).map((pg) => {
                          const isSelected = pagination.page === pg;
                          return (
                            <button
                              key={pg}
                              onClick={() => setCurrentPage(pg)}
                              className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-semibold transition cursor-pointer border ${
                                isSelected
                                  ? "bg-blue-600 border-blue-600 text-white shadow-xs font-bold"
                                  : "bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50"
                              }`}
                            >
                              {pg}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => setCurrentPage((prev) => Math.min(pagination.pages, prev + 1))}
                          disabled={pagination.page === pagination.pages}
                          className="p-2 border border-zinc-200 hover:border-zinc-300 rounded-lg bg-white text-zinc-650 hover:text-zinc-800 disabled:opacity-40 disabled:hover:border-zinc-200 disabled:hover:text-zinc-650 cursor-pointer transition focus:outline-none flex items-center justify-center"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 animate-in fade-in duration-200 shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
                  <BadgeAlert className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-slate-900 mb-1">
                    No matching vehicles found
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    We currently don't host vehicle configurations matching your search. Please widen query details or clear active tags.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-all cursor-pointer focus:outline-none"
                >
                  Reset Active Filters
                </button>
              </div>
            )}

          </div>

        </div>

      </main>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex justify-end lg:hidden animate-in fade-in duration-250">
          <div className="absolute inset-0" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative bg-white w-full max-w-sm h-full shadow-2xl flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-250">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleChange}
              onPriceQuickSelect={handlePriceQuickSelect}
              onYearQuickSelect={handleYearQuickSelect}
              cars={cars}
              onReset={handleResetFilters}
              isOpen={mobileFiltersOpen}
              onClose={() => setMobileFiltersOpen(false)}
            />
          </div>
        </div>
      )}

      <ComparePanel
        comparingCars={comparingCars}
        onRemoveFromCompare={handleRemoveFromCompare}
        onClearCompare={handleClearCompare}
        onSelectCar={setSelectedCar}
      />

      <CarDetailModal
        car={selectedCar}
        onClose={() => setSelectedCar(null)}
      />

      <footer className="mt-auto border-t border-gray-150 bg-white py-12 text-gray-400 select-none text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-sans">
            &copy; {new Date().getFullYear()} Prestige Marque Ltd. All rights reserved. Registered automotive vendor #391-492-491.
          </p>
          <div className="flex gap-4 text-xs font-medium text-gray-400 hover:text-gray-600">
            <span className="hover:underline cursor-pointer">Consumer Rights Protection Act</span>
            <span className="hover:underline cursor-pointer">Terms of Sale</span>
            <span className="hover:underline cursor-pointer">Warranty & Service Policy</span>
          </div>
        </div>
      </footer>

    </div>
  );
}