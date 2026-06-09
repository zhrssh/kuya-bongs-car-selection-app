import {
  CarBodyType,
  CarBodyTypeLabel,
  CarCondition,
  CarConditionLabel,
  CarFuelType,
  CarFuelTypeLabel,
  CarStatus,
  CarTransmission,
  CarTransmissionLabel,
  FilterState,
  SortKey,
} from "@repo/shared";
import {
  Grid as GridIcon,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Table,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@repo/shared";
import { Car, SellerContact } from "../types";
import { useCarStore } from "../stores/carStore";
import { useInventoryStore } from "../stores/inventoryStore";
import CarFilterSidebar from "./CarFilterSidebar";
import CarPagination from "./CarPagination";
import CarGrid from "./CarGrid";
import CarTable from "./CarTable";
import { getConditionColor } from "../utils/conditionColor";

interface InventoryCMSProps {
  refreshKey: number;
  sellers: SellerContact[];
  onAddCar: (car: Car) => void;
  onUpdateCar: (car: Car) => void;
}

export default function InventoryCMS({
  refreshKey,
  sellers,
  onAddCar,
  onUpdateCar,
}: InventoryCMSProps) {
  // Navigation & layout states
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(true);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const filters = useInventoryStore((s) => s.filters);
  const sortKey = useInventoryStore((s) => s.sortKey);
  const statusTab = useInventoryStore((s) => s.statusTab);
  const currentPage = useInventoryStore((s) => s.currentPage);
  const compareIds = useInventoryStore((s) => s.compareIds);
  const updateFilter = useInventoryStore((s) => s.updateFilter);
  const resetFilters = useInventoryStore((s) => s.resetFilters);
  const setSortKey = useInventoryStore((s) => s.setSortKey);
  const setStatusTab = useInventoryStore((s) => s.setStatusTab);
  const setCurrentPage = useInventoryStore((s) => s.setCurrentPage);
  const toggleCompareId = useInventoryStore((s) => s.toggleCompareId);
  const clearCompareIds = useInventoryStore((s) => s.clearCompareIds);
  const fetchCars = useInventoryStore((s) => s.fetchCars);
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

  // Specific Form states
  const [formData, setFormData] = useState<Partial<Car>>({});
  const [formError, setFormError] = useState("");
  const [imageInputUrl, setImageInputUrl] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const API_URL = import.meta.env.VITE_FLASK_APP_API_URL;

  const isUploadedUrl = (url: string) =>
    url.startsWith(window.location.origin + "/public/images/");

  const deleteUploadedFile = async (url: string) => {
    if (!isUploadedUrl(url)) return;
    const filename = url.split("/").pop();
    await fetch(`${API_URL}/api/uploads/${filename}`, {
      method: "DELETE",
      credentials: "include",
    });
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    setUploadError("");
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));

    const res = await fetch(`${API_URL}/api/uploads`, {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    const data = await res.json();
    if (data.status !== "success") {
      const msgs = data.errors
        ? Object.values(data.errors).join("; ")
        : "Upload failed";
      throw new Error(msgs);
    }
    return data.data.urls;
  };

  const handleCancel = async () => {
    for (const url of uploadedFiles) {
      await deleteUploadedFile(url);
    }
    setUploadedFiles([]);
    setUploadError("");
    setIsFormOpen(false);
  };

  // Handle open form for new car
  const handleOpenAdd = () => {
    setEditingCar(null);
    setFormData({
      make: "",
      model: "",
      year: 0,
      price: 0,
      mileage: 0,
      bodyType: CarBodyType.Sedan,
      fuelType: CarFuelType.Gasoline,
      transmission: CarTransmission.Automatic,
      condition: CarCondition.Excellent,
      exteriorColor: "",
      interiorColor: "",
      engine: "",
      drivetrain: "",
      features: "",
      description: "",
      imageUrl: "",
      status: CarStatus.Available,
      seller: {
        id: "",
        name: "",
        phone: "",
        email: "",
        location: "",
      },
    });
    setFormError("");
    setIsFormOpen(true);
  };

  // Handle open form for editing car
  const handleOpenEdit = (car: Car) => {
    setEditingCar(car);
    setFormData({ ...car });
    setFormError("");
    setImageInputUrl("");
    setIsFormOpen(true);
  };

  // Form submit handler
  const handleFormSubmit = async (e: any) => {
    e.preventDefault();

    const {
      make,
      model,
      year,
      price,
      mileage,
      features,
      exteriorColor,
      description,
      condition,
      imageUrl,
    } = formData;

    if (
      !make ||
      !model ||
      !year ||
      !price ||
      !mileage ||
      !exteriorColor ||
      !description ||
      !imageUrl
    ) {
      setFormError(
        "Please fill out all required fields (Brand, Model, Year, Price, Mileage, Exterior, Description, and at least one image).",
      );
      return;
    }

    const readyCar: Car = {
      ...(formData as Car),
      id: editingCar ? editingCar.id : "",
      year: Number(year),
      price: Number(price),
      mileage: Number(mileage),
      features: features,
      condition: condition || CarCondition.Excellent,
      status: formData.status || CarStatus.Available,
      images:
        formData.images && formData.images.length > 0
          ? formData.images
          : formData.imageUrl
            ? [formData.imageUrl]
            : [],
      seller: {
        ...(formData.seller as SellerContact),
        id: (formData.seller as SellerContact).id || "",
      },
      sellerId: formData.seller?.id || "",
    };

    if (editingCar) {
      await onUpdateCar(readyCar);
    } else {
      // Remove id prperty when adding new car
      delete readyCar.id;
      await onAddCar(readyCar);
    }

    setUploadedFiles([]); // files are now associated with the saved car
    setUploadError("");
    setIsFormOpen(false);
    await fetchCars(currentPage, statusTab, filters, sortKey);
  };

  const paginatedCars = cars;

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search query input */}
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search make, model, features..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter("searchQuery", e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-850 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 font-sans transition-all"
            id="search_query"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap w-full lg:w-auto items-center justify-end gap-3 self-stretch lg:self-auto">
          <button
            onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-semibold cursor-pointer transition ${
              isFilterSidebarOpen
                ? "bg-blue-50 border-blue-200 text-blue-700 font-bold"
                : "bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700"
            }`}
            id="toggle_filters_btn">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isFilterSidebarOpen ? "Hide Filters" : "Show Filters"}</span>
          </button>

          {/* Sorter Selector */}
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="bg-white border border-zinc-200 rounded-lg px-2.5 py-2 text-xs text-zinc-800 font-semibold focus:outline-none focus:border-zinc-400 cursor-pointer"
            id="catalog_sorter">
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="year-desc">Year: Newest First</option>
            <option value="year-asc">Year: Oldest First</option>
            <option value="mileage-asc">Lowest Mileage</option>
          </select>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-550 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition font-sans"
            id="btn_add_car">
            <Plus className="w-3.5 h-3.5 text-white" />
            Add Vehicle
          </button>

          {/* View Modes */}
          <div className="flex items-center bg-zinc-100 border border-zinc-200/60 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition ${viewMode === "grid" ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/40" : "text-zinc-500 hover:text-zinc-900"}`}
              title="Grid View"
              id="view_grid">
              <GridIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition ${viewMode === "table" ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/40" : "text-zinc-500 hover:text-zinc-900"}`}
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
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Status Filter
            </label>
              <select
                value={statusTab}
                onChange={(e) => setStatusTab(e.target.value as CarStatus)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-2 text-xs text-zinc-800 font-semibold focus:outline-none focus:border-zinc-400 cursor-pointer">
              <option value={CarStatus.Available}>Available</option>
              <option value={CarStatus.Sold}>Sold</option>
              <option value={CarStatus.Archived}>Archived</option>
            </select>
          </div>

          {/* Main Stock Content Layout */}
          {cars.length === 0 ? (
            <div className="bg-white border border-zinc-200 p-12 text-center rounded-xl shadow-xs">
              <p className="text-zinc-500 text-sm font-medium">
                No vehicles match your active filtering variables.
              </p>
              <button
                onClick={() => resetFilters()}
                className="mt-4 text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition cursor-pointer font-medium"
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
      {/* Comparison Drawer */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-4 px-6 z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] transition-all animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold font-mono">
                {compareIds.length}
              </span>
              <h3 className="font-semibold text-sm text-slate-800">
                Vehicles selected to compare (max 3)
              </h3>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {compareIds.map((id) => {
                const targetCar = cars.find((c) => c.id === id);
                if (!targetCar) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full pl-2 pr-3 py-1 text-xs text-slate-700">
                    <img
                      src={targetCar.imageUrl}
                      alt="preview"
                      className="w-8 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">
                      {targetCar.make} {targetCar.model}
                    </span>
                    <button
                      onClick={() => toggleCompareId(id)}
                      className="text-slate-400 hover:text-slate-650 transition ml-1 cursor-pointer focus:outline-none">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {compareIds.length >= 1 && (
                <button
                  onClick={() => setIsCompareModalOpen(true)}
                  className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full hover:bg-blue-700 transition shadow-xs cursor-pointer"
                  id="btn_open_compare_specs">
                  Compare Side-by-Side
                </button>
              )}

              <button
                onClick={() => {
                  clearCompareIds();
                  setIsCompareModalOpen(false);
                }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-650 transition cursor-pointer">
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Side-by-side comparison matrix modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-zinc-200 text-zinc-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative flex flex-col gap-6">
            <button
              onClick={() => setIsCompareModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-650 focus:outline-none">
              <X className="h-6 w-6" />
            </button>

            <div>
              <h3 className="text-xl font-display font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                Vehicle Specification Comparison
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Direct feature matrix and specification breakdown for your
                selected vehicles
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider w-1/4">
                      Specs Matrix
                    </th>
                    {compareIds.map((id) => {
                      const item = cars.find((c) => c.id === id);
                      if (!item) return null;
                      return (
                        <th key={id} className="py-3 px-4 w-1/4 text-center">
                          <img
                            src={item.imageUrl}
                            alt={item.model}
                            className="w-full h-32 object-cover rounded-xl border border-zinc-200 mb-2"
                          />
                          <div className="font-display font-semibold text-sm text-zinc-900">
                            {item.make} {item.model}
                          </div>
                          <div className="text-[10px] text-zinc-405 text-slate-400 font-medium">
                            {item.year} Model
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr className="hover:bg-zinc-50/50">
                    <td className="py-3 px-4 font-semibold text-zinc-500">
                      Sale Price
                    </td>
                    {compareIds.map((id) => {
                      const item = cars.find((c) => c.id === id);
                      if (!item) return null;
                      return (
                        <td
                          key={id}
                          className="py-3 px-4 text-center font-bold text-blue-600 text-sm">
                          ₱{item.price.toLocaleString()}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="hover:bg-zinc-50/50">
                    <td className="py-3 px-4 font-semibold text-zinc-500">
                      Odometer Mileage
                    </td>
                    {compareIds.map((id) => {
                      const item = cars.find((c) => c.id === id);
                      if (!item) return null;
                      return (
                        <td key={id} className="py-3 px-4 text-center">
                          {item.mileage.toLocaleString()} km
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="hover:bg-zinc-50/50">
                    <td className="py-3 px-4 font-semibold text-zinc-500">
                      Condition
                    </td>
                    {compareIds.map((id) => {
                      const item = cars.find((c) => c.id === id);
                      if (!item) return null;
                      return (
                        <td key={id} className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getConditionColor(item.condition)}`}>
                            {item.condition}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="hover:bg-zinc-50/50">
                    <td className="py-3 px-4 font-semibold text-zinc-500">
                      Engine / Powertrain
                    </td>
                    {compareIds.map((id) => {
                      const item = cars.find((c) => c.id === id);
                      if (!item) return null;
                      return (
                        <td
                          key={id}
                          className="py-3 px-4 text-center font-medium">
                          {item.engine}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="hover:bg-zinc-50/50">
                    <td className="py-3 px-4 font-semibold text-zinc-500">
                      Fuel Mechanism
                    </td>
                    {compareIds.map((id) => {
                      const item = cars.find((c) => c.id === id);
                      if (!item) return null;
                      return (
                        <td key={id} className="py-3 px-4 text-center">
                          {item.fuelType}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="hover:bg-zinc-50/50">
                    <td className="py-3 px-4 font-semibold text-zinc-500">
                      Gearbox Mechanism
                    </td>
                    {compareIds.map((id) => {
                      const item = cars.find((c) => c.id === id);
                      if (!item) return null;
                      return (
                        <td key={id} className="py-3 px-4 text-center">
                          {item.transmission}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="hover:bg-zinc-50/50">
                    <td className="py-3 px-4 font-semibold text-zinc-500">
                      Drivetrain Wheelbase
                    </td>
                    {compareIds.map((id) => {
                      const item = cars.find((c) => c.id === id);
                      if (!item) return null;
                      return (
                        <td key={id} className="py-3 px-4 text-center">
                          {item.drivetrain}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="hover:bg-zinc-50/50">
                    <td className="py-3 px-4 font-semibold text-zinc-500">
                      Highlights & Amenities
                    </td>
                    {compareIds.map((id) => {
                      const item = cars.find((c) => c.id === id);
                      if (!item) return null;
                      return (
                        <td key={id} className="py-3 px-4">
                          <div className="flex flex-wrap justify-center gap-1">
                            {item.features}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="px-5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold cursor-pointer">
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Dynamic Save / Edit CMS Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-zinc-200 text-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl p-6 relative flex flex-col justify-between space-y-6">
            {/* Form Header */}
            <div>
              <h3 className="text-lg font-bold text-zinc-900 font-sans tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-zinc-650" />
                {editingCar
                  ? "Update Car Listing CMS"
                  : "Register New Vehicle in Stock"}
              </h3>
              <p className="text-xs text-zinc-450 mt-1">
                Fill in critical catalog fields to populate filters and
                real-time statistics charts
              </p>
            </div>

            {/* Form Fields body */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-mono">
                  {formError}
                </div>
              )}
              {uploadError && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-mono">
                  {uploadError}
                </div>
              )}
              {/* Brand and Model row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-550">
                    Brand / Make *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Porsche, Tesla"
                    value={formData.make || ""}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, make: e.target.value }))
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 placeholder-zinc-450 focus:outline-none focus:ring-1 focus:ring-zinc-300 focus:border-zinc-300 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-550">
                    Model *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Taycan, 911"
                    value={formData.model || ""}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, model: e.target.value }))
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 placeholder-zinc-455 focus:outline-none focus:ring-1 focus:ring-zinc-300 focus:border-zinc-300 font-mono"
                  />
                </div>
              </div>{" "}
              {/* Year, Price, Mileage */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-550">
                    Year *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="2022"
                    value={formData.year || ""}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        year: Number(e.target.value),
                      }))
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-550">
                    Price (₱ PHP) *
                  </label>
                  <input
                    type="number"
                    required
                    step={1000}
                    placeholder="35000"
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        price: Number(e.target.value),
                      }))
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-300 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-550">
                    Mileage (km) *
                  </label>
                  <input
                    type="number"
                    required
                    step={1000}
                    placeholder="12000"
                    value={formData.mileage || ""}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        mileage: Number(e.target.value),
                      }))
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-300 font-mono"
                  />
                </div>
              </div>
              {/* Categorization elements */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500">
                    Body Type
                  </label>
                  <select
                    value={formData.bodyType || CarBodyType.Sedan}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        bodyType: e.target.value as any,
                      }))
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 focus:outline-none">
                    <option value={CarBodyType.Sedan}>
                      {CarBodyTypeLabel[CarBodyType.Sedan]}
                    </option>
                    <option value={CarBodyType.SUV}>
                      {CarBodyTypeLabel[CarBodyType.SUV]}
                    </option>
                    <option value={CarBodyType.Coupe}>
                      {CarBodyTypeLabel[CarBodyType.Coupe]}
                    </option>
                    <option value={CarBodyType.Truck}>
                      {CarBodyTypeLabel[CarBodyType.Truck]}
                    </option>
                    <option value={CarBodyType.Hatchback}>
                      {CarBodyTypeLabel[CarBodyType.Hatchback]}
                    </option>
                    <option value={CarBodyType.Convertible}>
                      {CarBodyTypeLabel[CarBodyType.Convertible]}
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500">
                    Fuel Type
                  </label>
                  <select
                    value={formData.fuelType || CarFuelType.Gasoline}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        fuelType: e.target.value as any,
                      }))
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 focus:outline-none">
                    <option value={CarFuelType.Gasoline}>
                      {CarFuelTypeLabel[CarFuelType.Gasoline]}
                    </option>
                    <option value={CarFuelType.Electric}>
                      {CarFuelTypeLabel[CarFuelType.Electric]}
                    </option>
                    <option value={CarFuelType.Hybrid}>
                      {CarFuelTypeLabel[CarFuelType.Hybrid]}
                    </option>
                    <option value={CarFuelType.Diesel}>
                      {CarFuelTypeLabel[CarFuelType.Diesel]}
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500">
                    Transmission
                  </label>
                  <select
                    value={formData.transmission || CarTransmission.Automatic}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        transmission: e.target.value as any,
                      }))
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 focus:outline-none">
                    <option value={CarTransmission.Automatic}>
                      {CarTransmissionLabel[CarTransmission.Automatic]}
                    </option>
                    <option value={CarTransmission.Manual}>
                      {CarTransmissionLabel[CarTransmission.Manual]}
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500">
                    Condition
                  </label>
                  <select
                    value={formData.condition || CarCondition.Excellent}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        condition: e.target.value as any,
                      }))
                    }
                    className="w-full bg-zinc-50 border border-zinc-205 rounded px-3 py-2 text-sm text-zinc-800 font-semibold focus:outline-none">
                    <option value={CarCondition.Excellent}>
                      {CarConditionLabel[CarCondition.Excellent]}
                    </option>
                    <option value={CarCondition.VeryGood}>
                      {CarConditionLabel[CarCondition.VeryGood]}
                    </option>
                    <option value={CarCondition.Good}>
                      {CarConditionLabel[CarCondition.Good]}
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-blue-600 font-mono">
                    Status
                  </label>
                  <select
                    value={formData.status || CarStatus.Available}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        status: e.target.value as any,
                      }))
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 font-semibold focus:outline-none focus:border-blue-300">
                    <option value={CarStatus.Available}>Available</option>
                    <option value={CarStatus.Sold}>Sold</option>
                    <option value={CarStatus.Archived}>Archived</option>
                  </select>
                </div>
              </div>
              {/* Mechanical specs colors */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-550">
                    Exterior Color *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Chalk Red"
                    value={formData.exteriorColor || ""}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        exteriorColor: e.target.value,
                      }))
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-300"
                  />
                </div>{" "}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-550">
                    Interior Color
                  </label>
                  <input
                    type="text"
                    placeholder="Black Leather"
                    value={formData.interiorColor || ""}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        interiorColor: e.target.value,
                      }))
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-300 placeholder-zinc-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-550">
                    Engine Block
                  </label>
                  <input
                    type="text"
                    placeholder="3.0L Flat-6"
                    value={formData.engine || ""}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, engine: e.target.value }))
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-300 placeholder-zinc-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-550">
                    Drivetrain
                  </label>
                  <input
                    type="text"
                    placeholder="AWD"
                    value={formData.drivetrain || ""}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, drivetrain: e.target.value }))
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-300 placeholder-zinc-400"
                  />
                </div>
                {/* Media URL / Upload Image section */}
                <div className="space-y-3 border border-slate-200 rounded-xl p-4 bg-slate-50/50 col-span-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-zinc-700 block">
                      Vehicle Media Image Gallery *
                    </label>
                    {formData.imageUrl && (
                      <button
                        type="button"
                        onClick={async () => {
                          for (const url of formData.images || []) {
                            await deleteUploadedFile(url);
                          }
                          setFormData((p) => ({
                            ...p,
                            imageUrl: "",
                            images: [],
                          }));
                          setUploadedFiles([]);
                        }}
                        className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer">
                        Reset All Images
                      </button>
                    )}
                  </div>

                  {/* Drag and Drop Zone / File upload */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const files = Array.from(e.dataTransfer.files).filter(
                        (f) => f.type.startsWith("image/"),
                      );
                      if (files.length === 0) return;
                      try {
                        const urls = await uploadFiles(files);
                        setFormData((p) => {
                          const currentImages =
                            p.images && p.images.length > 0
                              ? [...p.images]
                              : p.imageUrl
                                ? [p.imageUrl]
                                : [];
                          const newImages = [...currentImages, ...urls];
                          return {
                            ...p,
                            images: newImages,
                            imageUrl: p.imageUrl || newImages[0],
                          };
                        });
                        setUploadedFiles((prev) => [...prev, ...urls]);
                      } catch (err: any) {
                        setUploadError(
                          err.message || "Upload failed. Please try again.",
                        );
                      }
                    }}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-white rounded-xl p-5 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all relative overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []).filter(
                          (f) => f.type.startsWith("image/"),
                        );
                        if (files.length === 0) return;
                        try {
                          const urls = await uploadFiles(files);
                          setFormData((p) => {
                            const currentImages =
                              p.images && p.images.length > 0
                                ? [...p.images]
                                : p.imageUrl
                                  ? [p.imageUrl]
                                  : [];
                            const newImages = [...currentImages, ...urls];
                            return {
                              ...p,
                              images: newImages,
                              imageUrl: p.imageUrl || newImages[0],
                            };
                          });
                          setUploadedFiles((prev) => [...prev, ...urls]);
                        } catch (err: any) {
                          setUploadError(
                            err.message || "Upload failed. Please try again.",
                          );
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Choose image files"
                    />

                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full border border-blue-105">
                      <Upload className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-blue-600 hover:underline">
                        Click to upload files
                      </span>
                      <span className="text-xs text-zinc-500">
                        {" "}
                        or drag and drop images
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      Multiple image uploads supported (PNG, JPG, WebP)
                    </span>
                  </div>

                  {/* Direct text input option */}
                  <div className="space-y-1.5 mt-2">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono block">
                      Add Image by Direct URL:
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="e.g. https://images.unsplash.com/photo-..."
                        value={imageInputUrl}
                        onChange={(e) => setImageInputUrl(e.target.value)}
                        className="flex-1 bg-white border border-zinc-200 rounded px-3 py-1.5 text-xs text-zinc-850 placeholder-zinc-400 focus:outline-none focus:border-zinc-300 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!imageInputUrl) return;
                          setFormData((p) => {
                            const currentImages =
                              p.images && p.images.length > 0
                                ? [...p.images]
                                : p.imageUrl
                                  ? [p.imageUrl]
                                  : [];
                            const newImages = [...currentImages, imageInputUrl];
                            return {
                              ...p,
                              images: newImages,
                              imageUrl: p.imageUrl ? p.imageUrl : newImages[0],
                            };
                          });
                          setImageInputUrl("");
                        }}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-semibold cursor-pointer whitespace-nowrap">
                        Add URL
                      </button>
                    </div>
                  </div>

                  {/* Images list manager */}
                  {(() => {
                    const items =
                      formData.images && formData.images.length > 0
                        ? formData.images
                        : formData.imageUrl
                          ? [formData.imageUrl]
                          : [];
                    if (items.length === 0) return null;

                    return (
                      <div className="space-y-2 mt-3 pt-3 border-t border-zinc-200/60">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
                          Loaded Images Gallery ({items.length})
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {items.map((url, index) => {
                            const isMain = formData.imageUrl === url;
                            return (
                              <div
                                key={index}
                                className={`relative group/thumb border rounded-xl overflow-hidden aspect-video bg-zinc-50 flex items-center justify-center transition-all ${
                                  isMain
                                    ? "border-blue-600 ring-2 ring-blue-500/20"
                                    : "border-zinc-200 hover:border-zinc-350"
                                }`}>
                                <img
                                  src={url}
                                  alt={`car-thumb-${index}`}
                                  className="w-full h-full object-cover"
                                />

                                {/* Overlay actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                                  {!isMain && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setFormData((p) => ({
                                          ...p,
                                          imageUrl: url,
                                        }))
                                      }
                                      className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-bold px-2 py-1 rounded cursor-pointer w-full text-center">
                                      Set Main
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const deletingUrl = items[index];
                                      await deleteUploadedFile(deletingUrl);
                                      setFormData((p) => {
                                        const filtered = items.filter(
                                          (_, idx) => idx !== index,
                                        );
                                        let nextMain = p.imageUrl;
                                        if (isMain) {
                                          nextMain =
                                            filtered.length > 0
                                              ? filtered[0]
                                              : "";
                                        }
                                        return {
                                          ...p,
                                          images: filtered,
                                          imageUrl: nextMain,
                                        };
                                      });
                                      setUploadedFiles((prev) =>
                                        prev.filter((u) => u !== deletingUrl),
                                      );
                                    }}
                                    className="bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-bold px-2 py-1 rounded cursor-pointer w-full text-center">
                                    Delete
                                  </button>
                                </div>

                                {/* Main image label indicator */}
                                {isMain && (
                                  <span className="absolute top-1 left-1 bg-blue-600 text-white text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow-xs font-mono">
                                    Main
                                  </span>
                                )}

                                {/* Item index */}
                                <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[8px] font-bold px-1 rounded">
                                  {index + 1}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>{" "}
              </div>
              {/* Key Features input comma list */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-550">
                  Key Features
                </label>
                <input
                  type="text"
                  placeholder="Autopilot, Panoramic Roof, Heated Steering Wheel"
                  value={formData.features || ""}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, features: e.target.value }))
                  }
                  className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-805 placeholder-zinc-400 focus:outline-none focus:border-zinc-300"
                />
              </div>
              {/* Listing description */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-550">
                  Overview Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail outstanding advantages, ownership health, battery capacity, dent details..."
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm font-sans text-zinc-805 placeholder-zinc-400 focus:outline-none focus:border-zinc-300"
                />
              </div>
              {/* Seller details group toggleable or static */}
              <div className="border border-zinc-200 p-4 rounded-lg bg-zinc-50 space-y-3">
                <h5 className="text-[10px] uppercase tracking-wider font-semibold text-zinc-450 font-mono">
                  Seller Assignment
                </h5>
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 font-semibold block font-mono">
                    Select Assigned Agent *
                  </span>
                  <select
                    value={formData.seller?.name || ""}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      const selectedSeller = sellers.find(
                        (s) => s.name === selectedName,
                      );
                      if (selectedSeller) {
                        setFormData((p) => ({
                          ...p,
                          seller: { ...selectedSeller },
                        }));
                      } else {
                        setFormData((p) => ({
                          ...p,
                          seller: undefined,
                        }));
                      }
                    }}
                    required
                    className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-xs text-zinc-805 placeholder-zinc-400 focus:outline-none focus:border-zinc-350 cursor-pointer"
                    id="select_seller_assignment">
                    <option value="">-- Choose Agent from Directory --</option>
                    {sellers.map((s, idx) => (
                      <option key={idx} value={s.name}>
                        {s.name} ({s.location} - {s.status || "Active"})
                      </option>
                    ))}
                  </select>
                </div>

                {formData.seller && formData.seller.name && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 bg-white/40 p-2.5 rounded border border-zinc-205/65">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-zinc-400 font-mono block">
                        Station/Office
                      </span>
                      <span className="text-xs font-semibold text-zinc-700">
                        {formData.seller.location}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-zinc-400 font-mono block">
                        Contact Phone
                      </span>
                      <span className="text-xs font-semibold text-zinc-700 font-mono">
                        {formData.seller.phone}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-zinc-400 font-mono block">
                        Sales Email
                      </span>
                      <span className="text-xs font-semibold text-zinc-700 line-clamp-1">
                        {formData.seller.email}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {/* Control Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-150">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-205/50 rounded-lg text-xs text-zinc-700 font-semibold cursor-pointer transition font-sans"
                  id="form_btn_cancel">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition font-sans"
                  id="form_btn_submit">
                  {editingCar ? "Save Changes" : "Publish Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
