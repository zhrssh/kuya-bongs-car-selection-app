import { CarStatus, FilterState, SortKey, Skeleton } from "@repo/shared";
import {
  Grid as GridIcon,
  Plus,
  Search,
  SlidersHorizontal,
  Table,
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
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(true);
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
            <span>{isFilterSidebarOpen ? "Hide Filters" : "Show Filters"}</span>
          </button>

          {/* Sorter Selector */}
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="bg-bg-surface border border-border rounded-lg px-2.5 py-2 text-xs text-text-body font-semibold focus:outline-none focus:border-border cursor-pointer"
            id="catalog_sorter">
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="year-desc">Year: Newest First</option>
            <option value="year-asc">Year: Oldest First</option>
            <option value="mileage-asc">Lowest Mileage</option>
          </select>

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
        {/* Sidebar Filters */}
        <CarFilterSidebar
          isOpen={isFilterSidebarOpen}
          onClose={() => setIsFilterSidebarOpen(false)}
        />
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
              <select
                value={statusTab}
                onChange={(e) => setStatusTab(e.target.value as CarStatus)}
                className="w-full bg-bg-surface border border-border rounded-lg px-2.5 py-2 text-xs text-text-body font-semibold focus:outline-none focus:border-border cursor-pointer">
              <option value={CarStatus.Available}>Available</option>
              <option value={CarStatus.Sold}>Sold</option>
              <option value={CarStatus.Archived}>Archived</option>
            </select>
          </div>

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
