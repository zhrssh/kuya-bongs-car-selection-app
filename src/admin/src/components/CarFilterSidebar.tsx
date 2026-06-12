import {
  CarBodyTypeLabel,
  CarCondition,
  CarConditionLabel,
  CarFuelType,
  CarFuelTypeLabel,
  CarTransmission,
  CarTransmissionLabel,
  FilterState,
  Select,
} from "@repo/shared";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo } from "react";
import { useCarStore } from "../stores/carStore";
import { useInventoryStore } from "../stores/inventoryStore";

interface CarFilterSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function CarFilterSidebar({
  isOpen = false,
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

  return (
    <aside
      className={`
        bg-bg-surface border border-border p-6 flex flex-col gap-6 transition-all duration-300
        ${isOpen ? 'rounded-none shadow-lg h-full' : 'rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.01)]'}
      `}
    >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-text-secondary-hover" />
            <h2 className="font-display font-semibold text-base text-text-strong">
              Filters
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => resetFilters()}
              className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-brand transition-colors focus:outline-none"
              title="Reset all filters">
              <RotateCcw className="h-3 w-3" />
              Clear All
            </button>
            <button
              onClick={onClose}
              className="md:hidden text-text-faint hover:text-zinc-650 focus:outline-none">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Form Fields */}
        <div className={`flex flex-col gap-5 overflow-y-auto pr-1 ${isOpen ? 'flex-1 min-h-0' : 'max-h-[calc(100vh-280px)]'}`}>
          {/* Keyword Search */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-faint">
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
                className="w-full bg-slate-55 border border-border outline-none rounded-xl py-2 px-3 pl-9 text-xs focus:bg-bg-surface focus:ring-2 focus:ring-brand/10 transition-all font-sans text-text-body"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-faint" />
            </div>
          </div>

          {/* Brand / Make */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-faint">
              Brand (Make)
            </label>
            <Select
              value={filters.make}
              options={uniqueMakes.map((make) => ({ value: make, label: make }))}
              onChange={(v) => handleChange("make", v)}
              placeholder="All Brands"
              className="[&_button]:bg-slate-55"
            />
          </div>

          {/* Vehicle Model */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-faint">
              Model
            </label>
            <Select
              value={filters.model}
              options={modelsForMake.map((model) => ({ value: model, label: model }))}
              onChange={(v) => handleChange("model", v)}
              placeholder={filters.make ? `All ${filters.make} Models` : "All Models"}
              disabled={modelsForMake.length === 0}
              className="[&_button]:bg-slate-55"
            />
          </div>

          {/* Vehicle Condition */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-faint">
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
                        : "border-border bg-bg-surface text-text-secondary hover:border-border-hover hover:bg-bg-raised"
                    }`}>
                    {CarConditionLabel[cond]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-faint">
              Price Range (₱)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] text-text-faint font-bold uppercase tracking-wider block mb-1">
                  Min Price
                </span>
                <input
                  type="number"
                  placeholder="No Min"
                  value={filters.priceMin}
                  onChange={(e) =>
                    handleChange("priceMin", e.target.value)
                  }
                  className="w-full bg-slate-55 border border-border outline-none rounded-xl py-2 px-3 text-xs focus:bg-bg-surface focus:ring-2 focus:ring-brand/10 transition-all font-sans text-text-body"
                />
              </div>
              <div>
                <span className="text-[9px] text-text-faint font-bold uppercase tracking-wider block mb-1">
                  Max Price
                </span>
                <input
                  type="number"
                  placeholder="No Max"
                  value={filters.priceMax}
                  onChange={(e) =>
                    handleChange("priceMax", e.target.value)
                  }
                  className="w-full bg-slate-55 border border-border outline-none rounded-xl py-2 px-3 text-xs focus:bg-bg-surface focus:ring-2 focus:ring-brand/10 transition-all font-sans text-text-body"
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
                    : "border-border bg-bg-surface text-text-secondary hover:border-border-hover hover:bg-bg-raised"
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
                    : "border-border bg-bg-surface text-text-secondary hover:border-border-hover hover:bg-bg-raised"
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
                    : "border-border bg-bg-surface text-text-secondary hover:border-border-hover hover:bg-bg-raised"
                }`}>
                ₱3M+
              </button>
            </div>
          </div>

          {/* Year Range */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-faint">
              Model Year Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] text-text-faint font-bold uppercase tracking-wider block mb-1">
                  Min Year
                </span>
                <input
                  type="number"
                  placeholder="No Min"
                  value={filters.yearMin}
                  onChange={(e) =>
                    handleChange("yearMin", e.target.value)
                  }
                  className="w-full bg-bg-raised border border-border outline-none rounded-xl py-2 px-3 text-xs focus:bg-bg-surface focus:ring-2 focus:ring-brand/10 transition-all font-sans text-text-body"
                />
              </div>
              <div>
                <span className="text-[9px] text-text-faint font-bold uppercase tracking-wider block mb-1">
                  Max Year
                </span>
                <input
                  type="number"
                  placeholder="No Max"
                  value={filters.yearMax}
                  onChange={(e) =>
                    handleChange("yearMax", e.target.value)
                  }
                  className="w-full bg-bg-raised border border-border outline-none rounded-xl py-2 px-3 text-xs focus:bg-bg-surface focus:ring-2 focus:ring-brand/10 transition-all font-sans text-text-body"
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
                    : "border-border bg-bg-surface text-text-secondary hover:border-border-hover hover:bg-bg-raised"
                }`}>
                2024 & Newer
              </button>
              <button
                type="button"
                onClick={() => handleYearQuickSelect("2020", "2024")}
                className={`text-[10px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                  filters.yearMin === "2020" && filters.yearMax === "2024"
                    ? "border-brand bg-brand/10 text-brand-dark font-bold"
                    : "border-border bg-bg-surface text-text-secondary hover:border-border-hover hover:bg-bg-raised"
                }`}>
                2020 - 2024
              </button>
              <button
                type="button"
                onClick={() => handleYearQuickSelect("2015", "2019")}
                className={`text-[10px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                  filters.yearMin === "2015" && filters.yearMax === "2019"
                    ? "border-brand bg-brand/10 text-brand-dark font-bold"
                    : "border-border bg-bg-surface text-text-secondary hover:border-border-hover hover:bg-bg-raised"
                }`}>
                2015 - 2019
              </button>
              <button
                type="button"
                onClick={() => handleYearQuickSelect("", "2015")}
                className={`text-[10px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                  filters.yearMin === "" && filters.yearMax === "2015"
                    ? "border-brand bg-brand/10 text-brand-dark font-bold"
                    : "border-border bg-bg-surface text-text-secondary hover:border-border-hover hover:bg-bg-raised"
                }`}>
                2015 & Older
              </button>
            </div>
          </div>

          {/* Body Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-faint">
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
                        : "border-border bg-bg-surface text-text-secondary hover:border-border-hover hover:bg-bg-raised"
                    }`}>
                    {CarBodyTypeLabel[type] || type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fuel Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-faint">
              Fuel Type
            </label>
            <Select
              value={filters.fuelType}
              options={uniqueFuelTypes.map((fuel) => ({ value: fuel, label: CarFuelTypeLabel[fuel] }))}
              onChange={(v) => handleChange("fuelType", v)}
              placeholder="All Fuel Types"
              className="[&_button]:bg-slate-55"
            />
          </div>

          {/* Transmission */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-faint">
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
                        : "border-border bg-bg-surface text-text-secondary hover:border-border-hover"
                    }`}>
                    {CarTransmissionLabel[trans]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
  );
}
