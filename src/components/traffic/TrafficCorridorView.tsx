import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { LiveOperationsMap } from '../map/LiveOperationsMap';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { StatusPill } from '../common/StatusPill';
import { ShieldAlert, Navigation, Clock, Radio, CheckCircle, AlertOctagon } from 'lucide-react';

export const TrafficCorridorView: React.FC = () => {
  const { allActiveEmergencies, hospitals, selectedHospital } = useEmergency();
  const [activeCorridors, setActiveCorridors] = useState<Record<string, boolean>>({ 'EMG-82931': true });

  const toggleCorridor = (emergencyId: string) => {
    setActiveCorridors(prev => ({
      ...prev,
      [emergencyId]: !prev[emergencyId]
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-asva-bg text-white overflow-hidden">
      {/* Header */}
      <header className="px-4 py-3 bg-[#071018]/90 backdrop-blur-crystal border-b border-white/10 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <img src="/asva_logo.png" alt="ASVA" className="w-8 h-8 rounded-xl object-cover" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">ASVA Traffic Operations Command</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[10px] font-bold uppercase">
                Green Corridor System
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Kolkata Traffic Police Emergency Dispatch Grid
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-2xl">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>Strict HIPAA Privacy Filter Active (Zero Clinical Data Streamed)</span>
        </div>
      </header>

      {/* Main split */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-3 gap-3">
        {/* Left: Active Dispatches */}
        <div className="w-full md:w-96 flex flex-col gap-3 overflow-y-auto">
          <div className="px-1 text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-blue-400" />
              Active Ambulance Corridors ({allActiveEmergencies.length})
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">
              {Object.values(activeCorridors).filter(Boolean).length} Green Signals
            </span>
          </div>

          {allActiveEmergencies.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-slate-400">
              No active emergency transit corridors currently dispatched.
            </div>
          ) : (
            allActiveEmergencies.map((emg) => {
              const isCorridorActive = activeCorridors[emg.emergencyId];
              const etaMin = Math.ceil(emg.etaSeconds / 60);
              const targetHosp = emg.destinationHospital || hospitals.find(h => h.hospitalId === emg.hospitalId);
              const hospitalName = targetHosp?.name || selectedHospital.name;

              return (
                <GlassCard key={emg.emergencyId} className={`p-4 border-white/10 transition-all ${isCorridorActive ? 'ring-1 ring-emerald-500/40' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">
                        {emg.ambulanceId}
                      </span>
                      <StatusPill severity={emg.severity} size="sm" />
                    </div>
                    <div className="text-xs font-bold text-blue-300 tabular-nums">
                      ETA {etaMin}m
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 mb-3">
                    <div>
                      <span className="text-slate-500">Destination: </span>
                      <strong className="text-white">{hospitalName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Route Status: </span>
                      <span className="text-emerald-400 font-semibold">{emg.status.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                <GlassButton
                  size="sm"
                  variant={isCorridorActive ? 'secondary' : 'primary'}
                  onClick={() => toggleCorridor(emg.emergencyId)}
                  className={`w-full text-xs font-semibold ${
                    isCorridorActive ? 'border-emerald-400/50 bg-emerald-950/30 text-emerald-300' : ''
                  }`}
                >
                  {isCorridorActive ? (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Green Corridor Synchronized
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      Activate Signal Priority
                    </span>
                  )}
                </GlassButton>
              </GlassCard>
            );
          }))}
        </div>

        {/* Right: Map */}
        <div className="flex-1 rounded-card overflow-hidden border border-white/10 shadow-2xl">
          <LiveOperationsMap className="h-full w-full" />
        </div>
      </div>
    </div>
  );
};
