/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { FilterState, Car } from '../types';
import { Search, RotateCcw, SlidersHorizontal, ChevronRight, X } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  cars: Car[];
  onReset: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  setFilters,
  cars,
  onReset,
  isOpen = false,
  onClose,
}) => {
  // Extract dynamic search lists
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

  const fuelTypes = useMemo(() => {
    const list = new Set(cars.map((car) => car.fuelType));
    return Array.from(list).sort();
  }, [cars]);

  const transmissions = useMemo(() => {
    const list = new Set(cars.map((car) => car.transmission));
    return Array.from(list).sort();
  }, [cars]);

  // Handler for generic inputs
  const handleChange = (
    key: keyof FilterState,
    value: string
  ) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };
      // If we change the make, reset the model to prevent incompatible combos (e.g., Tesla M4)
      if (key === 'make' && value !== prev.make) {
        updated.model = '';
      }
      return updated;
    });
  };

  const handlePriceQuickSelect = (min: string, max: string) => {
    setFilters((prev) => ({ ...prev, priceMin: min, priceMax: max }));
  };

  return (
    <aside
      className={`
        bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-6 transition-all duration-300
        ${isOpen ? 'shadow-lg' : 'shadow-[0_1px_4px_rgba(0,0,0,0.01)]'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-700" />
          <h2 className="font-display font-semibold text-base text-slate-900">Filters</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-505 text-slate-500 hover:text-blue-600 transition-colors focus:outline-none"
            title="Reset all filters"
          >
            <RotateCcw className="h-3 w-3" />
            Clear All
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-slate-650 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          )}
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
              onChange={(e) => handleChange('searchQuery', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2 px-3 pl-9 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all font-sans text-slate-800"
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
            onChange={(e) => handleChange('make', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all font-sans text-slate-800 cursor-pointer"
          >
            <option value="">All Brands</option>
            {makes.map((make) => (
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
            onChange={(e) => handleChange('model', e.target.value)}
            disabled={modelsForMake.length === 0}
            className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all font-sans text-slate-800 cursor-pointer disabled:opacity-50"
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

        {/* Vehicle Condition */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Vehicle Condition
          </label>
          <div className="flex flex-wrap gap-1.5">
            {['Excellent', 'Very Good', 'Good'].map((cond) => {
              const isSelected = filters.condition === cond;
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() => handleChange('condition', isSelected ? '' : cond)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/70 text-blue-700 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
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
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Min Price</span>
              <input
                type="number"
                placeholder="No Min"
                value={filters.priceMin}
                onChange={(e) => handleChange('priceMin', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all font-sans text-slate-800"
              />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Max Price</span>
              <input
                type="number"
                placeholder="No Max"
                value={filters.priceMax}
                onChange={(e) => handleChange('priceMax', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all font-sans text-slate-800"
              />
            </div>
          </div>

          {/* Quick Price Targets */}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <button
              type="button"
              onClick={() => handlePriceQuickSelect('', '1500000')}
              className={`text-[10px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                filters.priceMax === '1500000' && filters.priceMin === ''
                  ? 'border-blue-500 bg-blue-50/70 text-blue-700 font-bold'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              Under ₱1.5M
            </button>
            <button
              type="button"
              onClick={() => handlePriceQuickSelect('1500000', '3000000')}
              className={`text-[10px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                filters.priceMin === '1500000' && filters.priceMax === '3000000'
                  ? 'border-blue-500 bg-blue-50/70 text-blue-700 font-bold'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              ₱1.5M - ₱3M
            </button>
            <button
              type="button"
              onClick={() => handlePriceQuickSelect('3000000', '')}
              className={`text-[10px] px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                filters.priceMin === '3000000' && filters.priceMax === ''
                  ? 'border-blue-500 bg-blue-50/70 text-blue-700 font-bold'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
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
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Min Year</span>
              <select
                value={filters.yearMin}
                onChange={(e) => handleChange('yearMin', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2 px-1 focus:bg-white text-xs focus:ring-2 focus:ring-blue-500/10 transition-all font-sans text-slate-800"
              >
                <option value="">Any Min</option>
                {[2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Max Year</span>
              <select
                value={filters.yearMax}
                onChange={(e) => handleChange('yearMax', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2 px-1 focus:bg-white text-xs focus:ring-2 focus:ring-blue-500/10 transition-all font-sans text-slate-800"
              >
                <option value="">Any Max</option>
                {[2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024].map((year) => (
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
            {bodyTypes.map((type) => {
              const isSelected = filters.bodyType === type;
              return (
                <button
                  key={type}
                  onClick={() => handleChange('bodyType', isSelected ? '' : type)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/70 text-blue-700 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
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
            onChange={(e) => handleChange('fuelType', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl py-2.5 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all font-sans text-slate-800 cursor-pointer"
          >
            <option value="">All Fuel Types</option>
            {fuelTypes.map((fuel) => (
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
            {transmissions.map((trans) => {
              const isSelected = filters.transmission === trans;
              return (
                <button
                  key={trans}
                  onClick={() => handleChange('transmission', isSelected ? '' : trans)}
                  className={`text-xs py-2 rounded-full border font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/70 text-blue-700 font-semibold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {trans}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
