import {
  CarFuelTypeLabel,
  CarStatus,
  CarTransmissionLabel,
} from "@repo/shared";
import { Edit, Fuel, MapPin, Milestone, Sparkles, Trash2 } from "lucide-react";
import { Car } from "../types";
import { useCarStore } from "../stores/carStore";
import { useInventoryStore } from "../stores/inventoryStore";
import { getConditionColor } from "../utils/conditionColor";

interface CarGridProps {
  onOpenEdit: (car: Car) => void;
  onDelete: (car: Car) => void;
}

export default function CarGrid({ onOpenEdit, onDelete }: CarGridProps) {
  const compareIds = useInventoryStore((s) => s.compareIds);
  const toggleCompareId = useInventoryStore((s) => s.toggleCompareId);
  const cars = useCarStore((s) => s.cars);
  const setSelectedCar = useCarStore((s) => s.setSelectedCar);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cars.map((car) => {
        const isComparing = compareIds.includes(car.id!);
        const canCompare = compareIds.length < 3;
        const onToggleCompare = (clickedCar: Car) => {
          toggleCompareId(clickedCar.id!);
        };
        const formattedMileage = car.mileage.toLocaleString();
        const formattedPrice = `₱${car.price.toLocaleString()}`;

        return (
          <article
            id={`car-card-${car.id}`}
            key={car.id}
            className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full">
            <div className="relative aspect-4/3 overflow-hidden bg-slate-50">
              <img
                src={car.imageUrl}
                alt={`${car.year} ${car.make} ${car.model}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                referrerPolicy="no-referrer"
              />

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

              <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
                <span
                  className={`pointer-events-auto border px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs ${getConditionColor(
                    car.condition,
                  )}`}>
                  {car.condition}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCompare(car);
                  }}
                  disabled={!isComparing && !canCompare}
                  className={`pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold backdrop-blur-md border transition-all cursor-pointer ${
                    isComparing
                      ? "bg-brand text-white border-brand-dark shadow-sm"
                      : "bg-white/90 text-slate-700 border-slate-200 hover:bg-white disabled:opacity-40"
                  }`}>
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                      isComparing
                        ? "border-white bg-brand"
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

            <div className="p-5 flex flex-col flex-1 gap-4">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-xs text-slate-400 font-semibold">
                    {car.year}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {car.seller!.location.split(",")[0]}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-base text-slate-905 text-slate-900 line-clamp-1 group-hover:text-brand transition-colors">
                  {car.make} {car.model}
                </h3>
              </div>

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
                    {CarFuelTypeLabel[car.fuelType] || car.fuelType}
                  </span>
                </div>
                <div className="flex items-center gap-2 col-span-2 text-[11px] text-slate-500">
                  <span className="font-normal">Transmission:</span>
                  <span className="font-semibold text-slate-700 ml-1">
                    {CarTransmissionLabel[car.transmission] ||
                      car.transmission}
                  </span>
                </div>
              </div>

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
                    onClick={() => onOpenEdit(car)}
                    className="p-2 bg-slate-50 hover:bg-brand/10 text-slate-500 hover:text-brand border border-slate-200 rounded-full transition-all cursor-pointer focus:outline-none"
                    title="Edit details"
                    id={`btn_edit_grid_${car.id}`}>
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(car)}
                    className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 rounded-full transition-all cursor-pointer focus:outline-none"
                    title="Delete stock"
                    id={`btn_del_grid_${car.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSelectedCar(car)}
                    className="px-4 py-2 rounded-full bg-brand/10 hover:bg-brand text-brand-dark hover:text-white text-xs font-semibold tracking-wide transition-all cursor-pointer focus:outline-none">
                    Details
                  </button>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
