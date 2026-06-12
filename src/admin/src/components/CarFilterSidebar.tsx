import {
  CarBodyTypeLabel,
  CarCondition,
  CarConditionLabel,
  CarFuelType,
  CarFuelTypeLabel,
  CarTransmission,
  CarTransmissionLabel,
  FilterState,
} from "@repo/shared";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo } from "react";
import { useCarStore } from "../stores/carStore";
import { useInventoryStore } from "../stores/inventoryStore";

interface CarFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CarFilterSidebar({
  isOpen,
  onClose,
}: CarFilterSidebarProps) {
  const filters = useInventoryStore((s) => s.filters);
  const updateFilter = useInventoryStore((s) => s.updateFilter);
  const resetFilters = useInventoryStore((s) => s.resetFilters);
  const cars = useCarStore((s) => s.cars);

  const uniqueMakes = useMemo(
    () => Array.from(new Set(cars.map((c) => c.make))),
    [cars],
  );

  const uniqueBodyTypes = useMemo(
    () => Array.from(new Set(cars.map((c) => c.bodyType))),
    [cars],
  );

  const uniqueFuelTypes = useMemo(() => Object.values(CarFuelType), []);

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
    updateFilter(key, value);
  };

  const handlePriceQuickSelect = (min: string, max: string) => {
    updateFilter("priceMin", min);
    updateFilter("priceMax", max);
  };

  const handleYearQuickSelect = (min: string, max: string) => {
    updateFilter("yearMin", min);
    updateFilter("yearMax", max);
  };

  if (!isOpen) return null;

  return (
    <div className="lg:col-span-1">
      <aside className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-6 transition-all duration-300 shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
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
              onClick={() => resetFilters()}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand transition-colors focus:outline-none"
              title="Reset all filters">
              <RotateCcw className="h-3 w-3" />
              Clear All
            </button>
            <button
              onClick={onClose}
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
                className="w-full bg-slate-55 border border-slate-200 outline-none rounded-xl py-2 px-3 pl-9 text-xs focus:bg-white focus:ring-2 focus:ring-brand/10 transition-all font-sans text-slate-800"
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
              className="w-full bg-slate-55 border border-slate-200 outline-none rounded-xl py-2 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-brand/10 transition-all font-sans text-slate-800 cursor-pointer">
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
              className="w-full bg-slate-55 border border-slate-200 outline-none rounded-xl py-2 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-brand/10 transition-all font-sans text-slate-800 cursor-pointer disabled:opacity-50">
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
                        ? "border-brand bg-brand/10 text-brand-dark font-bold"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}>
                    {CarConditionLabel[cond]}
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
                  className="w-full bg-slate-55 border border-slate-200 outline-none rounded-xl py-2 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-brand/10 transition-all font-sans text-slate-800"
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
                  className="w-full bg-slate-55 border border-slate-200 outline-none rounded-xl py-2 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-brand/10 transition-all font-sans text-slate-800"
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
                    ? "border-brand bg-brand/10 text-brand-dark font-bold"
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
                    ? "border-brand bg-brand/10 text-brand-dark font-bold"
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
                    ? "border-brand bg-brand/10 text-brand-dark font-bold"
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
                <input
                  type="number"
                  placeholder="No Min"
                  value={filters.yearMin}
                  onChange={(e) =>
                    handleChange("yearMin", e.target.value)
                  }
                  className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-brand/10 transition-all font-sans text-slate-800"
                />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Max Year
                </span>
                <input
                  type="number"
                  placeholder="No Max"
                  value={filters.yearMax}
                  onChange={(e) =>
                    handleChange("yearMax", e.target.value)
                  }
                  className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-brand/10 transition-all font-sans text-slate-800"
                />
              </div>
            </div>

            {/* Quick Year Targets */}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <button
                type="button"
                onClick={() => handleYearQuickSelect("2024", "")}
                className={`text-[10px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                  filters.yearMin === "2024" && filters.yearMax === ""
                    ? "border-brand bg-brand/10 text-brand-dark font-bold"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}>
                2024 & Newer
              </button>
              <button
                type="button"
                onClick={() => handleYearQuickSelect("2020", "2024")}
                className={`text-[10px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                  filters.yearMin === "2020" && filters.yearMax === "2024"
                    ? "border-brand bg-brand/10 text-brand-dark font-bold"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}>
                2020 - 2024
              </button>
              <button
                type="button"
                onClick={() => handleYearQuickSelect("2015", "2019")}
                className={`text-[10px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                  filters.yearMin === "2015" && filters.yearMax === "2019"
                    ? "border-brand bg-brand/10 text-brand-dark font-bold"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}>
                2015 - 2019
              </button>
              <button
                type="button"
                onClick={() => handleYearQuickSelect("", "2015")}
                className={`text-[10px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                  filters.yearMin === "" && filters.yearMax === "2015"
                    ? "border-brand bg-brand/10 text-brand-dark font-bold"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}>
                2015 & Older
              </button>
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
                        ? "border-brand bg-brand/10 text-brand-dark font-bold"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}>
                    {CarBodyTypeLabel[type] || type}
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
              className="w-full bg-slate-55 border border-slate-200 outline-none rounded-xl py-2.5 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-brand/10 transition-all font-sans text-slate-800 cursor-pointer">
              <option value="">All Fuel Types</option>
              {uniqueFuelTypes.map((fuel) => (
                <option key={fuel} value={fuel}>
                  {CarFuelTypeLabel[fuel]}
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
                        ? "border-brand bg-brand/10 text-brand-dark font-semibold"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}>
                    {CarTransmissionLabel[trans]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
