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
      className="fixed inset-0 z-50 overflow-y-auto bg-bg-dark/45 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Background click to close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-bg-surface w-full max-w-4xl rounded-2xl shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] animate-in fade-in zoom-in duration-200 z-10">
        {/* Close Button Pin */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-bg-surface/90 hover:bg-bg-surface text-text-secondary-hover hover:text-text-strong p-2 rounded-full shadow-md focus:outline-none transition-colors cursor-pointer"
          title="Close details">
          <X className="h-5 w-5" />
        </button>

        {/* Left Column: Visuals and Essential Specs (Scrollable on desktop) */}
        <div className="w-full md:w-1/2 flex flex-col md:overflow-y-auto border-r border-border">
          <div className="relative aspect-video md:aspect-4/3 bg-bg-dark shrink-0 group overflow-hidden">
            {/* Main Active Image */}
            <img
              src={carImages[activeImgIndex]}
              alt={`${car.year} ${car.make} ${car.model} - View ${activeImgIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-350"
              referrerPolicy="no-referrer"
            />

            {/* Gradient Mask for controls readability */}
            <div className="absolute inset-0 bg-linear-to-t from-bg-dark/40 via-transparent to-bg-dark/20 pointer-events-none" />

            {/* Left and Right navigation chevrons */}
            {carImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-bg-dark/60 hover:bg-bg-dark/90 hover:scale-105 active:scale-95 text-text-on-brand p-2 rounded-full shadow-md transition-all focus:outline-none cursor-pointer"
                  title="Previous image">
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-bg-dark/60 hover:bg-bg-dark/90 hover:scale-105 active:scale-95 text-text-on-brand p-2 rounded-full shadow-md transition-all focus:outline-none cursor-pointer"
                  title="Next image">
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </>
            )}

            {/* Condition badge overlay */}
            <div className="absolute bottom-4 left-4">
              <span className="bg-brand text-text-on-brand rounded-full px-3 py-1 text-xs font-semibold shadow-xs">
                {CarConditionLabel[car.condition] || car.condition} Condition
              </span>
            </div>

            {/* Image Counter Badge */}
            <div className="absolute bottom-4 right-4 bg-bg-dark/75 backdrop-blur-xs text-text-on-brand text-[10px] font-bold font-mono px-2 py-0.5 rounded-md">
              {activeImgIndex + 1} / {carImages.length}
            </div>
          </div>

          <div className="p-6 flex flex-col gap-6">
            {/* Core identity header */}
            <div>
              <div className="text-sm font-semibold text-text-faint mb-1.5 leading-none uppercase tracking-widest">
                {car.year} USED CAR CATALOG
              </div>
              <h2 className="font-display font-semibold text-2xl text-text-strong mb-1 leading-snug">
                {car.make} {car.model}
              </h2>
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold text-2xl text-brand">
                  {formattedPrice}
                </span>
                <span className="text-sm text-text-muted font-medium">
                  | {formattedMileage} km
                </span>
              </div>
            </div>

            {/* Structured Specifications Grid */}
            <div className="grid grid-cols-2 gap-4 bg-bg-raised border border-border/60 rounded-2xl p-4 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-text-faint font-medium">Body Type</span>
                <span className="font-semibold text-text-body">
                  {CarBodyTypeLabel[car.bodyType] || car.bodyType}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-text-faint font-medium">Fuel Type</span>
                <span className="font-semibold text-text-body">
                  {CarFuelTypeLabel[car.fuelType] || car.fuelType}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-text-faint font-medium">Transmission</span>
                <span className="font-semibold text-text-body">
                  {CarTransmissionLabel[car.transmission] || car.transmission}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-text-faint font-medium">Drivetrain</span>
                <span className="font-semibold text-text-body">
                  {car.drivetrain}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 col-span-2 border-t border-border pt-2 mt-1">
                <span className="text-text-faint font-medium font-sans">
                  Engine Powertrain
                </span>
                <span className="font-bold text-text-body text-xs">
                  {car.engine}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 col-span-2 border-t border-border pt-2 mt-1">
                <span className="text-text-faint font-medium font-sans">
                  Colors
                </span>
                <span className="font-medium text-text-body">
                  {car.exteriorColor} over {car.interiorColor}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-text-muted">
                Seller Remarks
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed font-sans font-normal border-l-2 border-border pl-3">
                {car.description}
              </p>
            </div>

            {/* Highlights list */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-text-muted mb-3.5">
                Features
              </h4>
              <div className="flex flex-wrap gap-2">{car.features}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Action & Contacts (Scrollable on desktop) */}
        <div className="w-full md:w-1/2 flex flex-col md:overflow-y-auto bg-bg-raised p-6 md:p-8">
          <div className="flex flex-col gap-6">
            {/* Listing Status Control (Admin-Only action item integrated perfectly) */}
            <div className="bg-bg-surface border border-border p-5 rounded-2xl shadow-xs space-y-4 font-sans">
              <div className="flex items-center gap-2">
                <div className="bg-brand/10 p-1.5 rounded-lg text-brand border border-brand/15">
                  <ShieldCheck className="w-4 h-4 text-brand" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-body font-mono">
                  Listing Status Control
                </h4>
              </div>

              <p className="text-xs text-text-muted leading-relaxed">
                Update the active commercial stage. Shifting status
                automatically updates analytical counts across metrics
                dashboards.
              </p>

              <div className="space-y-2 pt-1">
                <span className="text-[10px] uppercase font-bold text-text-faint font-mono tracking-wider block">
                  Commercial Status
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onUpdateStatus(car.id!, CarStatus.Available)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition cursor-pointer ${
                      car.status! === CarStatus.Available
                        ? "bg-brand/10 border-brand/20 text-brand-dark font-semibold"
                        : "bg-bg-raised border-border text-text-muted hover:text-text-body hover:bg-bg-muted"
                    }`}
                    id="status_btn_available">
                    <span
                      className={`w-1.5 h-1.5 rounded-full mb-1 ${car.status! === CarStatus.Available ? "bg-brand" : "bg-zinc-400"}`}></span>
                <span className="text-[10px] tracking-tight">
                  {CarStatusLabel[CarStatus.Available]}
                </span>
                  </button>

                  <button
                    onClick={() => onUpdateStatus(car.id!, CarStatus.Sold)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition cursor-pointer ${
                      car.status! === CarStatus.Sold
                        ? "bg-success-bg border-success-border text-success-text font-semibold"
                        : "bg-bg-raised border-border text-text-muted hover:text-success-text hover:bg-success-bg/55"
                    }`}
                    id="status_btn_sold">
                    <span
                      className={`w-1.5 h-1.5 rounded-full mb-1 ${car.status! === CarStatus.Sold ? "bg-success" : "bg-zinc-400"}`}></span>
                <span className="text-[10px] tracking-tight">
                  {CarStatusLabel[CarStatus.Sold]}
                </span>
                  </button>

                  <button
                    onClick={() => onUpdateStatus(car.id!, CarStatus.Archived)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition cursor-pointer ${
                      car.status! === CarStatus.Archived
                        ? "bg-warning-bg border-amber-200 text-amber-700 font-semibold"
                        : "bg-bg-raised border-border text-text-muted hover:text-amber-700 hover:bg-warning-bg/55"
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
            <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col gap-4">
              <h4 className="font-display font-semibold text-sm text-text-strong leading-none">
                Dealer contact info
              </h4>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center text-brand shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-semibold text-sm text-text-body leading-tight">
                    {car.seller?.name}
                  </h5>
                  <div className="flex items-center gap-1 text-[11px] text-text-muted font-medium mt-1">
                    <MapPin className="h-3.5 w-3.5 text-text-faint" />
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
                  className="flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl border border-border bg-bg-surface hover:bg-bg-raised text-brand font-semibold cursor-pointer transition-colors focus:outline-none">
                  <Phone className="h-4 w-4 mb-1 text-brand" />
                  <span className="text-[11px] leading-tight text-text-secondary font-normal">
                    Call agent
                   </span>
                   <span className="text-xs font-bold leading-tight select-all text-text-body">
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
                  className="flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl border border-border bg-bg-surface hover:bg-bg-raised text-brand font-semibold cursor-pointer transition-colors focus:outline-none">
                  <Mail className="h-4 w-4 mb-1 text-brand" />
                   <span className="text-[11px] leading-tight text-text-secondary font-normal">
                     Email agent
                   </span>
                   <span className="text-xs font-bold leading-tight select-all text-text-body">
                     {revealContact === "email"
                       ? car.seller?.email.split("@")[0] + "..."
                       : "Click to view"}
                   </span>
                 </button>
              </div>

              {revealContact === "email" && (
                <div className="text-center text-xs text-brand-dark bg-brand/10 border border-brand/15 p-2.5 rounded-2xl font-mono select-all animate-in fade-in duration-200">
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
