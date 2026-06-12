import { CarStatus, FilterState, SortKey, Skeleton, Select } from "@repo/shared";
import { AnimatePresence, motion } from "motion/react";
import {
  Grid as GridIcon,
  Plus,
  Search,
  SlidersHorizontal,
  Table,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@repo/shared";
import { Car, SellerContact } from "../types";
import { useCarStore } from "../stores/carStore";
import { useInventoryStore } from "../stores/inventoryStore";
import CarFilterSidebar from "./CarFilterSidebar";
import CarFormModal from "./CarFormModal";
import CarPagination from "./CarPagination";
import CarCompare from "./CarCompare";
import CarGrid from "./CarGrid";
import CarTable from "./CarTable";

interface InventoryCMSProps {
  refreshKey: number;
  sellers: SellerContact[];
  onAddCar: (car: Car) => void;
  onUpdateCar: (car: Car) => void;
  isSaving: boolean;
}

export default function InventoryCMS({
  refreshKey,
  sellers,
  onAddCar,
  onUpdateCar,
  isSaving,
}: InventoryCMSProps) {
  // Navigation & layout states
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const filters = useInventoryStore((s) => s.filters);
  const sortKey = useInventoryStore((s) => s.sortKey);
  const statusTab = useInventoryStore((s) => s.statusTab);
  const currentPage = useInventoryStore((s) => s.currentPage);
  const updateFilter = useInventoryStore((s) => s.updateFilter);
  const resetFilters = useInventoryStore((s) => s.resetFilters);
  const setSortKey = useInventoryStore((s) => s.setSortKey);
  const setStatusTab = useInventoryStore((s) => s.setStatusTab);
  const setCurrentPage = useInventoryStore((s) => s.setCurrentPage);
  const fetchCars = useInventoryStore((s) => s.fetchCars);
  const isLoading = useInventoryStore((s) => s.isLoading);
  const error = useInventoryStore((s) => s.error);
  const handleDelete = useInventoryStore((s) => s.handleDelete);

  const debouncedSearchQuery = useDebounce(filters.searchQuery, 300);
  const debouncedPriceMin = useDebounce(filters.priceMin, 300);
  const debouncedPriceMax = useDebounce(filters.priceMax, 300);

  const cars = useCarStore((s) => s.cars);

  // Derive effective filters: non-search filters update immediately,
  // but searchQuery is debounced to avoid excessive API calls.
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

  useEffect(() => {
    fetchCars(currentPage, statusTab, effectiveFilters, sortKey);
  }, [currentPage, statusTab, effectiveFilters, sortKey, refreshKey]);

  // Create / Edit modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  // Handle open form for new car
  const handleOpenAdd = () => {
    setEditingCar(null);
    setIsFormOpen(true);
  };

  // Handle open form for editing car
  const handleOpenEdit = (car: Car) => {
    setEditingCar(car);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCar(null);
  };

  const paginatedCars = cars;

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search query input */}
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
          <input
            type="text"
            placeholder="Search make, model, features..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter("searchQuery", e.target.value)}
            className="w-full bg-bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-850 placeholder-text-faint focus:outline-none focus:ring-1 focus:ring-border focus:border-border font-sans transition-all"
            id="search_query"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap w-full lg:w-auto items-center justify-end gap-3 self-stretch lg:self-auto">
          <button
            onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-semibold cursor-pointer transition ${
              isFilterSidebarOpen
                ? "bg-brand/10 border-brand/20 text-brand-dark font-bold"
                : "bg-bg-surface border-border hover:bg-bg-raised text-text-secondary-hover"
            }`}
            id="toggle_filters_btn">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{isFilterSidebarOpen ? "Hide Filters" : "Show Filters"}</span>
            <span className="lg:hidden flex items-center gap-1.5">
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-brand text-text-on-brand rounded-full w-4.5 h-4.5 text-[9px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </span>
          </button>

          {/* Sorter Selector */}
          <Select
            value={sortKey}
            options={[
              { value: "price-asc", label: "Price: Low to High" },
              { value: "price-desc", label: "Price: High to Low" },
              { value: "year-desc", label: "Year: Newest First" },
              { value: "year-asc", label: "Year: Oldest First" },
              { value: "mileage-asc", label: "Lowest Mileage" },
            ]}
            onChange={(v) => setSortKey(v as SortKey)}
            id="catalog_sorter"
          />

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand hover:bg-brand-dark text-text-on-brand rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition font-sans"
            id="btn_add_car">
            <Plus className="w-3.5 h-3.5 text-text-on-brand" />
            Add Vehicle
          </button>

          {/* View Modes */}
          <div className="flex items-center bg-bg-muted border border-border/60 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition ${viewMode === "grid" ? "bg-bg-surface text-text-strong shadow-xs border border-border/40" : "text-text-muted hover:text-text-strong"}`}
              title="Grid View"
              id="view_grid">
              <GridIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition ${viewMode === "table" ? "bg-bg-surface text-text-strong shadow-xs border border-border/40" : "text-text-muted hover:text-text-strong"}`}
              title="Table View"
              id="view_table">
              <Table className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Sidebar */}
        {isFilterSidebarOpen && (
          <div className="hidden lg:block">
            <CarFilterSidebar onClose={() => setIsFilterSidebarOpen(false)} />
          </div>
        )}
        {/* Listings Section */}
        <div
          className={
            isFilterSidebarOpen
              ? "lg:col-span-3 space-y-6"
              : "lg:col-span-4 space-y-6"
          }>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-faint">
              Status Filter
            </label>
              <Select
                value={statusTab}
                options={[
                  { value: CarStatus.Available, label: "Available" },
                  { value: CarStatus.Sold, label: "Sold" },
                  { value: CarStatus.Archived, label: "Archived" },
                ]}
                onChange={(v) => setStatusTab(v as CarStatus)}
              />
          </div>

          {/* Active Filter Chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center bg-bg-muted/60 border border-border/50 p-3 rounded-2xl">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest select-none mr-1.5 leading-none">
                Active Filters ({activeFiltersCount}):
              </span>

              {filters.make && (
                <span className="inline-flex items-center gap-1.5 bg-bg-surface text-xs text-text-body border border-border px-3 py-1 rounded-full">
                  {filters.make}
                  <button onClick={() => updateFilter("make", "")} className="text-text-faint hover:text-text-secondary-hover cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.model && (
                <span className="inline-flex items-center gap-1.5 bg-bg-surface text-xs text-text-body border border-border px-3 py-1 rounded-full">
                  {filters.model}
                  <button onClick={() => updateFilter("model", "")} className="text-text-faint hover:text-text-secondary-hover cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(filters.priceMin || filters.priceMax) && (
                <span className="inline-flex items-center gap-1.5 bg-bg-surface text-xs text-text-body border border-border px-3 py-1 rounded-full">
                  Price: {filters.priceMin ? `₱${Number(filters.priceMin).toLocaleString("en-PH")}` : "₱0"} - {filters.priceMax ? `₱${Number(filters.priceMax).toLocaleString("en-PH")}` : "No Max"}
                  <button onClick={() => { updateFilter("priceMin", ""); updateFilter("priceMax", ""); }} className="text-text-faint hover:text-text-secondary-hover cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.condition && (
                <span className="inline-flex items-center gap-1.5 bg-bg-surface text-xs text-text-body border border-border px-3 py-1 rounded-full">
                  Condition: {filters.condition}
                  <button onClick={() => updateFilter("condition", "")} className="text-text-faint hover:text-text-secondary-hover cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(filters.yearMin || filters.yearMax) && (
                <span className="inline-flex items-center gap-1.5 bg-bg-surface text-xs text-text-body border border-border px-3 py-1 rounded-full">
                  Year: {filters.yearMin || "Before"} - {filters.yearMax || "Latest"}
                  <button onClick={() => { updateFilter("yearMin", ""); updateFilter("yearMax", ""); }} className="text-text-faint hover:text-text-secondary-hover cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.bodyType && (
                <span className="inline-flex items-center gap-1.5 bg-bg-surface text-xs text-text-body border border-border px-3 py-1 rounded-full">
                  {filters.bodyType}
                  <button onClick={() => updateFilter("bodyType", "")} className="text-text-faint hover:text-text-secondary-hover cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.fuelType && (
                <span className="inline-flex items-center gap-1.5 bg-bg-surface text-xs text-text-body border border-border px-3 py-1 rounded-full">
                  {filters.fuelType}
                  <button onClick={() => updateFilter("fuelType", "")} className="text-text-faint hover:text-text-secondary-hover cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.transmission && (
                <span className="inline-flex items-center gap-1.5 bg-bg-surface text-xs text-text-body border border-border px-3 py-1 rounded-full">
                  {filters.transmission}
                  <button onClick={() => updateFilter("transmission", "")} className="text-text-faint hover:text-text-secondary-hover cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.searchQuery && (
                <span className="inline-flex items-center gap-1.5 bg-bg-surface text-xs text-text-body border border-border px-3 py-1 rounded-full">
                  "{filters.searchQuery}"
                  <button onClick={() => updateFilter("searchQuery", "")} className="text-text-faint hover:text-text-secondary-hover cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              <button
                onClick={() => resetFilters()}
                className="text-xs text-brand hover:text-brand-dark font-semibold ml-auto px-2 py-1 rounded cursor-pointer transition-colors focus:outline-none"
              >
                Reset All
              </button>
            </div>
          )}

          {/* Main Stock Content Layout */}
          {isLoading && cars.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-bg-surface rounded-3xl border border-border overflow-hidden">
                  <Skeleton className="aspect-4/3 w-full rounded-none" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : cars.length === 0 ? (
            <div className="bg-bg-surface border border-border p-12 text-center rounded-xl shadow-xs">
              <p className="text-text-muted text-sm font-medium">
                No vehicles match your active filtering variables.
              </p>
              <button
                onClick={() => resetFilters()}
                className="mt-4 text-xs bg-brand text-text-on-brand px-4 py-2 rounded-lg hover:bg-brand-dark transition cursor-pointer font-medium"
                id="reset_empty_state">
                Clear Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <CarGrid onOpenEdit={handleOpenEdit} onDelete={handleDelete} />
          ) : (
            <CarTable cars={paginatedCars} onOpenEdit={handleOpenEdit} onDelete={handleDelete} />
          )}

          <CarPagination />
        </div>{" "}
        {/* Listings Section Container end */}
      </div>{" "}
      {/* Main Grid Layout end */}

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-bg-dark/40 backdrop-blur-md flex justify-end lg:hidden"
          >
            <div className="absolute inset-0" onClick={() => setIsFilterSidebarOpen(false)} />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="relative bg-white w-full max-w-sm h-full shadow-2xl flex flex-col"
            >
              <CarFilterSidebar
                isOpen={isFilterSidebarOpen}
                onClose={() => setIsFilterSidebarOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CarCompare isModalOpen={isCompareModalOpen} onModalClose={() => setIsCompareModalOpen(false)} />
      <CarFormModal
        isOpen={isFormOpen}
        car={editingCar}
        sellers={sellers}
        onAddCar={onAddCar}
        onUpdateCar={onUpdateCar}
        onClose={handleFormClose}
        isSaving={isSaving}
      />
    </div>
  );
}
