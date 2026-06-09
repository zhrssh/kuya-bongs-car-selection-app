import {
  CarBodyTypeLabel,
  CarFuelTypeLabel,
  CarStatus,
  CarTransmissionLabel,
} from "@repo/shared";
import { Edit, Trash2 } from "lucide-react";
import { Car } from "../types";
import { useCarStore } from "../stores/carStore";
import { getConditionColor } from "../utils/conditionColor";

interface CarTableProps {
  cars: Car[];
  onOpenEdit: (car: Car) => void;
  onDelete: (car: Car) => void;
}

export default function CarTable({ cars, onOpenEdit, onDelete }: CarTableProps) {
  const setSelectedCar = useCarStore((s) => s.setSelectedCar);

  return (
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
            {cars.map((car) => (
              <tr
                key={car.id}
                className="hover:bg-zinc-50/40 transition">
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
                        Mfg: {car.year} &bull;{" "}
                        {CarTransmissionLabel[car.transmission] ||
                          car.transmission}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  <span className="text-xs font-mono text-zinc-650">
                    {CarBodyTypeLabel[car.bodyType] || car.bodyType}
                  </span>
                </td>

                <td className="p-4">
                  <span
                    className={`text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded font-mono uppercase border ${getConditionColor(car.condition)}`}>
                    {car.condition}
                  </span>
                </td>

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

                <td className="p-4">
                  <span className="text-xs text-zinc-600 font-mono">
                    {CarFuelTypeLabel[car.fuelType] || car.fuelType}
                  </span>
                </td>

                <td className="p-4 font-mono text-xs text-zinc-650">
                  {car.mileage.toLocaleString()} km
                </td>

                <td className="p-4 font-bold font-mono text-blue-605">
                  ₱{car.price.toLocaleString()}
                </td>

                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 font-sans">
                    <button
                      onClick={() => setSelectedCar(car)}
                      className="px-2.5 py-1 bg-zinc-50 hover:bg-zinc-100 text-xs border border-zinc-200/70 text-zinc-700 rounded transition font-medium cursor-pointer"
                      id={`btn_detail_tbl_${car.id}`}>
                      View
                    </button>
                    <button
                      onClick={() => onOpenEdit(car)}
                      className="p-1 px-1.5 bg-zinc-50 hover:bg-zinc-105 border border-zinc-200/70 text-zinc-700 rounded transition cursor-pointer"
                      title="Edit vehicle listing"
                      id={`btn_edit_tbl_${car.id}`}>
                      <Edit className="w-3.5 h-3.5 text-zinc-500" />
                    </button>
                    <button
                      onClick={() => onDelete(car)}
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
  );
}
