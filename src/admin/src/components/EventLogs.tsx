import { useState, useMemo } from 'react';
import { Skeleton } from '@repo/shared';
import { ActivityLog } from '../types';
import { 
  Terminal, Calendar, ClipboardList, Shield, Filter, Award, Search
} from 'lucide-react';

interface EventLogsProps {
  logs: ActivityLog[];
  isLoading?: boolean;
}

export default function EventLogs({ logs, isLoading }: EventLogsProps) {
  const [filterType, setFilterType] = useState<'all' | 'cms' | 'auth'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Filter by category
      if (filterType === 'cms') {
        if (!['create', 'update', 'delete'].includes(log.type)) return false;
      }
      if (filterType === 'auth') {
        if (!log.message.toLowerCase().includes('auth') && !log.message.toLowerCase().includes('session')) return false;
      }

      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        return (
          log.carName.toLowerCase().includes(term) ||
          log.message.toLowerCase().includes(term) ||
          log.type.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }, [logs, filterType, searchTerm]);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden transition-all duration-200">
      
      {/* Header element */}
      <div className="border-b border-zinc-200 px-5 py-4 bg-zinc-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4.5 h-4.5 text-zinc-650" />
            <span className="text-sm font-bold tracking-tight text-zinc-900 font-sans">System Audit &amp; Event Logs</span>
          </div>
          <p className="text-[11.5px] text-zinc-500 mt-0.5 font-sans">
            Real-time, organic records of administrative CMS adjustments and listing updates.
          </p>
        </div>

      </div>

      <div className="p-5 space-y-4">
        
        {/* Filter and Search Action bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Quick Filter tabs */}
          <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-250/60 max-w-max">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer select-none ${
                filterType === 'all'
                  ? 'bg-white text-zinc-850 shadow-xs border border-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              All Logs
            </button>
            <button
              onClick={() => setFilterType('cms')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer select-none ${
                filterType === 'cms'
                  ? 'bg-white text-zinc-850 shadow-xs border border-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              CMS Actions
            </button>
            <button
              onClick={() => setFilterType('auth')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer select-none ${
                filterType === 'auth'
                  ? 'bg-white text-zinc-850 shadow-xs border border-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Authorization
            </button>
          </div>

          {/* Search tool block */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50 pl-8 pr-3 py-1.5 border border-zinc-200 rounded-lg text-xs placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-350"
            />
          </div>

        </div>

        {/* The Listing Element logs container */}
        <div className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50">
          
          <div className="bg-zinc-900 text-zinc-100 font-mono text-[11px] p-4 h-64 overflow-y-auto space-y-2.5 shadow-inner">
            
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 p-6">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 italic p-6 text-center">
                <Terminal className="w-8 h-8 text-zinc-700 mb-2.5 animate-pulse" />
                <span>No event entries match your search criteria.</span>
                <span className="text-[10px] text-zinc-650 mt-1 max-w-xs leading-normal">
                  Events will be generated and appended here naturally as administrative updates are committed.
                </span>
              </div>
            ) : (
              filteredLogs.map((log) => {
                // Determine style based on event action pattern
                const isCmsCreate = log.type === 'create';
                const isCmsDelete = log.type === 'delete';
                const isCmsUpdate = log.type === 'update';
                
                return (
                  <div 
                    key={log.id} 
                    className="flex items-start gap-2.5 pb-2.5 border-b border-zinc-950/25 last:border-none hover:bg-zinc-850/45 p-1 rounded transition duration-150"
                  >
                    
                    {/* Timestamp signature */}
                    <span className="text-zinc-500 font-bold select-none flex-shrink-0">
                      [{log.timestamp}]
                    </span>

                    {/* Compact badge */}
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded flex-shrink-0 border leading-none tracking-wider select-none ${
                      isCmsCreate ? 'bg-emerald-950 text-emerald-405 border-emerald-900' :
                      isCmsDelete ? 'bg-rose-950 text-rose-405 border-rose-900' :
                      isCmsUpdate ? 'bg-blue-950 text-blue-405 border-blue-900' :
                      'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {log.type}
                    </span>

                    <div className="flex-1 leading-relaxed">
                      <span className="text-zinc-200">{log.message}</span>
                    </div>

                  </div>
                );
              })
            )}

          </div>

          <div className="bg-zinc-50 px-4 py-2 text-[10px] text-zinc-400 font-mono border-t border-zinc-200 flex items-center justify-between">
            <span>Tracking logs matching filters: <b>{filteredLogs.length} entries</b></span>
            <span>Organic Stream Indicator: Active</span>
          </div>

        </div>

      </div>

    </div>
  );
}
