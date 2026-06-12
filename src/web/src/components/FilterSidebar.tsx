import React, { useMemo } from 'react';
import { Car } from '../types';
import { FilterState } from '@repo/shared';
import {
  CarCondition,
  CarConditionLabel,
  CarFuelType,
  CarFuelTypeLabel,
  CarTransmission,
  CarTransmissionLabel,
  CarBodyTypeLabel,
} from '@repo/shared';
import { Search, RotateCcw, SlidersHorizontal, X } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onPriceQuickSelect: (min: string, max: string) => void;
  onYearQuickSelect: (min: string, max: string) => void;
  cars: Car[];
  onReset: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onPriceQuickSelect,
  onYearQuickSelect,
  cars,
  onReset,
  isOpen = false,
  onClose,
}) => {
  const makes = useMemo(() => {
    const list = new Set(cars.map((car) => car.make));
    return Array.from(list).sort();
  }, [cars]);

  const modelsForMake = useMemo(() => {
    if (!filters.make) {
      const list = new Set(cars.map((car) => car.model));
      return Array.from(list).sort();
    }
    const filtered = cars.filter((car) => car.make === filters.make);
    const list = new Set(filtered.map((car) => car.model));
    return Array.from(list).sort();
  }, [cars, filters.make]);

  const bodyTypes = useMemo(() => {
    const list = new Set(cars.map((car) => car.bodyType));
    return Array.from(list).sort();
  }, [cars]);

  const fuelTypes = useMemo(() => Object.values(CarFuelType), []);

  const transmissions = useMemo(() => Object.values(CarTransmission), []);

  return (
    <aside
      className={`
        bg-bg-surface rounded-2xl border border-border p-6 flex flex-col gap-6 transition-all duration-300
        ${isOpen ? 'shadow-lg' : 'shadow-[0_1px_4px_rgba(0,0,0,0.01)]'}
      `}
    >
      <div className="flex items-center justify-between border-b border-bg-muted pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-text-secondary-hover" />
          <h2 className="font-display font-semibold text-base text-text-strong">Filters</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-brand transition-colors focus:outline-none"
            title="Reset all filters"
          >
            <RotateCcw className="h-3 w-3" />
            Clear All
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-text-faint hover:text-text-secondary-hover focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-faint">
            Keyword Search
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Autopilot, AWD, V8..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange('searchQuery', e.target.value)}
              className="w-full bg-bg-raised border border-border outline-none rounded-xl py-2 px-3 pl-9 text-xs focus:bg-bg-surface focus:ring-2 focus:ring-brand/10 transition-all font-sans text-text-body"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-faint" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-faint">
            Brand (Make)
          </label>
          <select
            value={filters.make}
            onChange={(e) => onFilterChange('make', e.target.value)}
            className="w-full bg-bg-raised border border-border outline-none rounded-xl py-2 px-3 text-xs focus:bg-bg-surface focus:ring-2 focus:ring-brand/10 transition-all font-sans text-text-body cursor-pointer"
          >
            <option value="">All Brands</option>
            {makes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-faint">
            Model
          </label>
          <select
            value={filters.model}
            onChange={(e) => onFilterChange('model', e.target.value)}
            disabled={modelsForMake.length === 0}
            className="w-full bg-bg-raised border border-border outline-none rounded-xl py-2 px-3 text-xs focus:bg-bg-surface focus:ring-2 focus:ring-brand/10 transition-all font-sans text-text-body cursor-pointer disabled:opacity-50"
          >
            <option value="">
              {filters.make ? `All ${filters.make} Models` : 'All Models'}
            </option>
            {modelsForMake.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-faint">
            Vehicle Condition
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[CarCondition.Excellent, CarCondition.VeryGood, CarCondition.Good].map((cond) => {
              const isSelected = filters.condition === cond;
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() => onFilterChange('condition', isSelected ? '' : cond)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'border-brand bg-brand/10 text-brand-dark font-bold'
                      : 'border-border bg-bg-surface text-text-secondary hover:border-border-hover hover:bg-bg-raised'
                  }`}
                >
                  {CarConditionLabel[cond]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-faint">
            Price Range (₱)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[9px] text-text-faint font-bold uppercase tracking-wider block mb-1">Min Price</span>
              <input
                type="number"
                placeholder="No Min"
                value={filters.priceMin}
                onChange={(e) => onFilterChange('priceMin', e.target.value)}
                className="w-full bg-bg-raised border border-border outline-none rounded-xl py-2 px-3 text-xs focus:bg-bg-surface focus:ring-2 focus:ring-brand/10 transition-all font-sans text-text-body"
              />
            </div>
            <div>
              <span className="text-[9px] text-text-faint font-bold uppercase tracking-wider block mb-1">Max Price</span>
              <input
                type="number"
                placeholder="No Max"
                value={filters.priceMax}
                onChange={(e) => onFilterChange('priceMax', e.target.value)}
                className="w-full bg-bg-raised border border-border outline-none rounded-xl py-2 px-3 text-xs focus:bg-bg-surface focus:ring-2 focus:ring-brand/10 transition-all font-sans text-text-body"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <button
              type="button"
              onClick={() => onPriceQuickSelect('', '1500000')}
              className={`text-[10px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                filters.priceMax === '1500000' && filters.priceMin === ''
                  ? 'border-brand bg-brand/10 text-brand-dark font-bold'
                  : 'border-border bg-bg-surface text-text-secondary hover:border-border-hover hover:bg-bg-raised'
              }`}
            >
              Under ₱1.5M
            </button>
            <button
              type="button"
              onClick={() => onPriceQuickSelect('1500000', '3000000')}
              className={`text-[10px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                filters.priceMin === '1500000' && filters.priceMax === '3000000'
                  ? 'border-brand bg-brand/10 text-brand-dark font-bold'
                  : 'border-border bg-bg-surface text-text-secondary hover:border-border-hover hover:bg-bg-raised'
              }`}
            >
              ₱1.5M - ₱3M
            </button>
            <button
              type="button"
              onClick={() => onPriceQuickSelect('3000000', '')}
              className={`text-[10px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                filters.priceMin === '3000000' && filters.priceMax === ''
                  ? 'border-brand bg-brand/10 text-brand-dark font-bold'
                  : 'border-border bg-bg-surface text-text-secondary hover:border-border-hover hover:bg-bg-raised'
              }`}
            >
              ₱3M+
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-faint">
            Model Year Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[9px] text-text-faint font-bold uppercase tracking-wider block mb-1">Min Year</span>
              <input
                type="number"
                placeholder="No Min"
                value={filters.yearMin}
                onChange={(e) => onFilterChange('yearMin', e.target.value)}
                className="w-full bg-bg-raised border border-border outline-none rounded-xl py-2 px-3 text-xs focus:bg-bg-surface focus:ring-2 focus:ring-brand/10 transition-all font-sans text-text-body"
              />
            </div>
            <div>
              <span className="text-[9px] text-text-faint font-bold uppercase tracking-wider block mb-1">Max Year</span>
              <input
                type="number"
                placeholder="No Max"
                value={filters.yearMax}
                onChange={(e) => onFilterChange('yearMax', e.target.value)}
                className="w-full bg-bg-raised border border-border outline-none rounded-xl py-2 px-3 text-xs focus:bg-bg-surface focus:ring-2 focus:ring-brand/10 transition-all font-sans text-text-body"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <button
              type="button"
              onClick={() => onYearQuickSelect('2024', '')}
              className={`text-[10px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                filters.yearMin === '2024' && filters.yearMax === ''
                  ? 'border-brand bg-brand/10 text-brand-dark font-bold'
                  : 'border-border bg-bg-surface text-text-secondary hover:border-border-hover hover:bg-bg-raised'
              }`}
            >
              2024 & Newer
            </button>
            <button
              type="button"
              onClick={() => onYearQuickSelect('2020', '2024')}
              className={`text-[10px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                filters.yearMin === '2020' && filters.yearMax === '2024'
                  ? 'border-brand bg-brand/10 text-brand-dark font-bold'
                  : 'border-border bg-bg-surface text-text-secondary hover:border-border-hover hover:bg-bg-raised'
              }`}
            >
              2020 - 2024
            </button>
            <button
              type="button"
              onClick={() => onYearQuickSelect('2015', '2019')}
              className={`text-[10px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                filters.yearMin === '2015' && filters.yearMax === '2019'
                  ? 'border-brand bg-brand/10 text-brand-dark font-bold'
                  : 'border-border bg-bg-surface text-text-secondary hover:border-border-hover hover:bg-bg-raised'
              }`}
            >
              2015 - 2019
            </button>
            <button
              type="button"
              onClick={() => onYearQuickSelect('', '2015')}
              className={`text-[10px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                filters.yearMin === '' && filters.yearMax === '2015'
                  ? 'border-brand bg-brand/10 text-brand-dark font-bold'
                  : 'border-border bg-bg-surface text-text-secondary hover:border-border-hover hover:bg-bg-raised'
              }`}
            >
              2015 & Older
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-faint">
            Body Type
          </label>
          <div className="flex flex-wrap gap-1.5">
            {bodyTypes.map((type) => {
              const isSelected = filters.bodyType === type;
              return (
                <button
                  key={type}
                  onClick={() => onFilterChange('bodyType', isSelected ? '' : type)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'border-brand bg-brand/10 text-brand-dark font-bold'
                      : 'border-border bg-bg-surface text-text-secondary hover:border-border-hover hover:bg-bg-raised'
                  }`}
                >
                  {CarBodyTypeLabel[type] || type}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-faint">
            Fuel Type
          </label>
          <select
            value={filters.fuelType}
            onChange={(e) => onFilterChange('fuelType', e.target.value)}
            className="w-full bg-bg-raised border border-border outline-none rounded-xl py-2.5 px-3 text-xs focus:bg-bg-surface focus:ring-2 focus:ring-brand/10 transition-all font-sans text-text-body cursor-pointer"
          >
            <option value="">All Fuel Types</option>
            {fuelTypes.map((fuel) => (
              <option key={fuel} value={fuel}>
                {CarFuelTypeLabel[fuel] || fuel}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-faint">
            Transmission
          </label>
          <div className="grid grid-cols-2 gap-2">
            {transmissions.map((trans) => {
              const isSelected = filters.transmission === trans;
              return (
                <button
                  key={trans}
                  onClick={() => onFilterChange('transmission', isSelected ? '' : trans)}
                  className={`text-xs py-2 rounded-full border font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'border-brand bg-brand/10 text-brand-dark font-semibold'
                      : 'border-border bg-bg-surface text-text-secondary hover:border-border-hover'
                  }`}
                >
                  {CarTransmissionLabel[trans] || trans}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};