import { create } from "zustand";
import { SellerContact } from "../types";

const API_URL = import.meta.env.VITE_FLASK_APP_API_URL;

interface SellerStore {
  sellers: SellerContact[];
  isLoading: boolean;
  error: string | null;
  fetchSellers: () => Promise<void>;
  addSeller: (seller: SellerContact) => Promise<void>;
  updateSeller: (seller: SellerContact) => Promise<void>;
  deleteSeller: (id: string) => Promise<void>;
  toggleStatus: (id: string) => Promise<void>;
}

export const useSellerStore = create<SellerStore>((set, get) => ({
  sellers: [],
  isLoading: false,
  error: null,

  fetchSellers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/sellers`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === "success") {
          set({ sellers: data.data.sellers });
        }
      }
    } catch (err) {
      console.error("Error fetching sellers:", err);
      alert("Failed to load sellers. Please try again.");
      set({ error: "Failed to load sellers. Please try again." });
    } finally {
      set({ isLoading: false });
    }
  },

  addSeller: async (newSeller) => {
    try {
      const res = await fetch(`${API_URL}/api/sellers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSeller),
        credentials: "include",
      });
      const data = await res.json();
      if (data.status === "success") {
        set((state) => ({ sellers: [data.data.seller, ...state.sellers] }));
      } else {
        alert(data.message || "Failed to add seller.");
      }
    } catch (err) {
      console.error("Error adding seller:", err);
      alert("Failed to add seller. Please try again.");
    }
  },

  updateSeller: async (updatedSeller) => {
    try {
      const res = await fetch(`${API_URL}/api/sellers/${updatedSeller.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSeller),
        credentials: "include",
      });
      const data = await res.json();
      if (data.status === "success") {
        const saved = data.data.seller;
        set((state) => ({
          sellers: state.sellers.map((s) => (s.id === saved.id ? saved : s)),
        }));
      } else {
        alert(data.message || "Failed to update seller.");
      }
    } catch (err) {
      console.error("Error updating seller:", err);
      alert("Failed to update seller. Please try again.");
    }
  },

  deleteSeller: async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/sellers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        set((state) => ({
          sellers: state.sellers.filter((s) => s.id !== id),
        }));
      } else {
        alert("Failed to delete seller.");
      }
    } catch (err) {
      console.error("Error deleting seller:", err);
      alert("Failed to delete seller. Please try again.");
    }
  },

  toggleStatus: async (id) => {
    const seller = get().sellers.find((s) => s.id === id);
    if (!seller) return;

    const newStatus = seller.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`${API_URL}/api/sellers/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.status === "success") {
        set((state) => ({
          sellers: state.sellers.map((s) =>
            s.id === id ? { ...s, status: newStatus } : s,
          ),
        }));
      } else {
        alert(data.message || "Failed to toggle seller status.");
      }
    } catch (err) {
      console.error("Error toggling seller status:", err);
      alert("Failed to toggle seller status. Please try again.");
    }
  },
}));
