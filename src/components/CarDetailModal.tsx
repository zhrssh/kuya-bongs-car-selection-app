/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Car } from '../types';
import {
  X,
  Phone,
  Mail,
  Calendar,
  Layers,
  Fuel,
  Activity,
  History,
  ShieldCheck,
  User,
  Star,
  MapPin,
  ClipboardList,
  Sparkles,
  CheckCircle,
  MessageSquare
} from 'lucide-react';

interface CarDetailModalProps {
  car: Car | null;
  onClose: () => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({ car, onClose }) => {
  if (!car) return null;

  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [interestType, setInterestType] = useState('questions'); // 'questions' | 'test-drive' | 'finance'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [revealContact, setRevealContact] = useState<'none' | 'phone' | 'email'>('none');

  // Format currency
  const formattedPrice = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(car.price);

  const formattedMileage = new Intl.NumberFormat('en-US').format(car.mileage);

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail) return;

    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      // Reset form fields after delay
      setTimeout(() => {
        setMessage('');
        setUserName('');
        setUserPhone('');
        setUserEmail('');
        setSubmitSuccess(false);
      }, 5000);
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/45 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-10"
    >
      {/* Background click to close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] animate-in fade-in zoom-in duration-200">
        
        {/* Close Button Pin */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 p-2 rounded-full shadow-md focus:outline-none transition-colors cursor-pointer"
          title="Close details"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Column: Visuals and Essential Specs (Scrollable on desktop) */}
        <div className="w-full md:w-1/2 flex flex-col overflow-y-auto border-r border-gray-150">
          <div className="relative aspect-video md:aspect-4/3 bg-gray-100 flex-shrink-0">
            <img
              src={car.imageUrl}
              alt={`${car.year} ${car.make} ${car.model}`}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-4 left-4">
              <span className="bg-blue-600 text-white rounded-full px-3 py-1 text-xs font-semibold shadow-xs">
                {car.condition} Condition
              </span>
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
                <span className="font-semibold text-gray-800">{car.bodyType}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-400 font-medium">Fuel Type</span>
                <span className="font-semibold text-gray-800">{car.fuelType}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-400 font-medium">Transmission</span>
                <span className="font-semibold text-gray-800">{car.transmission}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-400 font-medium">Drivetrain</span>
                <span className="font-semibold text-gray-800">{car.drivetrain}</span>
              </div>
              <div className="flex flex-col gap-0.5 col-span-2 border-t border-gray-100 pt-2 mt-1">
                <span className="text-gray-400 font-medium font-sans">Engine Powertrain</span>
                <span className="font-bold text-gray-800 text-xs">{car.engine}</span>
              </div>
              <div className="flex flex-col gap-0.5 col-span-2 border-t border-gray-100 pt-2 mt-1">
                <span className="text-gray-400 font-medium font-sans">Colors</span>
                <span className="font-medium text-gray-800">
                  {car.exteriorColor} over {car.interiorColor}
                </span>
              </div>
            </div>

            {/* Vehicle History Check */}
            <div className="border border-emerald-100 bg-emerald-50/30 rounded-xl p-4 flex flex-col gap-3">
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider leading-none">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                Verified Car History
              </h4>
              <ul className="text-xs text-emerald-900 grid grid-cols-2 gap-2 mt-1">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <strong>{car.history.owners}</strong> {car.history.owners === 1 ? 'Owner' : 'Owners'}
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <strong>{car.history.accidents}</strong> accidents reported
                </li>
                <li className="col-span-2 flex items-start gap-1.5 mt-1 border-t border-emerald-100 pt-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Service Status: </span>
                  <span className="font-normal italic text-slate-700">{car.history.serviceHistory}</span>
                </li>
              </ul>
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
                Premium Equipment & Highlights
              </h4>
              <div className="flex flex-wrap gap-2">
                {car.features.map((feat) => (
                  <span
                    key={feat}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/60 text-xs font-medium text-slate-700"
                  >
                    <CheckCircle className="h-3 w-3 text-blue-500" />
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Action & Contacts (Scrollable on desktop) */}
        <div className="w-full md:w-1/2 flex flex-col overflow-y-auto bg-slate-50 p-6 md:p-8">
          <div className="flex flex-col gap-6">
            
            {/* Quick Contact buttons block */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col gap-4">
              <h4 className="font-display font-semibold text-sm text-slate-900 leading-none">
                Dealer Contact Info
              </h4>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-semibold text-sm text-slate-800 leading-tight">
                    {car.seller.name}
                  </h5>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {car.seller.location}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-1">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {car.seller.rating} / 5.0 Rating
                  </div>
                </div>
              </div>

              {/* Reveal Phone and Email */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setRevealContact(revealContact === 'phone' ? 'none' : 'phone')}
                  className="flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl border border-slate-250 bg-white hover:bg-slate-50 text-blue-600 font-semibold cursor-pointer transition-colors focus:outline-none"
                >
                  <Phone className="h-4 w-4 mb-1" />
                  <span className="text-[11px] leading-tight text-slate-600 font-normal">Call Agent</span>
                  <span className="text-xs font-bold leading-tight select-all">
                    {revealContact === 'phone' ? car.seller.phone : 'Click to View'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRevealContact(revealContact === 'email' ? 'none' : 'email')}
                  className="flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl border border-slate-250 bg-white hover:bg-slate-50 text-blue-600 font-semibold cursor-pointer transition-colors focus:outline-none"
                >
                  <Mail className="h-4 w-4 mb-1" />
                  <span className="text-[11px] leading-tight text-slate-600 font-normal">Email Agent</span>
                  <span className="text-xs font-bold leading-tight select-all">
                    {revealContact === 'email' ? car.seller.email.split('@')[0] + '...' : 'Click to View'}
                  </span>
                </button>
              </div>

              {revealContact === 'email' && (
                <div className="text-center text-xs text-blue-800 bg-blue-50 border border-blue-100 p-2.5 rounded-2xl font-mono select-all animate-in fade-in duration-200">
                  {car.seller.email}
                </div>
              )}
            </div>

            {/* Detailed Interest Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.01)] flex flex-col gap-4">
              <div className="border-b border-slate-100 pb-3 leading-none flex items-center justify-between">
                <div>
                  <h4 className="font-display font-semibold text-sm text-slate-900 leading-none">
                    Send Inquiry Form
                  </h4>
                  <span className="text-[11px] text-slate-400 mt-1 block">Inquire directly to agent</span>
                </div>
                <Sparkles className="h-4 w-4 text-blue-500" />
              </div>

              <form onSubmit={handleSubmitMessage} className="flex flex-col gap-3.5">
                {/* Interest Selector tabs */}
                <div className="grid grid-cols-3 gap-1 bg-gray-50 p-1.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setInterestType('questions')}
                    className={`text-[10px] py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                      interestType === 'questions'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Questions
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterestType('test-drive')}
                    className={`text-[10px] py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                      interestType === 'test-drive'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Test Drive
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterestType('finance')}
                    className={`text-[10px] py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                      interestType === 'finance'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Finance Option
                  </button>
                </div>

                {/* Sender Details */}
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Your Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. John Doe"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-white border border-slate-200 outline-none rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Email Address *
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="john@example.com"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 outline-none rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="(555) 000-0000"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="w-full bg-white border border-slate-200 outline-none rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Message TextArea */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Your Message
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      interestType === 'test-drive'
                        ? 'I would love to arrange a test drive for this vehicle. What is your upcoming schedule availability?'
                        : interestType === 'finance'
                        ? 'I am interested in obtaining finance pre-approval configurations for this vehicle. Let me know the typical conditions.'
                        : `Hi, I am interested in this 2022 ${car.make} ${car.model}. Is the price negotiable?`
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-white border border-slate-200 outline-none rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !userName || !userEmail}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-full text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2 focus:outline-none"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending Inquiry...
                    </>
                  ) : submitSuccess ? (
                    'Inquiry Sent Successfully!'
                  ) : interestType === 'test-drive' ? (
                    'Schedule Test Drive'
                  ) : (
                    'Send Message to Agent'
                  )}
                </button>

                {/* Visual Feedback Confirmation */}
                {submitSuccess && (
                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-800 animate-in fade-in duration-200">
                    <p className="font-semibold mb-0.5">Success! Your inquiry has been sent.</p>
                    <p className="text-emerald-700">The selling agent ({car.seller.name}) typically responds within 2 hours. Keep an eye on your email inbox!</p>
                  </div>
                )}
              </form>
            </div>

            {/* Quick tips box */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-xs text-amber-900 flex gap-2">
              <ClipboardList className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <span className="font-bold">Advice for Buyers:</span> We always recommend getting a third-party pre-purchase inspection prior to buying any pre-owned vehicle, as well as verifying the registration documents in person.
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};
