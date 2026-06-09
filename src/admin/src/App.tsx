/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BarChart3,
  Cpu,
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
import { CarStatus } from "@repo/shared";
import {
  INITIAL_LOGS,
  INITIAL_METRICS,
  RANDOM_NAMES,
  US_LOCATIONS,
} from "./initialData";
import { ActivityLog, Car, DailyMetricData, SellerContact } from "./types";

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

  const handleGetAdminStatus = () => {
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
      .catch((err) => {
        console.error("Error fetching admin auth status:", err);
        setIsAdmin(false);
      });
  };

  // On app load, check if user is already authenticated as admin
  useEffect(() => {
    if (!isAdmin) {
      handleGetAdminStatus();
    }
  }, []);

  // Metrics aggregate states
  const [dailyMetrics, setDailyMetrics] =
    useState<DailyMetricData[]>(INITIAL_METRICS);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);

  // Single detail state
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  // Deriving cumulative KPIs
  const totalViews = dailyMetrics.reduce((sum, m) => sum + m.views, 0);
  const totalLeads = dailyMetrics.reduce((sum, m) => sum + m.leads, 0);

  // Time generator helper for logs
  const getFormattedTime = () => {
    const d = new Date();
    return d.toTimeString().split(" ")[0]; // returns HH:MM:SS
  };

  // Log appender helper
  const addLog = useCallback(
    (
      type: ActivityLog["type"],
      carName: string,
      message: string,
      customLoc?: string,
      carId?: string,
    ) => {
      const loc =
        customLoc ||
        US_LOCATIONS[Math.floor(Math.random() * US_LOCATIONS.length)];
      const newLog: ActivityLog = {
        id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 100),
        timestamp: getFormattedTime(),
        type,
        carId,
        carName,
        message,
        userLocation: loc,
      };
      setLogs((prev) => [newLog, ...prev]);
      // TODO: Add logs to db
    },
    [],
  );

  const handleLoginSuccess = useCallback(() => {
    setIsAdmin(true);

    // Add log entry for successful authentication event
    addLog(
      "update",
      "System Auth",
      "User authenticated successfully as System Administrator",
      "Secure Terminal",
    );
  }, [addLog]);

  // On logout, clear admin state on both client and server and log the event
  const handleLogout = useCallback(() => {
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
      });

    // Add log entry for logout event
    addLog(
      "update",
      "System Auth",
      "Administrator session terminated (logged out)",
      "Secure Terminal",
    );
  }, [addLog]);

  const handleClearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // GET CAR Listing
  const [cars, setCars] = useState<Car[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // ADD CAR Listing
  const handleAddCar = (newCar: Car) => {
    fetch(`${import.meta.env.VITE_FLASK_APP_API_URL}/api/cars`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCar),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          const savedCar = data.data.car;
          setCars((prev) => [savedCar, ...prev]);
          addLog(
            "create",
            `${savedCar.make} ${savedCar.model}`,
            `CMS: Published new catalog listing for ${savedCar.make} ${savedCar.model} under ID ${savedCar.id}`,
            savedCar.seller.location,
            savedCar.id,
          );

          // Auto simulate some baseline queries due to listing alert notifications
          setDailyMetrics((prev) => {
            const copy = [...prev];
            if (copy.length > 0) {
              copy[copy.length - 1] = {
                ...copy[copy.length - 1],
                searches: copy[copy.length - 1].searches + 15,
                views: copy[copy.length - 1].views + 12,
              };
            }
            return copy;
          });
        }
      })
      .catch((err) => console.error("Error adding car:", err));
  };

  // UPDATE CAR Listing
  const handleUpdateCar = (updatedCar: Car) => {
    fetch(
      `${import.meta.env.VITE_FLASK_APP_API_URL}/api/cars/${updatedCar.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCar),
        credentials: "include",
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          const savedCar = data.data.car;
          setCars((prev) =>
            prev.map((c) => (c.id === savedCar.id ? savedCar : c)),
          );
          addLog(
            "update",
            `${savedCar.make} ${savedCar.model}`,
            `CMS: Modified attributes/specifications of ${savedCar.make} ${savedCar.model}`,
            savedCar.seller.location,
            savedCar.id,
          );

          // Mirror update in detail modal if active
          if (selectedCar?.id === savedCar.id) {
            setSelectedCar(savedCar);
          }
          setRefreshKey((prev) => prev + 1);
        }
      })
      .catch((err) => console.error("Error updating car:", err));
  };

  // DELETE CAR Listing
  const handleDeleteCar = (id: string) => {
    const target = cars.find((c) => c.id === id);
    if (!target) return;

    if (
      confirm(
        `Administrate CMS: Are you sure you want to permanently delete the listing for the ${target.make} ${target.model}?`,
      )
    ) {
      fetch(`${import.meta.env.VITE_FLASK_APP_API_URL}/api/cars/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => {
          if (res.ok) {
            setCars((prev) => prev.filter((c) => c.id !== id));
            addLog(
              "delete",
              `${target.make} ${target.model}`,
              `CMS: Revoked and unlisted vehicle ${target.make} ${target.model} from database pool`,
              target.seller?.location,
              target.id,
            );

            if (selectedCar?.id === id) {
              setSelectedCar(null);
            }
          }
        })
        .catch((err) => console.error("Error deleting car:", err));
    }
  };

  // GET SELLERS List
  const [sellers, setSellers] = useState<SellerContact[]>([]);

  const handleGetSellersList = () => {
    fetch(`${import.meta.env.VITE_FLASK_APP_API_URL}/api/sellers`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          res.json().then((data) => {
            if (data.status === "success") {
              setSellers(data.data.sellers);
            }
          });
        }
      })
      .catch((err) => console.error("Error fetching sellers:", err));
  };

  // On app load, fetch sellers from the database
  useEffect(() => {
    if (isAdmin) {
      handleGetSellersList();
    }
  }, [isAdmin]);

  // ADD SELLER
  const handleAddSeller = (newSeller: SellerContact) => {
    fetch(`${import.meta.env.VITE_FLASK_APP_API_URL}/api/sellers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newSeller),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setSellers((prev) => [data.data.seller, ...prev]);
          addLog(
            "create",
            newSeller.name,
            `CMS: Registered new seller ${newSeller.name}`,
            newSeller.location,
          );
        }
      })
      .catch((err) => console.error("Error adding seller:", err));
  };

  // UPDATE SELLER
  const handleUpdateSeller = (updatedSeller: SellerContact) => {
    fetch(
      `${import.meta.env.VITE_FLASK_APP_API_URL}/api/sellers/${updatedSeller.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSeller),
        credentials: "include",
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          const saved = data.data.seller;
          setSellers((prev) =>
            prev.map((s) => (s.id === saved.id ? saved : s)),
          );
          addLog(
            "update",
            saved.name,
            `CMS: Updated seller profile for ${saved.name}`,
            saved.location,
          );
        }
      })
      .catch((err) => console.error("Error updating seller:", err));
  };

  // DELETE SELLER
  const handleDeleteSeller = (id: string) => {
    const target = sellers.find((s) => s.id === id);
    if (!target) return;

    if (
      confirm(
        `Administrate CMS: Are you sure you want to permanently delete the seller profile for ${target.name}?`,
      )
    ) {
      fetch(`${import.meta.env.VITE_FLASK_APP_API_URL}/api/sellers/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => {
          if (res.ok) {
            setSellers((prev) => prev.filter((s) => s.id !== id));
            addLog(
              "delete",
              target.name,
              `CMS: Removed seller ${target.name} from database pool`,
              target.location,
            );
          }
        })
        .catch((err) => console.error("Error deleting seller:", err));
    }
  };

  // TOGGLE SELLER STATUS
  const handleToggleSellerStatus = (id: string) => {
    const seller = sellers.find((s) => s.id === id);
    if (!seller) return;

    const newStatus = seller.status === "active" ? "inactive" : "active";

    fetch(
      `${import.meta.env.VITE_FLASK_APP_API_URL}/api/sellers/${id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setSellers((prev) =>
            prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)),
          );
          addLog(
            "update",
            seller.name,
            `CMS: Toggled seller status to ${newStatus}`,
            seller.location,
          );
        }
      })
      .catch((err) => console.error("Error toggling seller status:", err));
  };

  // SIMULATE CAR VIEW
  const handleSimulateView = (id: string) => {
    const car = cars.find((c) => c.id === id);
    if (!car) return;

    // Increment current day views inside the metrics tracking list
    setDailyMetrics((prev) => {
      const copy = [...prev];
      if (copy.length > 0) {
        copy[copy.length - 1] = {
          ...copy[copy.length - 1],
          views: copy[copy.length - 1].views + 1,
        };
      }
      return copy;
    });

    const loc = US_LOCATIONS[Math.floor(Math.random() * US_LOCATIONS.length)];
    addLog(
      "view",
      `${car.make} ${car.model}`,
      `Anonymous buyer from ${loc} viewed full layout config specs of ${car.make} ${car.model}`,
      loc,
      car.id,
    );
  };

  // SIMULATE CLIENT LEAD ENQUIRY
  const handleSimulateEnquiry = (id: string) => {
    const car = cars.find((c) => c.id === id);
    if (!car) return;

    // Increment current day leads inside the metrics tracking list
    setDailyMetrics((prev) => {
      const copy = [...prev];
      if (copy.length > 0) {
        copy[copy.length - 1] = {
          ...copy[copy.length - 1],
          leads: copy[copy.length - 1].leads + 1,
        };
      }
      return copy;
    });

    const name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const loc = US_LOCATIONS[Math.floor(Math.random() * US_LOCATIONS.length)];
    addLog(
      "enquiry",
      `${car.make} ${car.model}`,
      `Sales Lead: ${name} sent buy enquiry to ${car.seller?.name} for the ${car.make} ${car.model}`,
      loc,
      car.id,
    );
  };

  // UPDATE CAR STATUS
  const handleUpdateCarStatus = (id: string, status: CarStatus) => {
    if (!selectedCar || selectedCar.id !== id) return;
    const updated = { ...selectedCar, status };
    handleUpdateCar(updated);
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900 flex flex-col font-sans antialiased selection:bg-zinc-200">
      {/* Upper Navigation Header Bar */}
      <header className="border-b border-zinc-200/60 bg-white/75 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Headline */}
          <div className="flex items-center gap-2.5">
            <div
              className="bg-blue-50 border border-blue-100 p-2 rounded-lg text-blue-600 cursor-pointer"
              onClick={() => navigate("/")}>
              <Cpu className="w-5 h-5 text-blue-600" />
            </div>
            <div className="cursor-pointer" onClick={() => navigate("/")}>
              <h1 className="text-base font-semibold tracking-tight text-zinc-900 font-sans">
                AutoDrive Studio
              </h1>
              <p className="text-[11px] text-zinc-500 font-mono tracking-tight flex items-center gap-1.5 flex-wrap">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                Catalog CMS &amp; Live Real-time Metrics
              </p>
            </div>
          </div>

          {/* Module Selectors & Administration Indicators */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-end">
            <nav
              className="flex items-center p-0.5 bg-zinc-100/80 border border-zinc-200/55 rounded-lg"
              aria-label="Tabs navigation">
              <button
                onClick={() => navigate("/")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium tracking-wide transition cursor-pointer ${
                  currentPath === "/" || currentPath === "/dashboard"
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50"
                }`}
                id="tab_metrics">
                <BarChart3
                  className={`w-3.5 h-3.5 ${currentPath === "/" || currentPath === "/dashboard" ? "text-white" : "text-zinc-500"}`}
                />
                Metrics
              </button>

              <button
                onClick={() => navigate("/inventory")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium tracking-wide transition cursor-pointer ${
                  currentPath === "/inventory"
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50"
                }`}
                id="tab_cms">
                <Settings2
                  className={`w-3.5 h-3.5 ${currentPath === "/inventory" ? "text-white" : "text-zinc-500"}`}
                />
                Inventory CMS
              </button>

              <button
                onClick={() => navigate("/sellers")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium tracking-wide transition cursor-pointer ${
                  currentPath === "/sellers"
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50"
                }`}
                id="tab_sellers">
                <Users
                  className={`w-3.5 h-3.5 ${currentPath === "/sellers" ? "text-white" : "text-zinc-500"}`}
                />
                Sellers
              </button>
            </nav>

            <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-zinc-200/65 pt-3 sm:pt-0 sm:pl-4">
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase font-bold font-mono tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-150 shadow-xs header-status-tag">
                    <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>Admin Active</span>
                  </span>
                  <button
                    onClick={() => {
                      handleLogout();
                      navigate("/");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-700 hover:text-rose-800 rounded-lg text-xs font-semibold transition cursor-pointer focus:outline-none"
                    id="btn_admin_logout"
                    title="Sign Out of Administration Session">
                    <Unlock className="w-3.5 h-3.5 text-rose-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold font-mono tracking-wider bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full border border-slate-200 border-dashed header-status-tag flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Read Only</span>
                  </span>
                  <button
                    onClick={() => navigate("/login")}
                    className={`px-3 py-1.5 border rounded-lg text-xs font-semibold tracking-wide transition cursor-pointer focus:outline-none ${
                      currentPath === "/login"
                        ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                        : "bg-blue-50/70 hover:bg-blue-100 border-blue-200 text-blue-600 hover:text-blue-700"
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
          {(currentPath === "/" ||
            currentPath === "/dashboard" ||
            currentPath === "") &&
            (isAdmin ? (
              <div className="space-y-8 animate-in fade-in duration-350">
                <DashboardMetrics
                  cars={cars}
                  dailyMetrics={dailyMetrics}
                  totalLeads={totalLeads}
                  totalViews={totalViews}
                />
                <div className="border-t border-zinc-200/60 pt-8 mt-8">
                  <EventLogs logs={logs} onClearLogs={handleClearLogs} />
                </div>
              </div>
            ) : (
              <div className="max-w-md w-full mx-auto my-12 p-8 text-center bg-white border border-zinc-200 shadow-md rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Lock className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-base font-bold text-zinc-900">
                  Administrator Access Required
                </h3>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                  You are attempting to access the AutoDrive Metrics and System
                  Event logs. Please sign in with your admin credentials to view
                  interactive analytics, performance graphs, and catalog audit
                  trails.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-xs border border-transparent focus:outline-none">
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
                onDeleteCar={handleDeleteCar}
                onSelectCar={(car) => setSelectedCar(car)}
                onSimulateView={handleSimulateView}
              />
            ) : (
              <div className="max-w-md w-full mx-auto my-12 p-8 text-center bg-white border border-zinc-200 shadow-md rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Lock className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-base font-bold text-zinc-900">
                  Administrator Access Required
                </h3>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                  You are attempting to access the Inventory CMS console. Please
                  sign in with your admin credentials to publish new cars,
                  manage catalogs, or adjust pricing parameters.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-xs border border-transparent focus:outline-none">
                  Sign In as Admin
                </button>
              </div>
            ))}

          {currentPath === "/sellers" &&
            (isAdmin ? (
              <SellersTab
                sellers={sellers}
                cars={cars}
                onAddSeller={handleAddSeller}
                onUpdateSeller={handleUpdateSeller}
                onDeleteSeller={handleDeleteSeller}
                onToggleStatus={handleToggleSellerStatus}
                isAdmin={isAdmin}
              />
            ) : (
              <div className="max-w-md w-full mx-auto my-12 p-8 text-center bg-white border border-zinc-200 shadow-md rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Lock className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-base font-bold text-zinc-900">
                  Administrator Access Required
                </h3>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                  You are attempting to access the Sellers Management console.
                  Please sign in with your admin credentials to manage seller
                  profiles.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-xs border border-transparent focus:outline-none">
                  Sign In as Admin
                </button>
              </div>
            ))}

          {currentPath === "/login" && (
            <div className="py-6">
              {isAdmin ? (
                <div className="max-w-md w-full mx-auto p-8 text-center bg-white border border-zinc-200 shadow-md rounded-2xl animate-in fade-in duration-300">
                  <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-base font-bold text-zinc-900">
                    Session Verified
                  </h3>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                    You are already logged in as a system Administrator.
                  </p>
                  <div className="mt-6 flex gap-3 justify-center">
                    <button
                      onClick={() => navigate("/inventory")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold cursor-pointer transition">
                      Go to Inventory CMS
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-zinc-100 hover:bg-rose-50 border border-zinc-200 text-zinc-650 hover:text-rose-600 rounded-md text-xs font-semibold cursor-pointer transition">
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

      {/* Bottom Footer Credits block */}
      <footer className="border-t border-zinc-200/60 bg-white py-8 mt-16 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-6 space-y-1">
          <p className="font-mono text-zinc-500 text-[11px]">
            AutoDrive • Engineered with React &amp; Tailwind
          </p>
          <p className="text-[10px] text-zinc-400">
            Local state preservation for fast client-side performance auditing.
          </p>
        </div>
      </footer>

      {/* Detail Overlay Sheet Drawer */}
      {selectedCar && (
        <ListingDetailModal
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
          onUpdateStatus={handleUpdateCarStatus}
        />
      )}
    </div>
  );
}
