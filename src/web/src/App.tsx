import { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Car, Pagination } from './types';
import { FilterState, SortKey, CarStatus, Skeleton, Spinner, ErrorState } from '@repo/shared';
import { fetchCars } from './apiClient';
import { useDebounce } from '@repo/shared';
import { FilterSidebar } from './components/FilterSidebar';
import { CarCard } from './components/CarCard';
import { CarDetailModal } from './components/CarDetailModal';
import { ComparePanel } from './components/ComparePanel';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import {
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
    <div className="min-h-screen bg-bg-page font-sans text-text-body antialiased flex flex-col pb-36">

      <header className="sticky top-0 z-30 bg-bg-surface/90 backdrop-blur-md border-b border-border/80 shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="KBCS – Kuya Bong's Car Selection"
              className="w-14 h-14 rounded-xl flex-shrink-0"
            />
            <div className="w-px h-9 bg-navy/30" />
            <div>
              <h1 className="font-display font-extrabold text-2xl tracking-[-0.02em] text-navy leading-none">
                KBCS
              </h1>
              <span className="text-xs font-sans font-medium text-text-muted block mt-1">
                Kuya Bong's Car Selection
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 max-w-xs w-full relative">
            <input
              type="text"
              placeholder="Search by brand, model or keyword..."
              value={filters.searchQuery}
              onChange={(e) => handleChange('searchQuery', e.target.value)}
              className="w-full bg-bg-muted border-none py-2 px-9 rounded-full text-xs outline-none focus:bg-bg-surface focus:ring-2 focus:ring-brand/20 transition-all text-text-body"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-faint" />

            {filters.searchQuery && (
              <button
                onClick={() => handleChange('searchQuery', '')}
                className="absolute right-3 top-2.5 bg-bg-hover hover:bg-bg-hover-strong text-text-secondary p-0.5 rounded-full text-xs cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

        </div>
      </header>

      <Routes>
        <Route path="/" element={
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">

            <div className="relative bg-bg-dark text-white rounded-3xl p-6 sm:p-10 md:p-12 overflow-hidden shadow-sm flex flex-col justify-center min-h-[160px] md:min-h-[180px] border border-text-body">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand/10 via-bg-dark/40 to-[#020617]/90 pointer-events-none" />

              <div className="relative z-10 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/60 border border-gold/50 text-[11px] font-semibold text-white mb-3.5 tracking-wide uppercase leading-none">
                  <Star className="h-[1em] w-[1em] text-white shrink-0" />
                  <span className="leading-none translate-y-[0.5px]">BROWSE APPROVED VEHICLES</span>
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl leading-tight tracking-tight">
                  Quality pre-owned cars <br />you can rely on
                </h2>
                <p className="text-xs text-text-faint leading-relaxed font-sans mt-2.5 max-w-sm">
                  Every car on our lot is handpicked, thoroughly inspected, and ready to hit the road. Your next trusted vehicle is just a click away.
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

                <div className="bg-bg-surface rounded-2xl border border-border/80 p-4 shadow-[0_1px_4px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row items-center justify-between gap-4">

                  <div className="text-xs text-text-muted font-medium self-start sm:self-auto select-none uppercase tracking-wider">
                    Showing{' '}
                    <span className="font-bold text-text-strong">{sortedCars.length}</span>{' '}
                    {sortedCars.length === 1 ? 'vehicle' : 'vehicles'}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">

                    <button
                      onClick={() => setMobileFiltersOpen(true)}
                      className="lg:hidden flex items-center gap-1.5 px-4.5 py-2 rounded-full border border-border text-xs font-semibold text-text-secondary bg-bg-surface hover:bg-bg-raised transition-all cursor-pointer select-none focus:outline-none"
                    >
                      <Filter className="h-3.5 w-3.5 mr-0.5" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <span className="bg-brand text-text-on-brand rounded-full w-4.5 h-4.5 text-[9px] flex items-center justify-center font-bold">
                          {activeFiltersCount}
                        </span>
                      )}
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto relative max-w-[180px] sm:max-w-none">
                      <span className="hidden md:inline text-[11px] font-semibold text-text-faint uppercase tracking-wider select-none">
                        Sort By:
                      </span>
                      <div className="relative flex-1">
                        <select
                          value={sortKey}
                          onChange={(e) => {
                            setSortKey(e.target.value as SortKey);
                            setCurrentPage(1);
                          }}
                          className="w-full appearance-none bg-bg-raised border border-border rounded-full py-1.5 px-3 pl-8 pr-8 text-xs font-medium text-text-body outline-none hover:border-border-hover focus:bg-bg-surface focus:ring-2 focus:ring-brand/20 transition-all cursor-pointer"
                        >
                          <option value="relevance">Featured & Relevance</option>
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                          <option value="year-desc">Year: Newest First</option>
                          <option value="year-asc">Year: Oldest First</option>
                          <option value="mileage-asc">Mileage: Lowest First</option>
                        </select>
                        <ArrowUpDown className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-faint pointer-events-none" />
                        <div className="absolute right-3 top-3.5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-text-muted" />
                      </div>
                    </div>

                  </div>

                </div>

                {activeFiltersCount > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center bg-bg-muted/60 border border-border/50 p-3 rounded-2xl animate-in fade-in duration-200">
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest select-none mr-1.5 leading-none">
                      Active Filters ({activeFiltersCount}):
                    </span>

                    {filters.make && (
                      <span className="inline-flex items-center gap-1.5 bg-bg-surface text-xs text-text-body border border-border px-3 py-1 rounded-full">
                        {filters.make}
                        <button onClick={() => handleChange('make', '')} className="text-text-faint hover:text-text-secondary-hover cursor-pointer">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {filters.model && (
                      <span className="inline-flex items-center gap-1.5 bg-bg-surface text-xs text-text-body border border-border px-3 py-1 rounded-full">
                        {filters.model}
                        <button onClick={() => handleChange('model', '')} className="text-text-faint hover:text-text-secondary-hover cursor-pointer">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {(filters.priceMin || filters.priceMax) && (
                      <span className="inline-flex items-center gap-1.5 bg-bg-surface text-xs text-text-body border border-border px-3 py-1 rounded-full">
                        Price: {filters.priceMin ? `₱${Number(filters.priceMin).toLocaleString('en-PH')}` : '₱0'} - {filters.priceMax ? `₱${Number(filters.priceMax).toLocaleString('en-PH')}` : 'No Max'}
                        <button onClick={() => { handleChange('priceMin', ''); handleChange('priceMax', ''); }} className="text-text-faint hover:text-text-secondary-hover cursor-pointer">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {filters.condition && (
                      <span className="inline-flex items-center gap-1.5 bg-bg-surface text-xs text-text-body border border-border px-3 py-1 rounded-full">
                        Condition: {filters.condition}
                        <button onClick={() => handleChange('condition', '')} className="text-text-faint hover:text-text-secondary-hover cursor-pointer">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {(filters.yearMin || filters.yearMax) && (
                      <span className="inline-flex items-center gap-1.5 bg-bg-surface text-xs text-text-body border border-border px-3 py-1 rounded-full">
                        Year: {filters.yearMin || 'Before'} - {filters.yearMax || 'Latest'}
                        <button onClick={() => { handleChange('yearMin', ''); handleChange('yearMax', ''); }} className="text-text-faint hover:text-text-secondary-hover cursor-pointer">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {filters.bodyType && (
                      <span className="inline-flex items-center gap-1.5 bg-bg-surface text-xs text-text-body border border-border px-3 py-1 rounded-full">
                        {filters.bodyType}
                        <button onClick={() => handleChange('bodyType', '')} className="text-text-faint hover:text-text-secondary-hover cursor-pointer">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {filters.fuelType && (
                      <span className="inline-flex items-center gap-1.5 bg-bg-surface text-xs text-text-body border border-border px-3 py-1 rounded-full">
                        {filters.fuelType}
                        <button onClick={() => handleChange('fuelType', '')} className="text-text-faint hover:text-text-secondary-hover cursor-pointer">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {filters.transmission && (
                      <span className="inline-flex items-center gap-1.5 bg-bg-surface text-xs text-text-body border border-border px-3 py-1 rounded-full">
                        {filters.transmission}
                        <button onClick={() => handleChange('transmission', '')} className="text-text-faint hover:text-text-secondary-hover cursor-pointer">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {filters.searchQuery && (
                      <span className="inline-flex items-center gap-1.5 bg-bg-surface text-xs text-text-body border border-border px-3 py-1 rounded-full">
                        "{filters.searchQuery}"
                        <button onClick={() => handleChange('searchQuery', '')} className="text-text-faint hover:text-text-secondary-hover cursor-pointer">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    <button
                      onClick={handleResetFilters}
                      className="text-xs text-brand hover:text-brand-dark font-semibold ml-auto px-2 py-1 rounded cursor-pointer transition-colors focus:outline-none"
                    >
                      Reset All
                    </button>
                  </div>
                )}

                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-bg-surface rounded-3xl border border-border overflow-hidden flex flex-col h-full">
                        <Skeleton className="aspect-[4/3] w-full rounded-none" />
                        <div className="p-4 space-y-3 flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <div className="space-y-1.5 flex-1">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="h-5 w-16 rounded-full shrink-0" />
                          </div>
                          <Skeleton className="h-6 w-1/3" />
                          <div className="flex gap-3">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-14" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error && !isLoading ? (
                  <ErrorState message={error} onRetry={() => {
                    setIsLoading(true);
                    setError(null);
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
                  }} />
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
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-8 border-t border-border">
                        <div className="text-xs text-text-muted font-sans">
                          Showing{' '}
                          <span className="font-semibold text-text-body">
                            {Math.min(
                              (pagination.page - 1) * ITEMS_PER_PAGE + 1,
                              pagination.total,
                            )}
                          </span>{' '}
                          to{' '}
                          <span className="font-semibold text-text-body">
                            {Math.min(pagination.page * ITEMS_PER_PAGE, pagination.total)}
                          </span>{' '}
                          of{' '}
                          <span className="font-bold text-text-strong">
                            {pagination.total}
                          </span>{' '}
                          vehicles
                        </div>

                        {pagination.pages > 1 && (
                          <div className="flex items-center gap-1.5 font-sans">
                            <button
                              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                              disabled={pagination.page === 1}
                              className="p-2 border border-border hover:border-border-hover rounded-lg bg-bg-surface text-text-muted hover:text-text-body disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-muted cursor-pointer transition focus:outline-none flex items-center justify-center"
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
                                      ? "bg-brand border-brand text-text-on-brand shadow-xs font-bold"
                                      : "bg-bg-surface border-border text-text-muted hover:bg-bg-raised"
                                  }`}
                                >
                                  {pg}
                                </button>
                              );
                            })}

                            <button
                              onClick={() => setCurrentPage((prev) => Math.min(pagination.pages, prev + 1))}
                              disabled={pagination.page === pagination.pages}
                              className="p-2 border border-border hover:border-border-hover rounded-lg bg-bg-surface text-text-muted hover:text-text-body disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-muted cursor-pointer transition focus:outline-none flex items-center justify-center"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-bg-surface border border-border rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 animate-in fade-in duration-200 shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                    <div className="w-14 h-14 bg-warning-bg rounded-full flex items-center justify-center text-warning">
                      <BadgeAlert className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-lg text-text-strong mb-1">
                        No matching vehicles found
                      </h3>
                      <p className="text-xs text-text-muted max-w-xs mx-auto">
                        We currently don't host vehicle configurations matching your search. Please widen query details or clear active tags.
                      </p>
                    </div>
                    <button
                      onClick={handleResetFilters}
                      className="bg-brand hover:bg-brand-dark text-text-on-brand text-xs font-semibold px-6 py-2.5 rounded-full transition-all cursor-pointer focus:outline-none"
                    >
                      Reset Active Filters
                    </button>
                  </div>
                )}

              </div>

            </div>

          </main>
        } />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-bg-dark/40 backdrop-blur-md flex justify-end lg:hidden animate-in fade-in duration-250">
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

      <footer className="mt-auto border-t border-border bg-bg-surface py-12 text-text-faint select-none text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-sans">
            &copy; {new Date().getFullYear()} Kuya Bong's Car Selection. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs font-medium text-text-faint hover:text-text-secondary">
            <Link to="/privacy" className="hover:underline cursor-pointer">Privacy Policy</Link>
            <Link to="/terms" className="hover:underline cursor-pointer">Terms of Sale</Link>
            <a href="https://lawphil.net/statutes/repacts/ra1992/ra_7394_1992.html" target="_blank" rel="noopener noreferrer" className="hover:underline cursor-pointer">Consumer Rights Protection Act</a>
            <Link to="/terms" className="hover:underline cursor-pointer">Warranty & Service Policy</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}