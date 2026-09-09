import React from 'react';
import { snowflakeWarehouse } from '../../services/snowflakeSync';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { Database, Clock, TrendingUp, AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface SnowflakeAnalyticsModalProps {
  onClose: () => void;
}

export const SnowflakeAnalyticsModal: React.FC<SnowflakeAnalyticsModalProps> = ({ onClose }) => {
  const metrics = snowflakeWarehouse.getWarehouseMetrics();
  const recentLogs = snowflakeWarehouse.getRecentLogs();

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="crystal-modal p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Snowflake Healthcare Data Warehouse
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[10px] font-bold">
                  ACTIVE PIPELINE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Analytical queries & structured emergency telemetry aggregation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <GlassCard className="p-3 text-center border-cyan-500/30">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Avg Response Time
            </span>
            <div className="text-2xl font-bold text-cyan-300 my-1 tabular-nums">
              {metrics.avgResponseTimeMin} <span className="text-xs text-slate-400 font-normal">min</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">18% faster than city avg</span>
          </GlassCard>

          <GlassCard className="p-3 text-center border-blue-500/30">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Avg Transport Time
            </span>
            <div className="text-2xl font-bold text-blue-300 my-1 tabular-nums">
              {metrics.avgTransportTimeMin} <span className="text-xs text-slate-400 font-normal">min</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Traffic-optimized routing</span>
          </GlassCard>

          <GlassCard className="p-3 text-center border-emerald-500/30">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              ER Lead-Time Gained
            </span>
            <div className="text-2xl font-bold text-emerald-300 my-1 tabular-nums">
              +{metrics.hospitalPrepTimeGainedMin} <span className="text-xs text-slate-400 font-normal">min</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">Pre-arrival preparation</span>
          </GlassCard>

          <GlassCard className="p-3 text-center border-red-500/30">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Critical Case Ratio
            </span>
            <div className="text-2xl font-bold text-red-400 my-1 tabular-nums">
              {metrics.criticalCaseRate}
            </div>
            <span className="text-[10px] text-red-300 font-medium">Priority triage sorted</span>
          </GlassCard>
        </div>

        {/* Emergency Distribution */}
        <div className="mb-5 p-4 rounded-2xl bg-white/5 border border-white/10">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-3">
            Emergency Condition Distribution (Snowflake Dimension Analysis)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {metrics.distribution.map(d => (
              <div key={d.type} className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">{d.type}</span>
                  <span className="font-bold text-white">{d.percentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${d.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Event Stream Table */}
        <div className="flex-1 min-h-[180px]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2 flex items-center justify-between">
            <span>Recent Synchronized Warehouse Records</span>
            <span className="text-[10px] font-mono text-cyan-300">SNOWFLAKE_DB.PUBLIC.ASVA_*</span>
          </span>

          <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-950/60 max-h-48 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-400 text-[10px] uppercase font-semibold border-b border-white/10">
                <tr>
                  <th className="p-2.5">Table</th>
                  <th className="p-2.5">Record ID</th>
                  <th className="p-2.5">Synced Payload Summary</th>
                  <th className="p-2.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {recentLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="p-2.5 text-cyan-300 font-bold">{log.table}</td>
                    <td className="p-2.5 text-white">{log.recordId}</td>
                    <td className="p-2.5 text-slate-400 truncate max-w-xs font-sans">
                      {JSON.stringify(log.payload).slice(0, 50)}...
                    </td>
                    <td className="p-2.5 text-right text-slate-500 font-sans">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
          <GlassButton size="sm" variant="secondary" onClick={onClose}>
            Close Warehouse View
          </GlassButton>
        </div>
      </div>
    </div>
  );
};
