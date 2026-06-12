/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Car } from '../types';
import { CarCondition, CarConditionLabel, CarFuelTypeLabel, CarTransmissionLabel } from '@repo/shared';
import { SlidersHorizontal, X } from 'lucide-react';

interface ComparePanelProps {
  comparingCars: Car[];
  onRemoveFromCompare: (car: Car) => void;
  onClearCompare: () => void;
  onSelectCar: (car: Car) => void;
}

export const ComparePanel: React.FC<ComparePanelProps> = ({
  comparingCars,
  onRemoveFromCompare,
  onClearCompare,
  onSelectCar,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (comparingCars.length === 0) return null;

  // Format monetary figures
  const formatValue = (num: number, isPrice = false) => {
    return new Intl.NumberFormat('en-PH', {
      style: isPrice ? 'currency' : 'decimal',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case CarCondition.Excellent:
        return 'bg-success-bg text-success-text border-success-border/60';
      case CarCondition.VeryGood:
        return 'bg-brand/10 text-brand-dark border-brand/20';
      case CarCondition.Good:
      default:
        return 'bg-warning-bg text-warning border-warning-bg';
    }
  };

  return (
    <>
      {/* Comparison Drawer / Sticky Compact Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-surface/95 backdrop-blur-md border-t border-border py-4 px-6 z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] transition-all animate-in slide-in-from-bottom duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="bg-brand text-text-on-brand rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold font-mono">
              {comparingCars.length}
            </span>
            <h3 className="font-semibold text-sm text-text-body">
              Vehicles selected to compare (Max 3)
            </h3>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {comparingCars.map((car) => (
              <div
                key={car.id}
                className="flex items-center gap-2 bg-bg-raised border border-border rounded-full pl-2 pr-3 py-1 text-xs text-text-secondary-hover"
              >
                <img
                  src={car.imageUrl}
                  alt="preview"
                  className="w-8 h-6 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="font-medium">
                  {car.make} {car.model}
                </span>
                <button
                  onClick={() => onRemoveFromCompare(car)}
                  className="text-text-faint hover:text-text-secondary-hover transition ml-1 cursor-pointer focus:outline-none"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {comparingCars.length >= 1 && (
              <button
                onClick={() => setIsExpanded(true)}
                className="px-4 py-1.5 bg-brand hover:bg-brand-dark text-text-on-brand text-xs font-semibold rounded-full transition shadow-xs cursor-pointer focus:outline-none"
                id="btn_open_compare_specs"
              >
                Compare Side-by-Side
              </button>
            )}

            <button
              onClick={onClearCompare}
              className="text-xs font-semibold text-text-faint hover:text-text-secondary-hover transition cursor-pointer focus:outline-none"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-side comparison matrix modal */}
      {isExpanded && (
        <div className="fixed inset-0 bg-bg-dark/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-bg-surface border border-border text-text-body rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 text-text-faint hover:text-text-secondary-hover transition Focus:outline-none cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>

            <div>
              <h3 className="text-xl font-display font-semibold text-text-strong tracking-tight flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-brand" />
                Vehicle Specification Comparison
              </h3>
              <p className="text-xs text-text-faint mt-1 font-sans">
                Direct feature matrix and specification breakdown for your selected vehicles
              </p>
            </div>

            <div className="overflow-x-auto border border-bg-muted rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-bg-muted bg-bg-raised/50">
                    <th className="py-4 px-4 font-semibold text-text-faint uppercase tracking-wider w-1/4">
                      Specs Matrix
                    </th>
                    {comparingCars.map((car) => (
                      <th key={car.id} className="py-4 px-4 w-1/4 text-center">
                        <div className="relative inline-block group">
                          <img
                            src={car.imageUrl}
                            alt={car.model}
                            className="w-48 h-32 object-cover rounded-xl border border-border mx-auto mb-2"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            onClick={() => onRemoveFromCompare(car)}
                            className="absolute -top-1.5 -right-1.5 bg-danger hover:bg-danger text-white p-1 rounded-full shadow-sm transition-all focus:outline-none cursor-pointer"
                            title="Remove from comparison"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="font-display font-semibold text-sm text-text-strong">
                          {car.make} {car.model}
                        </div>
                        <div className="text-[10px] text-text-faint font-medium font-mono mt-0.5">
                          {car.year} Model
                        </div>
                      </th>
                    ))}
                    {/* Fill column if less than 3 cars compared to preserve 1/4 layout widths */}
                    {comparingCars.length < 3 &&
                      Array.from({ length: 3 - comparingCars.length }).map((_, idx) => (
                        <th key={`empty-col-${idx}`} className="py-4 px-4 w-1/4 text-center text-text-faint font-normal italic border-l border-bg-raised">
                          Empty Slot
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-bg-muted divide-bg-muted">
                  <tr className="hover:bg-bg-raised/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-text-muted text-[10px]">
                      Sale Price
                    </td>
                    {comparingCars.map((car) => (
                      <td
                        key={car.id}
                        className="py-3.5 px-4 text-center font-bold text-brand text-sm font-mono"
                      >
                        {formatValue(car.price, true)}
                      </td>
                    ))}
                    {comparingCars.length < 3 &&
                      Array.from({ length: 3 - comparingCars.length }).map((_, idx) => (
                        <td key={`empty-p-${idx}`} className="py-3.5 px-4 text-center text-text-faint italic font-mono">
                          —
                        </td>
                      ))}
                  </tr>
                  <tr className="hover:bg-bg-raised/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-text-muted text-[10px]">
                      Mileage
                    </td>
                    {comparingCars.map((car) => (
                      <td key={car.id} className="py-3.5 px-4 text-center font-medium text-text-secondary-hover font-mono">
                        {formatValue(car.mileage)} km
                      </td>
                    ))}
                    {comparingCars.length < 3 &&
                      Array.from({ length: 3 - comparingCars.length }).map((_, idx) => (
                        <td key={`empty-m-${idx}`} className="py-3.5 px-4 text-center text-text-faint italic font-mono">
                          —
                        </td>
                      ))}
                  </tr>
                  <tr className="hover:bg-bg-raised/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-text-muted text-[10px]">
                      Condition
                    </td>
                    {comparingCars.map((car) => (
                      <td key={car.id} className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border inline-block ${getConditionColor(
                            car.condition
                          )}`}
                        >
                          {CarConditionLabel[car.condition] || car.condition}
                        </span>
                      </td>
                    ))}
                    {comparingCars.length < 3 &&
                      Array.from({ length: 3 - comparingCars.length }).map((_, idx) => (
                        <td key={`empty-c-${idx}`} className="py-3.5 px-4 text-center text-text-faint italic">
                          —
                        </td>
                      ))}
                  </tr>
                  <tr className="hover:bg-bg-raised/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-text-muted text-[10px]">
                      Engine Powertrain
                    </td>
                    {comparingCars.map((car) => (
                      <td key={car.id} className="py-3.5 px-4 text-center font-medium text-text-secondary-hover">
                        {car.engine}
                      </td>
                    ))}
                    {comparingCars.length < 3 &&
                      Array.from({ length: 3 - comparingCars.length }).map((_, idx) => (
                        <td key={`empty-e-${idx}`} className="py-3.5 px-4 text-center text-text-faint italic">
                          —
                        </td>
                      ))}
                  </tr>
                  <tr className="hover:bg-bg-raised/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-text-muted text-[10px]">
                      Fuel Type
                    </td>
                    {comparingCars.map((car) => (
                      <td key={car.id} className="py-3.5 px-4 text-center font-medium text-text-secondary-hover">
                        {CarFuelTypeLabel[car.fuelType] || car.fuelType}
                      </td>
                    ))}
                    {comparingCars.length < 3 &&
                      Array.from({ length: 3 - comparingCars.length }).map((_, idx) => (
                        <td key={`empty-f-${idx}`} className="py-3.5 px-4 text-center text-text-faint text-text-faint italic">
                          —
                        </td>
                      ))}
                  </tr>
                  <tr className="hover:bg-bg-raised/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-text-muted text-[10px]">
                      Transmission
                    </td>
                    {comparingCars.map((car) => (
                      <td key={car.id} className="py-3.5 px-4 text-center font-medium text-text-secondary-hover">
                        {CarTransmissionLabel[car.transmission] || car.transmission}
                      </td>
                    ))}
                    {comparingCars.length < 3 &&
                      Array.from({ length: 3 - comparingCars.length }).map((_, idx) => (
                        <td key={`empty-t-${idx}`} className="py-3.5 px-4 text-center text-text-faint italic">
                          —
                        </td>
                      ))}
                  </tr>
                  <tr className="hover:bg-bg-raised/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-text-muted text-[10px]">
                      Drivetrain
                    </td>
                    {comparingCars.map((car) => (
                      <td key={car.id} className="py-3.5 px-4 text-center font-medium text-text-secondary-hover">
                        {car.drivetrain}
                      </td>
                    ))}
                    {comparingCars.length < 3 &&
                      Array.from({ length: 3 - comparingCars.length }).map((_, idx) => (
                        <td key={`empty-d-${idx}`} className="py-3.5 px-4 text-center text-text-faint italic">
                          —
                        </td>
                      ))}
                  </tr>
                  {/* Action row */}
                  <tr className="hover:bg-bg-raised/40 transition">

                    <td className="py-3.5 px-4 font-semibold text-text-muted text-[10px]">
                      Highlights & Amenities
                    </td>
                    {comparingCars.map((car) => (
                      <td key={car.id} className="py-3 px-4">
                        <div className="flex justify-center text-[10px] text-text-secondary max-h-24 overflow-y-auto">
                            {car.features}
                        </div>
                      </td>
                    ))}
                    {comparingCars.length < 3 &&
                      Array.from({ length: 3 - comparingCars.length }).map((_, idx) => (
                        <td key={`empty-g-${idx}`} className="py-3 px-4 text-center text-text-faint italic">
                          —
                        </td>
                      ))}
                  </tr>
                  <tr className="hover:bg-bg-raised/40 transition">
                    <td className="py-4 px-4 font-semibold text-text-muted text-[10px]">
                      Action
                    </td>
                    {comparingCars.map((car) => (
                      <td key={car.id} className="py-4 px-4 text-center">
                        <button
                          onClick={() => {
                            setIsExpanded(false);
                            onSelectCar(car);
                          }}
                          className="px-4 py-1.5 bg-brand hover:bg-brand-dark text-text-on-brand font-semibold text-xs rounded-full transition-all cursor-pointer focus:outline-none shadow-xs"
                        >
                          View Details
                        </button>
                      </td>
                    ))}
                    {comparingCars.length < 3 &&
                      Array.from({ length: 3 - comparingCars.length }).map((_, idx) => (
                        <td key={`empty-a-${idx}`} className="py-4 px-4 text-center text-text-faint italic">
                          Empty Slot
                        </td>
                      ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-bg-muted">
              <button
                onClick={() => setIsExpanded(false)}
                className="px-5 py-2 rounded-lg bg-bg-muted hover:bg-bg-hover text-text-secondary-hover text-text-body text-text-secondary-hover text-xs font-semibold cursor-pointer transition focus:outline-none"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
