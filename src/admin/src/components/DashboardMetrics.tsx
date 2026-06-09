import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Car, DailyMetricData } from '../types';
import { CarStatus } from '@repo/shared';
import { useCarStore } from '../stores/carStore';
import { TrendingUp, DollarSign, CarFront, MessageSquare, Archive } from 'lucide-react';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface DashboardMetricsProps {
  dailyMetrics: DailyMetricData[];
  totalLeads: number;
  totalViews: number;
}

export default function DashboardMetrics({ dailyMetrics, totalLeads, totalViews }: DashboardMetricsProps) {
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

  // Chart: Daily Engagement Trend (Line)
  const lineChartData = useMemo(() => {
    return {
      labels: dailyMetrics.map(m => m.date),
      datasets: [
        {
          label: 'Views (Scale Left)',
          data: dailyMetrics.map(m => m.views),
          borderColor: 'rgb(59, 130, 246)', // Blue-500
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          fill: true,
          tension: 0.3,
          yAxisID: 'yViews',
        },
        {
          label: 'Leads (Scale Right)',
          data: 'rgb(16, 185, 129)', // Emerald-500
          borderColor: 'rgb(16, 185, 129)', 
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          fill: true,
          tension: 0.3,
          yAxisID: 'yLeads',
        }
      ]
    };
  }, [dailyMetrics]);

  // Correct chart data for Leads
  const verifiedLineChartData = useMemo(() => {
    return {
      labels: dailyMetrics.map(m => m.date),
      datasets: [
        {
          label: 'Views (Scale Left)',
          data: dailyMetrics.map(m => m.views),
          borderColor: 'rgb(37, 99, 235)', // Nice vibrant blue
          backgroundColor: 'rgba(37, 99, 235, 0.06)',
          fill: true,
          tension: 0.3,
          yAxisID: 'yViews',
        },
        {
          label: 'Leads (Scale Right)',
          data: dailyMetrics.map(m => m.leads),
          borderColor: 'rgb(16, 185, 129)', // Emerald-550
          backgroundColor: 'rgba(16, 185, 129, 0.06)',
          fill: true,
          tension: 0.3,
          yAxisID: 'yLeads',
        }
      ]
    };
  }, [dailyMetrics]);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#27272a',
          boxWidth: 12,
          font: { family: 'Inter', size: 11, weight: 'normal' as const }
        }
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#18181b',
        bodyColor: '#52525b',
        borderColor: '#e4e4e7',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
        titleFont: { family: 'Inter', size: 12, weight: 'bold' as const },
        bodyFont: { family: 'Inter', size: 11 }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(24, 24, 27, 0.04)' },
        ticks: { color: '#71717a', font: { family: 'Inter', size: 10 } }
      },
      yViews: {
        type: 'linear' as const,
        position: 'left' as const,
        grid: { color: 'rgba(24, 24, 27, 0.04)' },
        ticks: { color: '#71717a', font: { family: 'Inter', size: 10 } },
        title: {
          display: true,
          text: 'Platform Views',
          color: '#71717a',
          font: { family: 'Inter', size: 10, weight: 'normal' as const }
        }
      },
      yLeads: {
        type: 'linear' as const,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        ticks: { color: '#71717a', font: { family: 'Inter', size: 10 } },
        title: {
          display: true,
          text: 'Customer Leads',
          color: '#71717a',
          font: { family: 'Inter', size: 10, weight: 'normal' as const }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time KPI Card Metrics with Blue Accents & 4 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
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

        {/* KPI 4: Total Live Enquiries */}
        <div className="bg-white border border-zinc-200/80 p-5 rounded-xl flex items-center justify-between shadow-xs transition hover:shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider font-mono">Total Leads</span>
            <div className="text-2xl font-semibold text-zinc-900 tracking-tight">{totalLeads}</div>
            <p className="text-[11px] text-zinc-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-650" />
              <span className="text-zinc-600 font-medium">{totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) : 0}% Conversion</span>
            </p>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600 border border-blue-100 shadow-2xs">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
        </div>

      </div>

      {/* Single Clean Chart: Engagement Trend (stretched 12-span) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Line Chart: Engagement Trend */}
        <div className="lg:col-span-12 bg-white border border-zinc-200/70 rounded-xl p-6 shadow-xs">
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-600 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Views &amp; Leads Trend
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1">Weekly traffic activity of potential premium car buyers</p>
          </div>
          <div className="h-80">
            <Line data={verifiedLineChartData} options={lineChartOptions} />
          </div>
        </div>

      </div>
    </div>
  );
}
