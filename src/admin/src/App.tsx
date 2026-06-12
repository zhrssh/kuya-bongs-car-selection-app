/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CarStatus, Spinner } from "@repo/shared";
import {
  BarChart3,
  Lock,
  Settings2,
  ShieldCheck,
  Unlock,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AdminLoginPage from "./components/AdminLoginPage";
import DashboardMetrics from "./components/DashboardMetrics";
import EventLogs from "./components/EventLogs";
import InventoryCMS from "./components/InventoryCMS";
import ListingDetailModal from "./components/ListingDetailModal";
import SellersTab from "./components/SellersTab";
import { ActivityLog, Car } from "./types";
import { useCarStore } from "./stores/carStore";
import { useSellerStore } from "./stores/sellerStore";

export default function App() {
  // Routing paths: / or /dashboard, /inventory, /login
  const [currentPath, setCurrentPath] = useState<string>(() => {
    try {
      return window.location.pathname || "/";
    } catch {
      return "/";
    }
  });

  const navigate = useCallback((path: string) => {
    try {
      window.history.pushState(null, "", path);
      setCurrentPath(path);
    } catch {
      setCurrentPath(path);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Check if user is already authenticated as admin
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const handleGetAdminStatus = () => {
    setIsCheckingAuth(true);
    fetch(`${import.meta.env.VITE_FLASK_APP_API_URL}/admin/auth/status`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          res.json().then((data) => {
            if (data.authenticated === true) {
              setIsAdmin(true);
            } else if (data.authenticated === false) {
              setIsAdmin(false);
            }
          });
        } else {
          setIsAdmin(false);
        }
      })
      .catch(() => {
        alert("Connection error. Please try again.");
        setIsAdmin(false);
      })
      .finally(() => setIsCheckingAuth(false));
  };

  // On app load, check if user is already authenticated as admin
  useEffect(() => {
    if (!isAdmin) {
      handleGetAdminStatus();
    } else {
      setIsCheckingAuth(false);
    }
  }, []);

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logRefreshKey, setLogRefreshKey] = useState(0);
  const [logsLoading, setLogsLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_FLASK_APP_API_URL;

  const formatTime = (isoString: string): string => {
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const fetchLogs = useCallback(() => {
    setLogsLoading(true);
    fetch(`${apiUrl}/api/logs`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setLogs(
            data.data.logs.map((log: Record<string, unknown>) => ({
              id: log.id as string,
              timestamp: formatTime(log.createdAt as string),
              type: log.type as ActivityLog["type"],
              carId: (log.carId as string) || undefined,
              carName: (log.carName as string) || "",
              message: log.message as string,
            })),
          );
        }
      })
      .catch(() => {
        alert("Failed to load logs. Please try again.");
      })
      .finally(() => setLogsLoading(false));
  }, [apiUrl]);

  useEffect(() => {
    if (isAdmin) {
      fetchLogs();
    }
  }, [isAdmin, logRefreshKey, fetchLogs]);

  useEffect(() => {
    if (isAdmin) {
      useSellerStore.getState().fetchSellers();
    }
  }, [isAdmin]);

  // Single detail state (from store)
  const selectedCar = useCarStore((s) => s.selectedCar);
  const setStoreSelectedCar = useCarStore((s) => s.setSelectedCar);

  const handleLoginSuccess = useCallback(() => {
    setIsAdmin(true);
    setLogRefreshKey((prev) => prev + 1);
    useSellerStore.getState().fetchSellers();
  }, []);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // On logout, clear admin state on both client and server and log the event
  const handleLogout = useCallback(() => {
    setIsLoggingOut(true);
    fetch(`${import.meta.env.VITE_FLASK_APP_API_URL}/admin/logout`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          setIsAdmin(false);
        }
      })
      .catch(() => {
        // Even if server logout fails, clear client state to prevent stuck sessions
        setIsAdmin(false);
      })
      .finally(() => setIsLoggingOut(false));
  }, []);



  // GET CAR Listing (from store)
  const cars = useCarStore((s) => s.cars);
  const addCarToStore = useCarStore((s) => s.addCar);
  const updateCarInStore = useCarStore((s) => s.updateCar);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAddingCar, setIsAddingCar] = useState(false);
  const [isUpdatingCar, setIsUpdatingCar] = useState(false);

  // ADD CAR Listing
  const handleAddCar = async (newCar: Car) => {
    setIsAddingCar(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_FLASK_APP_API_URL}/api/cars`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCar),
        credentials: "include",
      });
      const data = await res.json();
      if (data.status === "success") {
        const savedCar = data.data.car;
        addCarToStore(savedCar);
        setLogRefreshKey((prev) => prev + 1);
      }
    } catch (err) {
      alert("Failed to add car. Please try again.");
    } finally {
      setIsAddingCar(false);
    }
  };

  // UPDATE CAR Listing
  const handleUpdateCar = async (updatedCar: Car) => {
    setIsUpdatingCar(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_FLASK_APP_API_URL}/api/cars/${updatedCar.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedCar),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.status === "success") {
        const savedCar = data.data.car;
        updateCarInStore(savedCar);
        setLogRefreshKey((prev) => prev + 1);

        // Mirror update in detail modal if active
        if (selectedCar?.id === savedCar.id) {
          setStoreSelectedCar(savedCar);
        }
        setRefreshKey((prev) => prev + 1);
      }
    } catch (err) {
      alert("Failed to update car. Please try again.");
    } finally {
      setIsUpdatingCar(false);
    }
  };

  // Read sellers from store for passing to InventoryCMS
  const sellers = useSellerStore((s) => s.sellers);

  // UPDATE CAR STATUS
  const handleUpdateCarStatus = (id: string, status: CarStatus) => {
    if (!selectedCar || selectedCar.id !== id) return;
    const updated = { ...selectedCar, status };
    handleUpdateCar(updated);
  };

  return (
    <div className="min-h-screen bg-bg-page text-text-body flex flex-col font-sans antialiased selection:bg-bg-hover">
      {/* Upper Navigation Header Bar */}
      <header className="border-b border-border/60 bg-bg-surface/75 backdrop-blur-md sticky top-0 z-30 shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Headline */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="KBCS – Kuya Bong's Car Selection"
              className="w-14 h-14 rounded-xl flex-shrink-0 cursor-pointer"
              onClick={() => navigate("/")}
            />
            <div className="w-px h-9 bg-navy/30" />
            <div className="cursor-pointer" onClick={() => navigate("/")}>
              <h1 className="font-display font-extrabold text-2xl tracking-[-0.02em] text-navy leading-none">
                KBCS
              </h1>
              <span className="text-xs font-sans font-medium text-text-muted block mt-1">
                Manage Cars, Sellers & Sales
              </span>
            </div>
          </div>

          {/* Module Selectors & Administration Indicators */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-end">
            <nav
              className="flex items-center p-0.5 bg-bg-muted/80 border border-border/55 rounded-lg"
              aria-label="Tabs navigation">
              <button
                onClick={() => navigate("/")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium tracking-wide transition cursor-pointer ${
                  currentPath === "/" || currentPath === "/dashboard"
                    ? "bg-brand text-text-on-brand shadow-xs font-semibold"
                    : "text-text-muted hover:text-text-strong hover:bg-bg-hover/50"
                }`}
                id="tab_metrics">
                <BarChart3
                  className={`w-3.5 h-3.5 ${currentPath === "/" || currentPath === "/dashboard" ? "text-text-on-brand" : "text-text-muted"}`}
                />
                Metrics
              </button>

              <button
                onClick={() => navigate("/inventory")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium tracking-wide transition cursor-pointer ${
                  currentPath === "/inventory"
                    ? "bg-brand text-text-on-brand shadow-xs font-semibold"
                    : "text-text-muted hover:text-text-strong hover:bg-bg-hover/50"
                }`}
                id="tab_cms">
                <Settings2
                  className={`w-3.5 h-3.5 ${currentPath === "/inventory" ? "text-text-on-brand" : "text-text-muted"}`}
                />
                Inventory CMS
              </button>

              <button
                onClick={() => navigate("/sellers")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium tracking-wide transition cursor-pointer ${
                  currentPath === "/sellers"
                    ? "bg-brand text-text-on-brand shadow-xs font-semibold"
                    : "text-text-muted hover:text-text-strong hover:bg-bg-hover/50"
                }`}
                id="tab_sellers">
                <Users
                  className={`w-3.5 h-3.5 ${currentPath === "/sellers" ? "text-text-on-brand" : "text-text-muted"}`}
                />
                Sellers
              </button>
            </nav>

            <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-border/65 pt-3 sm:pt-0 sm:pl-4">
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase font-bold font-mono tracking-wider bg-success-bg text-success-text px-2.5 py-1 rounded-full border border-success-border shadow-xs header-status-tag">
                    <ShieldCheck className="w-3 h-3 text-success shrink-0" />
                    <span>Admin Active</span>
                  </span>
                  <button
                    onClick={() => {
                      handleLogout();
                      navigate("/");
                    }}
                    disabled={isLoggingOut}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-danger-bg hover:bg-danger-hover border border-danger-border text-danger-text hover:text-danger rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50 focus:outline-none"
                    id="btn_admin_logout"
                    title="Sign Out of Administration Session">
                    {isLoggingOut ? (
                      <Spinner size="sm" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5 text-danger" />
                    )}
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold font-mono tracking-wider bg-bg-muted text-text-muted px-2.5 py-1 rounded-full border border-border border-dashed header-status-tag flex items-center gap-1">
                    <Lock className="w-3 h-3 text-text-faint shrink-0" />
                    <span>Read Only</span>
                  </span>
                  <button
                    onClick={() => navigate("/login")}
                    className={`px-3 py-1.5 border rounded-lg text-xs font-semibold tracking-wide transition cursor-pointer focus:outline-none ${
                      currentPath === "/login"
                        ? "bg-brand border-brand text-text-on-brand shadow-xs"
                        : "bg-brand/10 hover:bg-brand/20 border-brand/20 text-brand hover:text-brand-dark"
                    }`}
                    id="btn_admin_login_header">
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container View Panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Tab Selection routing */}
        <div className="transition duration-150">
          {isCheckingAuth ? (
            <div className="flex items-center justify-center py-20">
              <Spinner label="Verifying session..." />
            </div>
          ) : (currentPath === "/" ||
            currentPath === "/dashboard" ||
            currentPath === "") &&
            (isAdmin ? (
              <div className="space-y-8 animate-in fade-in duration-350">
                <DashboardMetrics />
                <div className="border-t border-border/60 pt-8 mt-8">
                  <EventLogs logs={logs} isLoading={logsLoading} />
                </div>
              </div>
            ) : (
              <div className="max-w-md w-full mx-auto my-12 p-8 text-center bg-bg-surface border border-border shadow-md rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Lock className="w-12 h-12 text-text-faint mx-auto mb-4" />
                <h3 className="text-base font-bold text-text-strong">
                  Administrator Access Required
                </h3>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">
                  Sign in with your admin credentials to access system
                  metrics, event logs, and inventory management
                  tools.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="mt-6 px-5 py-2.5 bg-brand hover:bg-brand-dark text-text-on-brand rounded-lg text-xs font-semibold cursor-pointer transition shadow-xs border border-transparent focus:outline-none">
                  Sign In as Admin
                </button>
              </div>
            ))}

          {currentPath === "/inventory" &&
            (isAdmin ? (
              <InventoryCMS
                refreshKey={refreshKey}
                sellers={sellers}
                onAddCar={handleAddCar}
                onUpdateCar={handleUpdateCar}
                isSaving={isAddingCar || isUpdatingCar}
              />
            ) : (
              <div className="max-w-md w-full mx-auto my-12 p-8 text-center bg-bg-surface border border-border shadow-md rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Lock className="w-12 h-12 text-text-faint mx-auto mb-4" />
                <h3 className="text-base font-bold text-text-strong">
                  Administrator Access Required
                </h3>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">
                  You are attempting to access the Inventory CMS console. Please
                  sign in with your admin credentials to publish new cars,
                  manage catalogs, or adjust                   pricing parameters.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="mt-6 px-5 py-2.5 bg-brand hover:bg-brand-dark text-text-on-brand rounded-lg text-xs font-semibold cursor-pointer transition shadow-xs border border-transparent focus:outline-none">
                  Sign In as Admin
                </button>
              </div>
            ))}

          {currentPath === "/sellers" &&
            (isAdmin ? (
              <SellersTab
                isAdmin={isAdmin}
              />
            ) : (
              <div className="max-w-md w-full mx-auto my-12 p-8 text-center bg-bg-surface border border-border shadow-md rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Lock className="w-12 h-12 text-text-faint mx-auto mb-4" />
                <h3 className="text-base font-bold text-text-strong">
                  Administrator Access Required
                </h3>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">
                  You are attempting to access the Sellers Management console.
                  Please sign in with your admin credentials to manage seller
                  profiles.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="mt-6 px-5 py-2.5 bg-brand hover:bg-brand-dark text-text-on-brand rounded-lg text-xs font-semibold cursor-pointer transition shadow-xs border border-transparent focus:outline-none">
                  Sign In as Admin
                </button>
              </div>
            ))}

          {currentPath === "/login" && (
            <div className="py-6">
              {isAdmin ? (
                <div className="max-w-md w-full mx-auto p-8 text-center bg-bg-surface border border-border shadow-md rounded-2xl animate-in fade-in duration-300">
                  <ShieldCheck className="w-12 h-12 text-success mx-auto mb-4" />
                  <h3 className="text-base font-bold text-text-strong">
                    Session Verified
                  </h3>
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    You are already logged in as a system Administrator.
                  </p>
                  <div className="mt-6 flex gap-3 justify-center">
                    <button
                      onClick={() => navigate("/inventory")}
                      className="px-4 py-2 bg-brand hover:bg-brand-dark text-text-on-brand rounded-md text-xs font-semibold cursor-pointer transition">
                      Go to Inventory CMS
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-bg-muted hover:bg-danger-bg border border-border text-text-muted hover:text-danger rounded-md text-xs font-semibold cursor-pointer transition">
                      Disconnect Admin
                    </button>
                  </div>
                </div>
              ) : (
                <AdminLoginPage
                  onLoginSuccess={() => {
                    handleLoginSuccess();
                    navigate("/inventory");
                  }}
                />
              )}
            </div>
          )}
        </div>
      </main>



      {/* Detail Overlay Sheet Drawer */}
      {selectedCar && (
        <ListingDetailModal
          car={selectedCar}
          onClose={() => setStoreSelectedCar(null)}
          onUpdateStatus={handleUpdateCarStatus}
        />
      )}
    </div>
  );
}
