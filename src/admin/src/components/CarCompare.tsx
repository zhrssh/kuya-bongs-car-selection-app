import {
  CarConditionLabel,
  CarFuelTypeLabel,
  CarTransmissionLabel,
} from "@repo/shared";
import { X, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useCarStore } from "../stores/carStore";
import { useInventoryStore } from "../stores/inventoryStore";
import { getConditionColor } from "../utils/conditionColor";

interface CarCompareProps {
  isModalOpen?: boolean;
  onModalClose?: () => void;
}

export default function CarCompare({ isModalOpen = false, onModalClose }: CarCompareProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const showModal = isModalOpen || internalOpen;

  const compareIds = useInventoryStore((s) => s.compareIds);
  const toggleCompareId = useInventoryStore((s) => s.toggleCompareId);
  const clearCompareIds = useInventoryStore((s) => s.clearCompareIds);
  const cars = useCarStore((s) => s.cars);

  const closeModal = () => {
    setInternalOpen(false);
    onModalClose?.();
  };

  return (
    <>
      {compareIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-4 px-6 z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] transition-all animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="bg-brand text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold font-mono">
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
                  onClick={() => setInternalOpen(true)}
                  className="px-4 py-1.5 bg-brand text-white text-xs font-semibold rounded-full hover:bg-brand-dark transition shadow-xs cursor-pointer"
                  id="btn_open_compare_specs">
                  Compare Side-by-Side
                </button>
              )}

              <button
                onClick={() => {
                  clearCompareIds();
                  closeModal();
                }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-650 transition cursor-pointer">
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-zinc-200 text-zinc-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative flex flex-col gap-6">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-650 focus:outline-none">
              <X className="h-6 w-6" />
            </button>

            <div>
              <h3 className="text-xl font-display font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-brand" />
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
                          className="py-3 px-4 text-center font-bold text-brand text-sm">
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
                            {CarConditionLabel[item.condition]}
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
                      Fuel Type
                    </td>
                    {compareIds.map((id) => {
                      const item = cars.find((c) => c.id === id);
                      if (!item) return null;
                      return (
                        <td key={id} className="py-3 px-4 text-center">
                          {CarFuelTypeLabel[item.fuelType]}
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
                          {CarTransmissionLabel[item.transmission]}
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
                onClick={closeModal}
                className="px-5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold cursor-pointer">
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
