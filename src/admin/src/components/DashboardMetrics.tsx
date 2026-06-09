import { useMemo } from 'react';
import { Car } from '../types';
import { CarStatus } from '@repo/shared';
import { useCarStore } from '../stores/carStore';
import { DollarSign, CarFront, Archive } from 'lucide-react';

export default function DashboardMetrics() {
  const cars = useCarStore((s) => s.cars);
   // Memoized KPIs
   const stats = useMemo(() => {
     const availableCars = cars.filter(c => !c.status || c.status === CarStatus.Available);
     const soldCars = cars.filter(c => c.status === CarStatus.Sold);
     const archivedCars = cars.filter(c => c.status === CarStatus.Archived);

     const totalCount = availableCars.length;

    const totalValue = availableCars.reduce((sum, c) => sum + c.price, 0);
    const avgPrice = totalCount > 0 ? totalValue / totalCount : 0;
    
    const soldCount = soldCars.length;
    const archivedCount = archivedCars.length;

    return {
      totalCount,
      totalValue,
      avgPrice,
      soldCount,
      archivedCount,
    };
  }, [cars]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* KPI 1: Active Listings */}
        <div className="bg-white border border-zinc-200/80 p-5 rounded-xl flex items-center justify-between shadow-xs transition hover:shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider font-mono">Available Stock</span>
            <div className="text-2xl font-semibold text-zinc-900 tracking-tight">{stats.totalCount}</div>
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
              <span className="text-emerald-600 font-bold">{stats.soldCount}</span> <span className="text-zinc-400 text-xs font-normal">sold</span>
              <span className="text-zinc-300 mx-1.5">•</span>
              <span className="text-zinc-600 font-bold">{stats.archivedCount}</span> <span className="text-zinc-400 text-xs font-normal">arch</span>
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
