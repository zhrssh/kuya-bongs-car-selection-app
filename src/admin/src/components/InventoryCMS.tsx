import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Fuel,
  Grid as GridIcon,
  MapPin,
  Milestone,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Table,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  CarBodyType,
  CarCondition,
  CarFuelType,
  CarStatus,
  CarTransmission,
} from "../enums";
import { Car, FilterState, SortKey } from "../types";

interface InventoryCMSProps {
  cars: Car[];
  onAddCar: (car: Car) => void;
  onUpdateCar: (car: Car) => void;
  onDeleteCar: (id: string) => void;
  onSelectCar: (car: Car) => void;
  onSimulateView: (id: string) => void;
}

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

export default function InventoryCMS({
  cars,
  onAddCar,
  onUpdateCar,
  onDeleteCar,
  onSelectCar,
  onSimulateView,
}: InventoryCMSProps) {
  // Navigation & layout states
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER);
  const [sortKey, setSortKey] = useState<SortKey>("year-desc");
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(true);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [statusTab, setStatusTab] = useState<CarStatus>(CarStatus.Available);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Counts of cars by status
  const counts = useMemo(() => {
    let available = 0;
    let sold = 0;
    let archived = 0;
    cars.forEach((car: Car) => {
      const s = car.status;
      if (s === CarStatus.Available) available++;
      else if (s === CarStatus.Sold) sold++;
      else if (s === CarStatus.Archived) archived++;
    });
    return { available, sold, archived };
  }, [cars]);

  // Get condition color based on condition
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case CarCondition.Excellent:
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case CarCondition.VeryGood:
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      case CarCondition.Good:
      default:
        return "bg-amber-50 text-amber-700 border-amber-200/60";
    }
  };

  // Create / Edit modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  // Specific Form states
  const [formData, setFormData] = useState<Partial<Car>>({});
  const [featuresInput, setFeaturesInput] = useState("");
  const [formError, setFormError] = useState("");
  const [imageInputUrl, setImageInputUrl] = useState("");

  // Dropdown lists derived from current stock to avoid duplicates
  const uniqueMakes = useMemo(
    () => Array.from(new Set(cars.map((c) => c.make))),
    [cars],
  );

  const uniqueBodyTypes = useMemo(
    () => Array.from(new Set(cars.map((c) => c.bodyType))),
    [cars],
  );

  const uniqueFuelTypes = useMemo(
    () => Array.from(new Set(cars.map((c) => c.fuelType))),
    [cars],
  );

  const uniqueTransmissions = [
    CarTransmission.Automatic,
    CarTransmission.Manual,
  ];

  const modelsForMake = useMemo(() => {
    if (!filters.make) {
      return Array.from(new Set(cars.map((c) => c.model)));
    }
    return Array.from(
      new Set(cars.filter((c) => c.make === filters.make).map((c) => c.model)),
    );
  }, [cars, filters.make]);

  const handleChange = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "make") {
        updated.model = ""; // Reset model when make changes
      }
      return updated;
    });
    setCurrentPage(1);
  };

  const handlePriceQuickSelect = (min: string, max: string) => {
    setFilters((prev) => ({ ...prev, priceMin: min, priceMax: max }));
    setCurrentPage(1);
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
      drivetrain: "RWD",
      features: [],
      description: "",
      imageUrl: "",
      status: CarStatus.Available,
      seller: {
        name: "Auto Plaza Broker",
        phone: "(555) 301-4491",
        email: "sales@autoplazadealer.com",
        location: "Denver, CO",
      },
    });
    setFormError("");
    setIsFormOpen(true);
  };

  // Handle open form for editing car
  const handleOpenEdit = (car: Car) => {
    setEditingCar(car);
    setFormData({ ...car });
    setFeaturesInput(car.features.join(", "));
    setFormError("");
    setImageInputUrl("");
    setIsFormOpen(true);
  };

  // Form submit handler
  const handleFormSubmit = (e: any) => {
    e.preventDefault();

    const {
      make,
      model,
      year,
      price,
      mileage,
      exteriorColor,
      interiorColor,
      description,
      condition,
    } = formData;

    if (
      !make ||
      !model ||
      !year ||
      !price ||
      !mileage ||
      !exteriorColor ||
      !description
    ) {
      setFormError(
        "Please fill out all required fields (Brand, Model, Year, Price, Mileage, Exterior, and Description).",
      );
      return;
    }

    const featureArray = featuresInput
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const readyCar: Car = {
      ...(formData as Car),
      id: editingCar ? editingCar.id : "car-add-" + Date.now(),
      year: Number(year),
      price: Number(price),
      mileage: Number(mileage),
      features: featureArray,
      condition: condition || CarCondition.Excellent,
      status: formData.status || CarStatus.Available,
      images:
        formData.images && formData.images.length > 0
          ? formData.images
          : formData.imageUrl
            ? [formData.imageUrl]
            : [],
    };

    if (editingCar) {
      onUpdateCar(readyCar);
    } else {
      onAddCar(readyCar);
    }

    setIsFormOpen(false);
  };

  // Reset Filters
  const resetFilters = () => {
    setFilters(INITIAL_FILTER);
    setCurrentPage(1);
  };

  // Filter and Sort Logic
  const filteredAndSortedCars = useMemo(() => {
    return cars
      .filter((car) => {
        // Search bar query (Make, Model, Engine, Features)
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matchMake = car.make.toLowerCase().includes(q);
          const matchModel = car.model.toLowerCase().includes(q);
          const matchDesc = car.description.toLowerCase().includes(q);
          const matchFeatures = car.features.some((f) =>
            f.toLowerCase().includes(q),
          );
          if (!matchMake && !matchModel && !matchDesc && !matchFeatures)
            return false;
        }

        // Filter by Tab (available, sold, archived)
        const carStatus = car.status || CarStatus.Available;
        if (
          statusTab === CarStatus.Available &&
          carStatus !== CarStatus.Available
        )
          return false;
        if (statusTab === CarStatus.Sold && carStatus !== CarStatus.Sold)
          return false;
        if (
          statusTab === CarStatus.Archived &&
          carStatus !== CarStatus.Archived
        )
          return false;

        // Dropdowns and ranges
        if (filters.make && car.make !== filters.make) return false;
        if (filters.model && car.model !== filters.model) return false;
        if (filters.bodyType && car.bodyType !== filters.bodyType) return false;
        if (filters.fuelType && car.fuelType !== filters.fuelType) return false;
        if (filters.transmission && car.transmission !== filters.transmission)
          return false;
        if (filters.condition && car.condition !== filters.condition)
          return false;

        if (filters.yearMin && car.year < Number(filters.yearMin)) return false;
        if (filters.yearMax && car.year > Number(filters.yearMax)) return false;
        if (filters.priceMin && car.price < Number(filters.priceMin))
          return false;
        if (filters.priceMax && car.price > Number(filters.priceMax))
          return false;

        return true;
      })
      .sort((a, b) => {
        switch (sortKey) {
          case "price-asc":
            return a.price - b.price;
          case "price-desc":
            return b.price - a.price;
          case "year-desc":
            return b.year - a.year;
          case "year-asc":
            return a.year - b.year;
          case "mileage-asc":
            return a.mileage - b.mileage;
          case "relevance":
          default:
            return b.year - a.year; // default to newer
        }
      });
  }, [cars, filters, sortKey, statusTab]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedCars.length / ITEMS_PER_PAGE),
  );
  const activePage = Math.min(currentPage, totalPages);

  const paginatedCars = useMemo(() => {
    const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedCars.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedCars, activePage]);

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
            onChange={(e) => handleChange("searchQuery", e.target.value)}
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
            onChange={(e) => {
              setSortKey(e.target.value as SortKey);
              setCurrentPage(1);
            }}
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
      {/* Main Grid: Left Column is Sidebar filter, Right Column is Content list */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar Filters */}
        {isFilterSidebarOpen && (
          <div className="lg:col-span-1">
            <aside
              className={`
                bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-6 transition-all duration-300 shadow-[0_1px_4px_rgba(0,0,0,0.01)]
              `}>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-slate-700" />
                  <h2 className="font-display font-semibold text-base text-slate-900">
                    Filters
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors focus:outline-none"
                    title="Reset all filters">
                    <RotateCcw className="h-3 w-3" />
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsFilterSidebarOpen(false)}
                    className="md:hidden text-slate-400 hover:text-slate-650 focus:outline-none">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Main Form Fields */}
              <div className="flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                {/* Keyword Search */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Keyword Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Autopilot, AWD, V8..."
                      value={filters.searchQuery}
                      onChange={(e) =>
                        handleChange("searchQuery", e.target.value)
                      }
                      className="w-full bg-slate-55 border border-slate-200 outline-none rounded-xl py-2 px-3 pl-9 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all font-sans text-slate-800"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {/* Brand / Make */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Brand (Make)
                  </label>
                  <select
                    value={filters.make}
                    onChange={(e) => handleChange("make", e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 outline-none rounded-xl py-2 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all font-sans text-slate-800 cursor-pointer">
                    <option value="">All Brands</option>
                    {uniqueMakes.map((make) => (
                      <option key={make} value={make}>
                        {make}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vehicle Model */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Model
                  </label>
                  <select
                    value={filters.model}
                    onChange={(e) => handleChange("model", e.target.value)}
                    disabled={modelsForMake.length === 0}
                    className="w-full bg-slate-55 border border-slate-200 outline-none rounded-xl py-2 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all font-sans text-slate-800 cursor-pointer disabled:opacity-50">
                    <option value="">
                      {filters.make
                        ? `All ${filters.make} Models`
                        : "All Models"}
                    </option>
                    {modelsForMake.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vehicle Condition */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Vehicle Condition
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      CarCondition.Excellent,
                      CarCondition.VeryGood,
                      CarCondition.Good,
                    ].map((cond) => {
                      const isSelected = filters.condition === cond;
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() =>
                            handleChange("condition", isSelected ? "" : cond)
                          }
                          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/70 text-blue-700 font-bold"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          }`}>
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Range */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Price Range (₱)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                        Min Price
                      </span>
                      <input
                        type="number"
                        placeholder="No Min"
                        value={filters.priceMin}
                        onChange={(e) =>
                          handleChange("priceMin", e.target.value)
                        }
                        className="w-full bg-slate-55 border border-slate-200 outline-none rounded-xl py-2 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all font-sans text-slate-800"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                        Max Price
                      </span>
                      <input
                        type="number"
                        placeholder="No Max"
                        value={filters.priceMax}
                        onChange={(e) =>
                          handleChange("priceMax", e.target.value)
                        }
                        className="w-full bg-slate-55 border border-slate-200 outline-none rounded-xl py-2 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all font-sans text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Quick Price Targets */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() => handlePriceQuickSelect("", "1500000")}
                      className={`text-[10px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                        filters.priceMax === "1500000" &&
                        filters.priceMin === ""
                          ? "border-blue-500 bg-blue-50/70 text-blue-700 font-bold"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}>
                      Under ₱1.5M
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handlePriceQuickSelect("1500000", "3000000")
                      }
                      className={`text-[10px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                        filters.priceMin === "1500000" &&
                        filters.priceMax === "3000000"
                          ? "border-blue-500 bg-blue-50/70 text-blue-700 font-bold"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}>
                      ₱1.5M - ₱3M
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePriceQuickSelect("3000000", "")}
                      className={`text-[10px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                        filters.priceMin === "3000000" &&
                        filters.priceMax === ""
                          ? "border-blue-500 bg-blue-50/70 text-blue-700 font-bold"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}>
                      ₱3M+
                    </button>
                  </div>
                </div>

                {/* Year Range */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Model Year Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                        Min Year
                      </span>
                      <select
                        value={filters.yearMin}
                        onChange={(e) =>
                          handleChange("yearMin", e.target.value)
                        }
                        className="w-full bg-slate-55 border border-slate-200 outline-none rounded-xl py-2 px-1 focus:bg-white text-xs focus:ring-2 focus:ring-blue-500/10 transition-all font-sans text-slate-800 select-wrapper">
                        <option value="">Any Min</option>
                        {[
                          2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023,
                          2024,
                        ].map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                        Max Year
                      </span>
                      <select
                        value={filters.yearMax}
                        onChange={(e) =>
                          handleChange("yearMax", e.target.value)
                        }
                        className="w-full bg-slate-55 border border-slate-200 outline-none rounded-xl py-2 px-1 focus:bg-white text-xs focus:ring-2 focus:ring-blue-500/10 transition-all font-sans text-slate-800 select-wrapper">
                        <option value="">Any Max</option>
                        {[
                          2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023,
                          2024,
                        ].map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Body Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Body Type
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueBodyTypes.map((type) => {
                      const isSelected = filters.bodyType === type;
                      return (
                        <button
                          key={type}
                          onClick={() =>
                            handleChange("bodyType", isSelected ? "" : type)
                          }
                          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/70 text-blue-700 font-bold"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          }`}>
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fuel Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Fuel Type
                  </label>
                  <select
                    value={filters.fuelType}
                    onChange={(e) => handleChange("fuelType", e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 outline-none rounded-xl py-2.5 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all font-sans text-slate-800 cursor-pointer">
                    <option value="">All Fuel Types</option>
                    {uniqueFuelTypes.map((fuel) => (
                      <option key={fuel} value={fuel}>
                        {fuel}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transmission */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Transmission
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {uniqueTransmissions.map((trans) => {
                      const isSelected = filters.transmission === trans;
                      return (
                        <button
                          key={trans}
                          onClick={() =>
                            handleChange(
                              "transmission",
                              isSelected ? "" : trans,
                            )
                          }
                          className={`text-xs py-2 rounded-full border font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/70 text-blue-700 font-semibold"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}>
                          {trans}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
        {/* Listings Section */}
        <div
          className={
            isFilterSidebarOpen
              ? "lg:col-span-3 space-y-6"
              : "lg:col-span-4 space-y-6"
          }>
          {/* Status Tabs Selector */}
          <div className="flex border-b border-slate-200/80 gap-6 overflow-x-auto pb-0.5">
            <button
              onClick={() => {
                setStatusTab(CarStatus.Available);
                setCurrentPage(1);
              }}
              className={`pb-3 text-sm font-semibold relative transition-all duration-200 cursor-pointer focus:outline-none flex items-center gap-2 whitespace-nowrap ${
                statusTab === CarStatus.Available
                  ? "text-blue-600 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}>
              <span>Available Stock</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  statusTab === CarStatus.Available
                    ? "bg-blue-105 bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-600"
                }`}>
                {counts.available}
              </span>
              {statusTab === CarStatus.Available && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full animate-fade-in" />
              )}
            </button>

            <button
              onClick={() => {
                setStatusTab(CarStatus.Sold);
                setCurrentPage(1);
              }}
              className={`pb-3 text-sm font-semibold relative transition-all duration-200 cursor-pointer focus:outline-none flex items-center gap-2 whitespace-nowrap ${
                statusTab === CarStatus.Sold
                  ? "text-emerald-600 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}>
              <span>Sold Vehicles</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  statusTab === CarStatus.Sold
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}>
                {counts.sold}
              </span>
              {statusTab === CarStatus.Sold && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => {
                setStatusTab(CarStatus.Archived);
                setCurrentPage(1);
              }}
              className={`pb-3 text-sm font-semibold relative transition-all duration-200 cursor-pointer focus:outline-none flex items-center gap-2 whitespace-nowrap ${
                statusTab === CarStatus.Archived
                  ? "text-amber-600 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}>
              <span>Archived Listings</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  statusTab === CarStatus.Archived
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600"
                }`}>
                {counts.archived}
              </span>
              {statusTab === CarStatus.Archived && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 rounded-full" />
              )}
            </button>
          </div>

          {/* Main Stock Content Layout */}
          {filteredAndSortedCars.length === 0 ? (
            <div className="bg-white border border-zinc-200 p-12 text-center rounded-xl shadow-xs">
              <p className="text-zinc-500 text-sm font-medium">
                No vehicles match your active filtering variables.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition cursor-pointer font-medium"
                id="reset_empty_state">
                Clear Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCars.map((car) => {
                const isComparing = compareIds.includes(car.id!);
                const canCompare = compareIds.length < 3;
                const onToggleCompare = (clickedCar: Car) => {
                  setCompareIds((prev) =>
                    prev.includes(clickedCar.id!)
                      ? prev.filter((id) => id !== clickedCar.id!)
                      : prev.length < 3
                        ? [...prev, clickedCar.id!]
                        : prev,
                  );
                };
                const formattedMileage = car.mileage.toLocaleString();
                const formattedPrice = `₱${car.price.toLocaleString()}`;
                const onSelect = onSelectCar;

                return (
                  <article
                    id={`car-card-${car.id}`}
                    key={car.id}
                    className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full">
                    {/* Image Area */}
                    <div className="relative aspect-4/3 overflow-hidden bg-slate-50">
                      <img
                        src={car.imageUrl}
                        alt={`${car.year} ${car.make} ${car.model}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                        referrerPolicy="no-referrer"
                      />

                      {/* Status Overlay Badge */}
                      {car.status && car.status !== CarStatus.Available && (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none transition-all duration-300">
                          <span
                            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider uppercase border shadow-md transform -skew-x-6 scale-110 select-none ${
                              car.status === CarStatus.Sold
                                ? "bg-emerald-600 border-emerald-500 text-white"
                                : "bg-amber-605 border-amber-550 text-white"
                            }`}>
                            {car.status}
                          </span>
                        </div>
                      )}

                      {/* Top Badges overlay */}
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
                        <span
                          className={`pointer-events-auto border px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs ${getConditionColor(
                            car.condition,
                          )}`}>
                          {car.condition}
                        </span>

                        {/* Compare Checkbox */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleCompare(car);
                          }}
                          disabled={!isComparing && !canCompare}
                          className={`pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold backdrop-blur-md border transition-all cursor-pointer ${
                            isComparing
                              ? "bg-blue-600 text-white border-blue-700 shadow-sm"
                              : "bg-white/90 text-slate-700 border-slate-200 hover:bg-white disabled:opacity-40"
                          }`}>
                          <div
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                              isComparing
                                ? "border-white bg-blue-600"
                                : "border-slate-400 bg-white"
                            }`}>
                            {isComparing && (
                              <svg
                                className="w-2.5 h-2.5 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3.5"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          <span>Compare</span>
                        </button>
                      </div>

                      {/* Lower Overlay for badges or attributes */}
                      <div className="absolute bottom-3 left-3">
                        <div className="flex gap-1.5">
                          {car.year >= 2022 && (
                            <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider bg-slate-900/80 text-white font-bold px-2 py-1 rounded-full backdrop-blur-xs">
                              <Sparkles className="h-2.5 w-2.5 text-amber-400" />
                              Recent
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 flex flex-col flex-1 gap-4">
                      {/* Title, Year, Make, Model */}
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-xs text-slate-400 font-semibold">
                            {car.year}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {car.seller.location.split(",")[0]}
                          </span>
                        </div>
                        <h3 className="font-display font-semibold text-base text-slate-905 text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {car.make} {car.model}
                        </h3>
                      </div>

                      {/* Brief highlights grid */}
                      <div className="grid grid-cols-2 gap-y-2 border-t border-b border-slate-100 py-3 text-xs text-slate-650">
                        <div className="flex items-center gap-2">
                          <Milestone className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-600">
                            {formattedMileage} km
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Fuel className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-600 line-clamp-1">
                            {car.fuelType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2 text-[11px] text-slate-500">
                          <span className="font-normal">Transmission:</span>
                          <span className="font-semibold text-slate-700 ml-1">
                            {car.transmission}
                          </span>
                        </div>
                      </div>

                      {/* Pricing tag & Action buttons */}
                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">
                            Sale Price
                          </span>
                          <span className="font-display font-semibold text-lg text-slate-950">
                            {formattedPrice}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 font-sans">
                          <button
                            onClick={() => handleOpenEdit(car)}
                            className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 border border-slate-200 rounded-full transition-all cursor-pointer focus:outline-none"
                            title="Edit details"
                            id={`btn_edit_grid_${car.id}`}>
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteCar(car.id!)}
                            className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 rounded-full transition-all cursor-pointer focus:outline-none"
                            title="Delete stock"
                            id={`btn_del_grid_${car.id}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onSelect(car)}
                            className="px-4 py-2 rounded-full bg-blue-50/70 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-semibold tracking-wide transition-all cursor-pointer focus:outline-none">
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans">
                  <thead className="bg-zinc-50/80 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold font-mono border-b border-zinc-200/80">
                    <tr>
                      <th className="p-4">Vehicle Specs</th>
                      <th className="p-4">Body Style</th>
                      <th className="p-4">Condition</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Fuel Mechanism</th>
                      <th className="p-4">Mileage</th>
                      <th className="p-4">Price</th>
                      <th className="p-4 text-right">Administrate</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100 text-sm text-zinc-700">
                    {paginatedCars.map((car) => (
                      <tr
                        key={car.id}
                        className="hover:bg-zinc-50/40 transition">
                        {/* Brand and Model */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={car.imageUrl}
                              alt="thumbnail"
                              className="w-10 h-7 rounded object-cover bg-zinc-100 border border-zinc-200/50"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="font-semibold text-zinc-900">
                                {car.make} {car.model}
                              </div>
                              <div className="text-[11px] text-zinc-500 font-mono">
                                Mfg: {car.year} • {car.transmission}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Body Style */}
                        <td className="p-4">
                          <span className="text-xs font-mono text-zinc-650">
                            {car.bodyType}
                          </span>
                        </td>

                        {/* Condition */}
                        <td className="p-4">
                          <span
                            className={`text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded font-mono uppercase ${
                              car.condition === CarCondition.Excellent
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                : car.condition === CarCondition.VeryGood
                                  ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                                  : "bg-amber-50 text-amber-700 border border-amber-200/60"
                            }`}>
                            {car.condition}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          <span
                            className={`text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full font-mono uppercase border ${
                              !car.status || car.status === CarStatus.Available
                                ? "bg-blue-50/60 text-blue-700 border-blue-200"
                                : car.status === CarStatus.Sold
                                  ? "bg-emerald-50/60 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50/60 text-amber-700 border-amber-200"
                            }`}>
                            {car.status || CarStatus.Available}
                          </span>
                        </td>

                        {/* Fuel Mechanism */}
                        <td className="p-4">
                          <span className="text-xs text-zinc-600 font-mono">
                            {car.fuelType}
                          </span>
                        </td>

                        {/* Mileage */}
                        <td className="p-4 font-mono text-xs text-zinc-650">
                          {car.mileage.toLocaleString()} km
                        </td>

                        {/* Price */}
                        <td className="p-4 font-bold font-mono text-blue-605">
                          ₱{car.price.toLocaleString()}
                        </td>

                        {/* CMS Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 font-sans">
                            <button
                              onClick={() => onSelectCar(car)}
                              className="px-2.5 py-1 bg-zinc-50 hover:bg-zinc-100 text-xs border border-zinc-200/70 text-zinc-700 rounded transition font-medium cursor-pointer"
                              id={`btn_detail_tbl_${car.id}`}>
                              View
                            </button>
                            <button
                              onClick={() => handleOpenEdit(car)}
                              className="p-1 px-1.5 bg-zinc-50 hover:bg-zinc-105 border border-zinc-200/70 text-zinc-700 rounded transition cursor-pointer"
                              title="Edit vehicle listing"
                              id={`btn_edit_tbl_${car.id}`}>
                              <Edit className="w-3.5 h-3.5 text-zinc-500" />
                            </button>
                            <button
                              onClick={() => onDeleteCar(car.id!)}
                              className="p-1 px-1.5 bg-zinc-50 hover:bg-rose-50 border border-zinc-200/70 text-rose-650 rounded transition cursor-pointer"
                              title="Delete vehicle listing"
                              id={`btn_del_tbl_${car.id}`}>
                              <Trash2 className="w-3.5 h-3.5 text-rose-605" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredAndSortedCars.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-8 border-t border-zinc-200">
              <div className="text-xs text-zinc-500 font-sans">
                Showing{" "}
                <span className="font-semibold text-zinc-800">
                  {Math.min(
                    (activePage - 1) * ITEMS_PER_PAGE + 1,
                    filteredAndSortedCars.length,
                  )}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-zinc-800">
                  {Math.min(
                    activePage * ITEMS_PER_PAGE,
                    filteredAndSortedCars.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-bold text-zinc-900">
                  {filteredAndSortedCars.length}
                </span>{" "}
                vehicles
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5 font-sans">
                  {/* Prev Button */}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={activePage === 1}
                    className="p-2 border border-zinc-200 hover:border-zinc-300 rounded-lg bg-white text-zinc-650 hover:text-zinc-800 disabled:opacity-40 disabled:hover:border-zinc-200 disabled:hover:text-zinc-650 cursor-pointer transition focus:outline-none flex items-center justify-center"
                    id="btn_prev_page"
                    title="Previous Page">
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pg) => {
                      const isSelected = activePage === pg;
                      return (
                        <button
                          key={pg}
                          onClick={() => setCurrentPage(pg)}
                          className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-semibold transition cursor-pointer border ${
                            isSelected
                              ? "bg-blue-600 border-blue-600 text-white shadow-xs font-bold"
                              : "bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50"
                          }`}
                          id={`btn_page_${pg}`}>
                          {pg}
                        </button>
                      );
                    },
                  )}

                  {/* Next Button */}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={activePage === totalPages}
                    className="p-2 border border-zinc-200 hover:border-zinc-300 rounded-lg bg-white text-zinc-650 hover:text-zinc-800 disabled:opacity-40 disabled:hover:border-zinc-200 disabled:hover:text-zinc-650 cursor-pointer transition focus:outline-none flex items-center justify-center"
                    id="btn_next_page"
                    title="Next Page">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
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
                Vehicles selected to compare (Max 3)
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
                      onClick={() =>
                        setCompareIds((prev) =>
                          prev.filter((item) => item !== id),
                        )
                      }
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
                  setCompareIds([]);
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
                            {item.features.map((feat, index) => (
                              <span
                                key={index}
                                className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[9px] text-slate-600">
                                {feat}
                              </span>
                            ))}
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
                      {CarBodyType.Sedan}
                    </option>
                    <option value={CarBodyType.SUV}>{CarBodyType.SUV}</option>
                    <option value={CarBodyType.Coupe}>
                      {CarBodyType.Coupe}
                    </option>
                    <option value={CarBodyType.Truck}>
                      {CarBodyType.Truck}
                    </option>
                    <option value={CarBodyType.Hatchback}>
                      {CarBodyType.Hatchback}
                    </option>
                    <option value={CarBodyType.Convertible}>
                      {CarBodyType.Convertible}
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
                      {CarFuelType.Gasoline}
                    </option>
                    <option value={CarFuelType.Electric}>
                      {CarFuelType.Electric}
                    </option>
                    <option value={CarFuelType.Hybrid}>
                      {CarFuelType.Hybrid}
                    </option>
                    <option value={CarFuelType.Diesel}>
                      {CarFuelType.Diesel}
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
                      {CarTransmission.Automatic}
                    </option>
                    <option value={CarTransmission.Manual}>
                      {CarTransmission.Manual}
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
                      {CarCondition.Excellent}
                    </option>
                    <option value={CarCondition.VeryGood}>
                      {CarCondition.VeryGood}
                    </option>
                    <option value={CarCondition.Good}>
                      {CarCondition.Good}
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
                    <option value={CarStatus.Available}>
                      {CarStatus.Available}
                    </option>
                    <option value={CarStatus.Sold}>{CarStatus.Sold}</option>
                    <option value={CarStatus.Archived}>
                      {CarStatus.Archived}
                    </option>
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
                        onClick={() =>
                          setFormData((p) => ({
                            ...p,
                            imageUrl: "",
                            images: [],
                          }))
                        }
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
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const files = Array.from(e.dataTransfer.files) as File[];
                      const imageFiles = files.filter((f) =>
                        f.type.startsWith("image/"),
                      );
                      if (imageFiles.length > 0) {
                        const promises = imageFiles.map((file) => {
                          return new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              resolve((event.target?.result as string) || "");
                            };
                            reader.readAsDataURL(file);
                          });
                        });
                        Promise.all(promises).then((uploadedUrls) => {
                          const validUrls = uploadedUrls.filter(
                            (url) => url !== "",
                          );
                          setFormData((p) => {
                            const currentImages =
                              p.images && p.images.length > 0
                                ? [...p.images]
                                : p.imageUrl
                                  ? [p.imageUrl]
                                  : [];
                            const newImages = [...currentImages, ...validUrls];
                            return {
                              ...p,
                              images: newImages,
                              imageUrl: p.imageUrl ? p.imageUrl : newImages[0],
                            };
                          });
                        });
                      }
                    }}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-white rounded-xl p-5 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all relative overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(
                          e.target.files || [],
                        ) as File[];
                        const imageFiles = files.filter((f) =>
                          f.type.startsWith("image/"),
                        );
                        if (imageFiles.length > 0) {
                          const promises = imageFiles.map((file) => {
                            return new Promise<string>((resolve) => {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                resolve((event.target?.result as string) || "");
                              };
                              reader.readAsDataURL(file);
                            });
                          });
                          Promise.all(promises).then((uploadedUrls) => {
                            const validUrls = uploadedUrls.filter(
                              (url) => url !== "",
                            );
                            setFormData((p) => {
                              const currentImages =
                                p.images && p.images.length > 0
                                  ? [...p.images]
                                  : p.imageUrl
                                    ? [p.imageUrl]
                                    : [];
                              const newImages = [
                                ...currentImages,
                                ...validUrls,
                              ];
                              return {
                                ...p,
                                images: newImages,
                                imageUrl: p.imageUrl
                                  ? p.imageUrl
                                  : newImages[0],
                              };
                            });
                          });
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
                        placeholder="E.g. https://images.unsplash.com/photo-..."
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
                                    onClick={() => {
                                      setFormData((p) => {
                                        const filtered = items.filter(
                                          (_, idx) => idx !== index,
                                        );
                                        let nextMain = p.imageUrl;
                                        // If we deleted the main image, change main image to first remaining or empty
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
                  Key Features (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Autopilot, Panoramic Roof, Heated Steering Wheel"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-medium">
                      Contact Person
                    </span>
                    <input
                      type="text"
                      placeholder="Name"
                      value={formData.seller?.name || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          seller: {
                            ...(p.seller || {
                              name: "",
                              phone: "",
                              email: "",
                              rating: 5,
                              location: "",
                            }),
                            name: e.target.value,
                          },
                        }))
                      }
                      className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-305"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-medium">
                      Contact Mobile
                    </span>
                    <input
                      type="text"
                      placeholder="Phone"
                      value={formData.seller?.phone || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          seller: {
                            ...(p.seller || {
                              name: "",
                              phone: "",
                              email: "",
                              rating: 5,
                              location: "",
                            }),
                            phone: e.target.value,
                          },
                        }))
                      }
                      className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-305"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-medium">
                      Sales Email
                    </span>
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.seller?.email || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          seller: {
                            ...(p.seller || {
                              name: "",
                              phone: "",
                              email: "",
                              rating: 5,
                              location: "",
                            }),
                            email: e.target.value,
                          },
                        }))
                      }
                      className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-305"
                    />
                  </div>
                </div>
              </div>
              {/* Control Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-150">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
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
