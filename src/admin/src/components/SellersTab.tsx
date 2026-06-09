/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CheckCircle,
  Edit,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@repo/shared";
import { SellerContact } from "../types";
import { useSellerStore } from "../stores/sellerStore";

interface SellersTabProps {
  isAdmin: boolean;
}

export default function SellersTab({
  isAdmin,
}: SellersTabProps) {
  const sellers = useSellerStore((s) => s.sellers);
  const isLoading = useSellerStore((s) => s.isLoading);
  const error = useSellerStore((s) => s.error);
  const fetchSellers = useSellerStore((s) => s.fetchSellers);
  const addSeller = useSellerStore((s) => s.addSeller);
  const updateSeller = useSellerStore((s) => s.updateSeller);
  const deleteSeller = useSellerStore((s) => s.deleteSeller);
  const toggleStatus = useSellerStore((s) => s.toggleStatus);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // New Seller Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [formError, setFormError] = useState("");
  const [editingSeller, setEditingSeller] = useState<SellerContact | null>(
    null,
  );

  // Top metric aggregate computations
  const totalSellers = sellers.length;
  const activeSellersCount = sellers.filter(
    (s) => s.status !== "inactive",
  ).length;
  const inactiveSellersCount = sellers.filter(
    (s) => s.status === "inactive",
  ).length;

  // Filtered sellers
  const filteredSellers = useMemo(() => {
    return sellers.filter((seller) => {
      const q = searchQuery.toLowerCase();
      return (
        seller.name.toLowerCase().includes(q) ||
        seller.email.toLowerCase().includes(q) ||
        seller.location.toLowerCase().includes(q)
      );
    });
  }, [sellers, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name || !phone || !email || !location) {
      setFormError("All fields are required.");
      return;
    }

    // Check duplicate name (exclude current seller when editing)
    if (
      sellers.some(
        (s) =>
          s.id !== editingSeller?.id &&
          s.name.trim().toLowerCase() === name.trim().toLowerCase(),
      )
    ) {
      setFormError("A seller with this name already exists.");
      return;
    }

    const sellerData: SellerContact = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      location: location.trim(),
      status: editingSeller?.status || "active",
    };

    if (editingSeller) {
      updateSeller({ ...sellerData, id: editingSeller.id });
    } else {
      addSeller(sellerData);
    }

    // Reset Form
    setName("");
    setPhone("");
    setEmail("");
    setLocation("");
    setEditingSeller(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans">
      {/* Upper Module Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/60 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 font-sans">
            Registered Direct Sellers
          </h2>
          <p className="text-xs text-zinc-500 font-mono tracking-tight mt-1">
            Browse corporate account representatives, assignable client owners,
            and broker profiles.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setEditingSeller(null);
              setName("");
              setPhone("");
              setEmail("");
              setLocation("");
              setFormError("");
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition focus:outline-none self-start md:self-auto"
            id="btn_add_seller_trigger">
            <Plus className="w-4 h-4" />
            <span>Register New Agent</span>
          </button>
        )}
      </div>

      {/* KPI Stats Widgets Banner */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-zinc-200/80 p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
              <div className="space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-12" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider block">
                Total Active Agents
              </span>
              <span className="text-2xl font-bold text-zinc-900 font-sans">
                {totalSellers}
              </span>
            </div>
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl border border-blue-100">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider block">
                Active Status
              </span>
              <span className="text-2xl font-bold text-emerald-600 font-sans">
                {activeSellersCount}
              </span>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl border border-emerald-100">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider block">
                Inactive Status
              </span>
              <span className="text-2xl font-bold text-rose-600 font-sans">
                {inactiveSellersCount}
              </span>
            </div>
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl border border-rose-100">
              <XCircle className="w-5 h-5 text-rose-600" />
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left is Search & List, Right is Add Form if Open */}
      <div className="flex flex-col gap-6">
        {/* Search Bar & Stats header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-zinc-200/80 p-4 rounded-xl shadow-xs">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by agent name, email, or office territory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-305 font-sans transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-[11px] text-zinc-500 font-mono tracking-tight shrink-0">
            Found{" "}
            <span className="font-bold text-zinc-800">
              {filteredSellers.length}
            </span>{" "}
            corresponding agent accounts
          </div>
        </div>

        {/* Sellers Cards Catalog Grid */}
        {isLoading && sellers.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-zinc-205/90 rounded-2xl overflow-hidden">
                <div className="p-5 space-y-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="space-y-2 border-t border-dashed border-zinc-150 pt-3">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <div className="bg-zinc-50 px-5 py-3 border-t border-zinc-200/70">
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center max-w-lg mx-auto w-full my-4">
            <Users className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-zinc-850">
              No Agents Match Your Search
            </h4>
            <p className="text-xs text-zinc-500 mt-1">
              Refine your text parameters or try looking up another agent.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSellers.map((seller, index) => {
              return (
                <div
                  key={index}
                  className="bg-white border border-zinc-205/90 hover:border-zinc-300 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                  id={`seller_card_${index}`}>
                  <div className="p-5 space-y-4">
                    {/* Seller Visual Identification - Simple, clean, no image or placeholder circle */}
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 font-sans leading-tight">
                        {seller.name}
                      </h4>
                      <span className="flex items-center gap-1 text-[10px] text-zinc-450 font-mono mt-1.5 leading-none">
                        <MapPin className="h-3 w-3 text-zinc-400" />
                        {seller.location}
                      </span>
                    </div>

                    {/* Contact details */}
                    <div className="space-y-2 border-t border-dashed border-zinc-150 pt-3 text-xs leading-5">
                      <div className="flex items-center gap-2 text-zinc-650">
                        <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="font-mono select-all text-[11px]">
                          {seller.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-650">
                        <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="select-all text-[11px] line-clamp-1">
                          {seller.email}
                        </span>
                      </div>
                    </div>

                    {/* Managed Stock Count */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                          Managed Stock ({seller.stock ?? 0})
                        </span>
                        <span className="text-[10px] text-zinc-400 font-semibold font-mono">
                          Live Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggleable Seller Status "Active" or "Inactive" */}
                  <div className="bg-zinc-50 px-5 py-3 border-t border-zinc-200/70 text-[10px] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-zinc-400 font-semibold uppercase tracking-wider">
                        Seller Status
                      </span>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => {
                              setName(seller.name);
                              setPhone(seller.phone);
                              setEmail(seller.email);
                              setLocation(seller.location);
                              setEditingSeller(seller);
                              setFormError("");
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-md text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                            title="Edit seller"
                            id={`btn_edit_seller_${index}`}>
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteSeller(seller.id)}
                            className="p-1.5 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete seller"
                            id={`btn_delete_seller_${index}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => toggleStatus(seller.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase transition cursor-pointer ${
                        seller.status === "inactive"
                          ? "bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100"
                          : "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                      }`}
                      id={`btn_toggle_status_${index}`}
                      title="Click to toggle status">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${seller.status === "inactive" ? "bg-rose-500" : "bg-emerald-500"}`}></span>
                      {seller.status || "Active"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-over Form Container Drawer (Floating on right side) */}
      {isFormOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          {/* Background overlay click */}
          <div
            className="absolute inset-0 cursor-default"
            onClick={() => {
              setEditingSeller(null);
              setIsFormOpen(false);
            }}
          />

          {/* Form Content Side Drawer */}
          <div className="relative w-full max-w-md bg-white min-h-screen p-6 md:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-250 z-10">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-150">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-50 p-1.5 rounded text-blue-600 border border-blue-100">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-950 font-sans">
                      {editingSeller ? "Edit Agent Profile" : "Register New Agent"}
                    </h3>
                    <span className="text-[10px] text-zinc-450 block font-mono">
                      {editingSeller
                        ? "Modify representative profile fields"
                        : "Create stateful representative profile"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingSeller(null);
                    setIsFormOpen(false);
                  }}
                  className="p-1 px-2.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700 transition font-bold"
                  title="Close form">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form errors */}
              {formError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 font-medium">
                  {formError}
                </div>
              )}

              {/* Inputs */}
              <form
                onSubmit={handleSubmit}
                className="space-y-4 font-sans text-xs">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">
                    Agent Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rachel Adams"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-350 rounded px-3 py-2 text-xs text-zinc-805 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-200"
                    id="input_seller_name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">
                    Cell Phone Mobile Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. (415) 555-0190"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-350 rounded px-3 py-2 text-xs text-zinc-805 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-200 font-mono"
                    id="input_seller_phone"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">
                    Professional Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rachel.a@autodrive.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-350 rounded px-3 py-2 text-xs text-zinc-805 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-200 font-mono"
                    id="input_seller_email"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 block">
                    Territory Location / Office *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Los Angeles, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-350 rounded px-3 py-2 text-xs text-zinc-805 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-200"
                    id="input_seller_location"
                  />
                </div>

                <div className="pt-4 border-t border-zinc-150 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSeller(null);
                      setIsFormOpen(false);
                    }}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-205/50 rounded-lg text-xs text-zinc-700 font-semibold cursor-pointer transition">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition">
                    {editingSeller ? "Save Changes" : "Register Agent"}
                  </button>
                </div>
              </form>
            </div>

            <div className="text-[10px] text-zinc-400 text-center font-mono pt-6 border-t border-zinc-100">
              Registered agents are immediately assignable using the car
              inventory form.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
