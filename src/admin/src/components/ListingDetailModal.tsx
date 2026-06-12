/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { CarBodyTypeLabel, CarConditionLabel, CarFuelTypeLabel, CarStatus, CarStatusLabel, CarTransmissionLabel } from "@repo/shared";
import { Car } from "../types";

interface ListingDetailModalProps {
  car: Car | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: CarStatus) => void;
}

export default function ListingDetailModal({
  car,
  onClose,
  onUpdateStatus,
}: ListingDetailModalProps) {
  if (!car) return null;

  const [revealContact, setRevealContact] = useState<
    "none" | "phone" | "email"
  >("none");
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const carImages = [car.imageUrl, ...(car.images ?? [])];

  const handlePrevImage = () => {
    setActiveImgIndex((prev) => (prev === 0 ? carImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImgIndex((prev) => (prev === carImages.length - 1 ? 0 : prev + 1));
  };

  // Format currency
  const formattedPrice = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(car.price);

  const formattedMileage = new Intl.NumberFormat("en-US").format(car.mileage);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/45 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Background click to close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] animate-in fade-in zoom-in duration-200 z-10">
        {/* Close Button Pin */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 p-2 rounded-full shadow-md focus:outline-none transition-colors cursor-pointer"
          title="Close details">
          <X className="h-5 w-5" />
        </button>

        {/* Left Column: Visuals and Essential Specs (Scrollable on desktop) */}
        <div className="w-full md:w-1/2 flex flex-col overflow-y-auto border-r border-gray-150">
          <div className="relative aspect-video md:aspect-4/3 bg-slate-900 shrink-0 group overflow-hidden">
            {/* Main Active Image */}
            <img
              src={carImages[activeImgIndex]}
              alt={`${car.year} ${car.make} ${car.model} - View ${activeImgIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-350"
              referrerPolicy="no-referrer"
            />

            {/* Gradient Mask for controls readability */}
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/40 via-transparent to-slate-950/20 pointer-events-none" />

            {/* Left and Right navigation chevrons */}
            {carImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-slate-900/60 hover:bg-slate-900/90 hover:scale-105 active:scale-95 text-white p-2 rounded-full shadow-md transition-all focus:outline-none cursor-pointer"
                  title="Previous image">
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900/60 hover:bg-slate-900/90 hover:scale-105 active:scale-95 text-white p-2 rounded-full shadow-md transition-all focus:outline-none cursor-pointer"
                  title="Next image">
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </>
            )}

            {/* Condition badge overlay */}
            <div className="absolute bottom-4 left-4">
              <span className="bg-blue-600 text-white rounded-full px-3 py-1 text-xs font-semibold shadow-xs">
                {CarConditionLabel[car.condition] || car.condition} Condition
              </span>
            </div>

            {/* Image Counter Badge */}
            <div className="absolute bottom-4 right-4 bg-slate-900/75 backdrop-blur-xs text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-md">
              {activeImgIndex + 1} / {carImages.length}
            </div>
          </div>

          <div className="p-6 flex flex-col gap-6">
            {/* Core identity header */}
            <div>
              <div className="text-sm font-semibold text-slate-400 mb-1.5 leading-none uppercase tracking-widest">
                {car.year} USED CAR CATALOG
              </div>
              <h2 className="font-display font-semibold text-2xl text-slate-900 mb-1 leading-snug">
                {car.make} {car.model}
              </h2>
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold text-2xl text-blue-600">
                  {formattedPrice}
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  | {formattedMileage} km
                </span>
              </div>
            </div>

            {/* Structured Specifications Grid */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-400 font-medium">Body Type</span>
                <span className="font-semibold text-gray-800">
                  {CarBodyTypeLabel[car.bodyType] || car.bodyType}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-400 font-medium">Fuel Type</span>
                <span className="font-semibold text-gray-800">
                  {CarFuelTypeLabel[car.fuelType] || car.fuelType}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-400 font-medium">Transmission</span>
                <span className="font-semibold text-gray-800">
                  {CarTransmissionLabel[car.transmission] || car.transmission}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-400 font-medium">Drivetrain</span>
                <span className="font-semibold text-gray-800">
                  {car.drivetrain}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 col-span-2 border-t border-gray-100 pt-2 mt-1">
                <span className="text-gray-400 font-medium font-sans">
                  Engine Powertrain
                </span>
                <span className="font-bold text-gray-800 text-xs">
                  {car.engine}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 col-span-2 border-t border-gray-100 pt-2 mt-1">
                <span className="text-gray-400 font-medium font-sans">
                  Colors
                </span>
                <span className="font-medium text-gray-800">
                  {car.exteriorColor} over {car.interiorColor}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-500">
                Seller Remarks
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed font-sans font-normal border-l-2 border-gray-150 pl-3">
                {car.description}
              </p>
            </div>

            {/* Highlights list */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-500 mb-3.5">
                Features
              </h4>
              <div className="flex flex-wrap gap-2">{car.features}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Action & Contacts (Scrollable on desktop) */}
        <div className="w-full md:w-1/2 flex flex-col overflow-y-auto bg-slate-50 p-6 md:p-8">
          <div className="flex flex-col gap-6">
            {/* Listing Status Control (Admin-Only action item integrated perfectly) */}
            <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-xs space-y-4 font-sans">
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600 border border-blue-100">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                  Listing Status Control
                </h4>
              </div>

              <p className="text-xs text-zinc-500 leading-relaxed">
                Update the active commercial stage. Shifting status
                automatically updates analytical counts across metrics
                dashboards.
              </p>

              <div className="space-y-2 pt-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider block">
                  Commercial Status
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onUpdateStatus(car.id!, CarStatus.Available)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition cursor-pointer ${
                      car.status! === CarStatus.Available
                        ? "bg-blue-50 border-blue-200 text-blue-700 font-semibold"
                        : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
                    }`}
                    id="status_btn_available">
                    <span
                      className={`w-1.5 h-1.5 rounded-full mb-1 ${car.status! === CarStatus.Available ? "bg-blue-600" : "bg-zinc-400"}`}></span>
                <span className="text-[10px] tracking-tight">
                  {CarStatusLabel[CarStatus.Available]}
                </span>
                  </button>

                  <button
                    onClick={() => onUpdateStatus(car.id!, CarStatus.Sold)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition cursor-pointer ${
                      car.status! === CarStatus.Sold
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold"
                        : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-emerald-700 hover:bg-emerald-50/55"
                    }`}
                    id="status_btn_sold">
                    <span
                      className={`w-1.5 h-1.5 rounded-full mb-1 ${car.status! === CarStatus.Sold ? "bg-emerald-600" : "bg-zinc-400"}`}></span>
                <span className="text-[10px] tracking-tight">
                  {CarStatusLabel[CarStatus.Sold]}
                </span>
                  </button>

                  <button
                    onClick={() => onUpdateStatus(car.id!, CarStatus.Archived)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition cursor-pointer ${
                      car.status! === CarStatus.Archived
                        ? "bg-amber-50 border-amber-200 text-amber-700 font-semibold"
                        : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-amber-700 hover:bg-amber-50/55"
                    }`}
                    id="status_btn_archived">
                    <span
                      className={`w-1.5 h-1.5 rounded-full mb-1 ${car.status! === CarStatus.Archived ? "bg-amber-600" : "bg-zinc-400"}`}></span>
                    <span className="text-[10px] tracking-tight">{CarStatusLabel[CarStatus.Archived]}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Contact buttons block */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col gap-4">
              <h4 className="font-display font-semibold text-sm text-slate-900 leading-none">
                Dealer contact info
              </h4>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-semibold text-sm text-slate-800 leading-tight">
                    {car.seller?.name}
                  </h5>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {car.seller?.location}
                  </div>
                </div>
              </div>

              {/* Reveal Phone and Email */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() =>
                    setRevealContact(
                      revealContact === "phone" ? "none" : "phone",
                    )
                  }
                  className="flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-blue-600 font-semibold cursor-pointer transition-colors focus:outline-none">
                  <Phone className="h-4 w-4 mb-1 text-blue-600" />
                  <span className="text-[11px] leading-tight text-slate-600 font-normal">
                    Call agent
                   </span>
                   <span className="text-xs font-bold leading-tight select-all text-slate-800">
                     {revealContact === "phone"
                       ? car.seller?.phone
                       : "Click to view"}
                   </span>
                 </button>

                 <button
                   type="button"
                   onClick={() =>
                     setRevealContact(
                       revealContact === "email" ? "none" : "email",
                     )
                   }
                   className="flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-blue-600 font-semibold cursor-pointer transition-colors focus:outline-none">
                   <Mail className="h-4 w-4 mb-1 text-blue-600" />
                   <span className="text-[11px] leading-tight text-slate-600 font-normal">
                     Email agent
                   </span>
                   <span className="text-xs font-bold leading-tight select-all text-slate-800">
                     {revealContact === "email"
                       ? car.seller?.email.split("@")[0] + "..."
                       : "Click to view"}
                  </span>
                </button>
              </div>

              {revealContact === "email" && (
                <div className="text-center text-xs text-blue-800 bg-blue-50 border border-blue-100 p-2.5 rounded-2xl font-mono select-all animate-in fade-in duration-200">
                  {car.seller?.email}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
