import { useEffect, useState } from 'react';
import { DollarSign, CarFront, Archive, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_FLASK_APP_API_URL;

interface MetricsData {
  availableCars: number;
  soldCars: number;
  archivedCars: number;
  totalValue: number;
  avgPrice: number;
  totalLeads: number;
}

export default function DashboardMetrics() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchMetrics = () => {
    setLoading(true);
    setError(false);
    fetch(`${API_URL}/api/metrics`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setMetrics(data.data);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-zinc-200/80 p-5 rounded-xl animate-pulse">
            <div className="h-4 bg-zinc-200 rounded w-24 mb-3" />
            <div className="h-8 bg-zinc-200 rounded w-16 mb-2" />
            <div className="h-3 bg-zinc-200 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="bg-rose-50 border border-rose-200 p-5 rounded-xl text-center">
        <p className="text-rose-600 text-sm">Failed to load metrics</p>
        <button onClick={fetchMetrics} className="mt-2 text-xs text-rose-500 underline cursor-pointer">
          Retry
        </button>
      </div>
    );
  }

  const stats = metrics ?? {
    availableCars: 0,
    soldCars: 0,
    archivedCars: 0,
    totalValue: 0,
    avgPrice: 0,
    totalLeads: 0,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-zinc-700">Dashboard Metrics</h2>
        <button
          onClick={fetchMetrics}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 transition cursor-pointer"
          title="Refresh metrics"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* KPI 1: Active Listings */}
        <div className="bg-white border border-zinc-200/80 p-5 rounded-xl flex items-center justify-between shadow-xs transition hover:shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider font-mono">Available Stock</span>
            <div className="text-2xl font-semibold text-zinc-900 tracking-tight">{stats.availableCars}</div>
            <p className="text-[11px] text-zinc-500">Live vehicles on catalog</p>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600 border border-blue-100 shadow-2xs">
            <CarFront className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        {/* KPI 2: Total Sold / Archived */}
        <div className="bg-white border border-zinc-200/80 p-5 rounded-xl flex items-center justify-between shadow-xs transition hover:shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider font-mono">Sold &amp; Archived</span>
            <div className="text-xl font-semibold text-zinc-950 tracking-tight font-mono">
              <span className="text-emerald-600 font-bold">{stats.soldCars}</span> <span className="text-zinc-400 text-xs font-normal">sold</span>
              <span className="text-zinc-300 mx-1.5">•</span>
              <span className="text-zinc-600 font-bold">{stats.archivedCars}</span> <span className="text-zinc-400 text-xs font-normal">arch</span>
            </div>
            <p className="text-[11px] text-zinc-500">Completed cycles</p>
          </div>
          <div className="bg-zinc-50 p-2.5 rounded-lg text-zinc-700 border border-zinc-200 shadow-2xs">
            <Archive className="w-5 h-5 text-zinc-650" />
          </div>
        </div>

        {/* KPI 3: Total Valuation / Avg Price in PHP (₱) */}
        <div className="bg-white border border-zinc-200/80 p-5 rounded-xl flex items-center justify-between shadow-xs transition hover:shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider font-mono">Portfolio Value</span>
            <div className="text-2xl font-semibold text-blue-600 tracking-tight font-mono">
              ₱{(stats.totalValue / 1000).toFixed(1)}k
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">Avg: ₱{Math.round(stats.avgPrice).toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600 border border-blue-100 shadow-2xs">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
        </div>

      </div>
    </div>
  );
}
