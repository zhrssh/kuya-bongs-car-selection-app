/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Car } from '../types';
import { CarCondition, CarConditionLabel, CarFuelTypeLabel, CarTransmissionLabel } from '@repo/shared';
import { Fuel, ShieldCheck, MapPin, Milestone, Sparkles } from 'lucide-react';

interface CarCardProps {
  car: Car;
  onSelect: (car: Car) => void;
  isComparing: boolean;
  onToggleCompare: (car: Car) => void;
  canCompare: boolean;
}

export const CarCard: React.FC<CarCardProps> = ({
  car,
  onSelect,
  isComparing,
  onToggleCompare,
  canCompare,
}) => {
  // Format numbers
  const formattedPrice = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(car.price);

  const formattedMileage = new Intl.NumberFormat('en-US').format(car.mileage);

  // Condition Badge Styling
  const getConditionColor = (cond: string) => {
    switch (cond) {
      case CarCondition.Excellent:
        return 'bg-success-bg text-success-text border-success-border';
      case CarCondition.VeryGood:
        return 'bg-sky-50 text-sky-700 border-sky-100';
      default:
        return 'bg-warning-bg text-warning border-warning-bg';
    }
  };

  return (
    <article
      id={`car-card-${car.id}`}
      className="group bg-bg-surface rounded-3xl border border-border overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full"
    >
      {/* Image Area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-raised">
        <img
          src={car.imageUrl}
          alt={`${car.year} ${car.make} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
          referrerPolicy="no-referrer"
        />

        {/* Top Badges overlay */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
          <span
            className={`pointer-events-auto border px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs ${getConditionColor(
              car.condition
            )}`}
          >
            {CarConditionLabel[car.condition] || car.condition}
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
                ? 'bg-brand text-text-on-brand border-brand-dark shadow-sm'
                : 'bg-bg-surface/90 text-text-secondary-hover border-border hover:bg-bg-surface disabled:opacity-40'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                isComparing
                  ? 'border-white bg-brand'
                  : 'border-text-faint bg-bg-surface'
              }`}
            >
              {isComparing && (
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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
              <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider bg-bg-dark/80 text-white font-bold px-2 py-1 rounded-full backdrop-blur-xs">
                <Sparkles className="h-2.5 w-2.5 text-warning" />
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
            <span className="text-xs text-text-faint font-semibold">{car.year}</span>
            <span className="text-[10px] uppercase font-bold text-text-faint flex items-center gap-1">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              {car.seller.location.split(',')[0]}
            </span>
          </div>
          <h3 className="font-display font-semibold text-base text-text-strong line-clamp-1 group-hover:text-brand transition-colors">
            {car.make} {car.model}
          </h3>
        </div>

        {/* Brief highlights grid */}
        <div className="grid grid-cols-2 gap-y-2 border-t border-b border-bg-muted py-3 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <Milestone className="h-4 w-4 text-text-faint flex-shrink-0" />
            <span className="font-medium text-text-secondary">{formattedMileage} km</span>
          </div>
          <div className="flex items-center gap-2">
            <Fuel className="h-4 w-4 text-text-faint flex-shrink-0" />
            <span className="font-medium text-text-secondary line-clamp-1">{CarFuelTypeLabel[car.fuelType] || car.fuelType}</span>
          </div>
          <div className="flex items-center gap-2 col-span-2 text-[11px] text-text-muted">
            <span className="font-normal">Transmission:</span>
            <span className="font-semibold text-text-secondary-hover ml-1">{CarTransmissionLabel[car.transmission] || car.transmission}</span>
          </div>
        </div>

        {/* Pricing tag & Action buttons */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-[9px] text-text-faint block font-bold">
              Sale Price
            </span>
            <span className="font-display font-semibold text-lg text-text-strong">
              {formattedPrice}
            </span>
          </div>
          
          <button
            onClick={() => onSelect(car)}
            className="px-4 py-2 rounded-full bg-brand/10 hover:bg-brand text-brand hover:text-text-on-brand text-xs font-semibold tracking-wide transition-all cursor-pointer focus:outline-none"
          >
            Details
          </button>
        </div>
      </div>
    </article>
  );
};
