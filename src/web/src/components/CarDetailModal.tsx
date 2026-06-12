/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { sendEmail } from "../apiClient";
import { CarBodyTypeLabel, CarConditionLabel, CarFuelTypeLabel, CarTransmissionLabel, Spinner, ErrorState } from "@repo/shared";
import { Car } from "../types";

interface CarDetailModalProps {
  car: Car | null;
  onClose: () => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  car,
  onClose,
}) => {
  if (!car) return null;

  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [interestType, setInterestType] = useState("questions"); // 'questions' | 'test-drive' | 'finance'
  const [consentGiven, setConsentGiven] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [messageTouched, setMessageTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [revealContact, setRevealContact] = useState<
    "none" | "phone" | "email"
  >("none");
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = userEmail === "" || emailRegex.test(userEmail);
  const isMessageValid = message.trim().length > 0;

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

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail || !isEmailValid || !isMessageValid || !car) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await sendEmail(car, userName, userEmail, message, interestType, consentGiven);
      setSubmitSuccess(true);
      // Reset form fields after delay
      setTimeout(() => {
        setMessage("");
        setUserName("");
        setUserPhone("");
        setUserEmail("");
        setConsentGiven(false);
        setEmailTouched(false);
        setMessageTouched(false);
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      setSubmitError("Failed to send inquiry. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-bg-dark/45 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Background click to close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-bg-surface w-full max-w-4xl rounded-2xl shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] animate-in fade-in zoom-in duration-200">
        {/* Close Button Pin */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-bg-surface/90 hover:bg-bg-surface text-text-secondary-hover hover:text-text-strong p-2 rounded-full shadow-md focus:outline-none transition-colors cursor-pointer"
          title="Close details">
          <X className="h-5 w-5" />
        </button>

        {/* Left Column: Visuals and Essential Specs (Scrollable on desktop) */}
        <div className="w-full md:w-1/2 flex flex-col md:overflow-y-auto border-r border-bg-muted">
          <div className="relative aspect-video md:aspect-4/3 bg-bg-dark shrink-0 group overflow-hidden">
            {/* Main Active Image */}
            <img
              src={carImages[activeImgIndex]}
              alt={`${car.year} ${car.make} ${car.model} - View ${activeImgIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-350"
              referrerPolicy="no-referrer"
            />

            {/* Gradient Mask for controls readability */}
            <div className="absolute inset-0 bg-linear-to-t from-text-strong/40 via-transparent to-text-strong/20 pointer-events-none" />

            {/* Left and Right navigation chevrons */}
            {carImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-bg-dark/60 hover:bg-bg-dark/90 hover:scale-105 active:scale-95 text-white p-2 rounded-full shadow-md transition-all focus:outline-none cursor-pointer"
                  title="Previous image">
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-bg-dark/60 hover:bg-bg-dark/90 hover:scale-105 active:scale-95 text-white p-2 rounded-full shadow-md transition-all focus:outline-none cursor-pointer"
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
            <div className="absolute bottom-4 right-4 bg-bg-dark/75 backdrop-blur-xs text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-md">
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
              <div className="flex flex-col gap-0.5 col-span-2 border-t border-bg-muted pt-2 mt-1">
                <span className="text-text-faint font-medium font-sans">
                  Engine Powertrain
                </span>
                <span className="font-bold text-text-body text-xs">
                  {car.engine}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 col-span-2 border-t border-bg-muted pt-2 mt-1">
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
              <p className="text-sm text-text-secondary leading-relaxed font-sans font-normal border-l-2 border-bg-muted pl-3">
                {car.description}
              </p>
            </div>

            {/* Highlights list */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-text-muted mb-3.5">
                Premium Equipment & Highlights
              </h4>
              <p className="text-xs font-medium text-text-secondary-hover bg-bg-raised border border-border/60 p-3 rounded-lg">
                {car.features}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Action & Contacts (Scrollable on desktop) */}
        <div className="w-full md:w-1/2 flex flex-col md:overflow-y-auto bg-bg-raised p-6 md:p-8">
          <div className="flex flex-col gap-6">
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
                    {car.seller.name}
                  </h5>
                  <div className="flex items-center gap-1 text-[11px] text-text-muted font-medium mt-1">
                    <MapPin className="h-3.5 w-3.5 text-text-faint" />
                    {car.seller.location}
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
                  <Phone className="h-4 w-4 mb-1" />
                  <span className="text-[11px] leading-tight text-text-secondary font-normal">
                    Call agent
                  </span>
                  <span className="text-xs font-bold leading-tight select-all">
                    {revealContact === "phone"
                      ? car.seller.phone
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
                  <Mail className="h-4 w-4 mb-1" />
                  <span className="text-[11px] leading-tight text-text-secondary font-normal">
                    Email agent
                  </span>
                  <span className="text-xs font-bold leading-tight select-all">
                    {revealContact === "email"
                      ? car.seller.email.split("@")[0] + "..."
                      : "Click to view"}
                  </span>
                </button>
              </div>

              {revealContact === "email" && (
                <div className="text-center text-xs text-brand-dark bg-brand/10 border border-brand/15 p-2.5 rounded-2xl font-mono select-all animate-in fade-in duration-200">
                  {car.seller.email}
                </div>
              )}
            </div>

            {/* Detailed Interest Form */}
            <div className="bg-bg-surface border border-border rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.01)] flex flex-col gap-4">
              <div className="border-b border-bg-muted pb-3 leading-none flex items-center justify-between">
                <div>
                  <h4 className="font-display font-semibold text-sm text-text-strong leading-none">
                    Send Inquiry Form
                  </h4>
                  <span className="text-[11px] text-text-faint mt-1 block">
                    Inquire directly to agent
                  </span>
                </div>
                <Sparkles className="h-4 w-4 text-brand" />
              </div>

              <form
                onSubmit={handleSubmitMessage}
                className="flex flex-col gap-3.5">
                {/* Interest Selector tabs */}
                <div className="grid grid-cols-3 gap-1 bg-bg-raised p-1.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setInterestType("questions")}
                    className={`text-[10px] py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                      interestType === "questions"
                        ? "bg-bg-surface text-text-strong shadow-xs"
                        : "text-text-muted hover:text-text-body"
                    }`}>
                    Questions
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterestType("test-drive")}
                    className={`text-[10px] py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                      interestType === "test-drive"
                        ? "bg-bg-surface text-text-strong shadow-xs"
                        : "text-text-muted hover:text-text-body"
                    }`}>
                    Test Drive
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterestType("finance")}
                    className={`text-[10px] py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                      interestType === "finance"
                        ? "bg-bg-surface text-text-strong shadow-xs"
                        : "text-text-muted hover:text-text-body"
                    }`}>
                    Finance Option
                  </button>
                </div>

                {/* Sender Details */}
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-text-faint uppercase tracking-wider block mb-1">
                      Your Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. John Doe"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-bg-surface border border-border outline-none rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all text-text-body"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-text-faint uppercase tracking-wider block mb-1">
                        Email Address *
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="john@example.com"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        onBlur={() => setEmailTouched(true)}
                        className={`w-full bg-bg-surface border outline-none rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-brand/10 transition-all text-text-body ${
                          emailTouched && !isEmailValid ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-brand'
                        }`}
                      />
                      {emailTouched && !isEmailValid && (
                        <p className="text-[10px] text-red-500 mt-1">Please enter a valid email address</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-faint uppercase tracking-wider block mb-1">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="(555) 000-0000"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="w-full bg-bg-surface border border-border outline-none rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all text-text-body"
                      />
                    </div>
                  </div>
                </div>

                {/* Message TextArea */}
                <div>
                  <label className="text-[10px] font-bold text-text-faint uppercase tracking-wider block mb-1">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder={
                      interestType === "test-drive"
                        ? "I would love to arrange a test drive for this vehicle. What is your upcoming schedule availability?"
                        : interestType === "finance"
                          ? "I am interested in obtaining finance pre-approval configurations for this vehicle. Let me know the typical conditions."
                          : `Hi, I am interested in this 2022 ${car.make} ${car.model}. Is the price negotiable?`
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onBlur={() => setMessageTouched(true)}
                    className={`w-full bg-bg-surface border outline-none rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-brand/10 transition-all text-text-body ${
                      messageTouched && !isMessageValid ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-brand'
                    }`}
                  />
                  {messageTouched && !isMessageValid && (
                    <p className="text-[10px] text-red-500 mt-1">Please enter a message</p>
                  )}
                </div>

                {/* Consent checkbox */}
                <div className="flex items-start gap-2">
                  <input
                    id="consent"
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-hover text-brand focus:ring-brand cursor-pointer"
                  />
                  <label htmlFor="consent" className="text-[11px] text-text-muted leading-relaxed cursor-pointer select-none">
                    I consent to my information being shared with the seller for inquiry purposes in accordance with the{' '}
                    <Link to="/privacy" className="text-brand hover:text-brand-dark underline font-medium">
                      Privacy Policy
                    </Link>.
                  </label>
                </div>

                {submitError && (
                  <ErrorState message={submitError} />
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !userName || !userEmail || !isEmailValid || !isMessageValid || !consentGiven}
                  className="w-full bg-brand hover:bg-brand-dark text-text-on-brand font-semibold py-2.5 rounded-full text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2 focus:outline-none">
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="inline-flex" />
                      <span>Sending Inquiry...</span>
                    </>
                  ) : submitSuccess ? (
                    "Inquiry Sent Successfully!"
                  ) : interestType === "test-drive" ? (
                    "Schedule Test Drive"
                  ) : (
                    "Send Message to Agent"
                  )}
                </button>

                {/* Visual Feedback Confirmation */}
                {submitSuccess && (
                  <div className="bg-success-bg border border-success-border p-3 rounded-xl text-xs text-success-text animate-in fade-in duration-200">
                    <p className="font-semibold mb-0.5">
                      Success! Your inquiry has been sent.
                    </p>
                    <p className="text-success-text">
                      The selling agent ({car.seller.name}) typically responds
                      within 2 hours. Keep an eye on your email inbox!
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* Quick tips box */}
            <div className="bg-warning-bg/50 border border-warning-bg rounded-xl p-4 text-xs text-warning flex gap-2">
              <ClipboardList className="h-5 w-5 text-warning shrink-0" />
              <div>
                <span className="font-bold">Advice for Buyers:</span> We always
                recommend getting a third-party pre-purchase inspection prior to
                buying any pre-owned vehicle, as well as verifying the
                registration documents in person.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
