import React from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { StatusPill } from '../common/StatusPill';
import { Ambulance, Heart, Activity, AlertTriangle, Clock } from 'lucide-react';

interface IncomingAmbulanceQueueProps {
  onSelectCase: (emergencyId: string) => void;
  selectedCaseId: string | null;
}

export const IncomingAmbulanceQueue: React.FC<IncomingAmbulanceQueueProps> = ({
  onSelectCase,
  selectedCaseId
}) => {
  const { hospitalEmergencies, selectedHospital } = useEmergency();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Incoming Triage Queue ({hospitalEmergencies.length})
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          Rank: Severity &rarr; ETA
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {hospitalEmergencies.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">No incoming ambulances currently dispatched.</p>
            <p className="text-[11px] text-slate-500 mt-1">Ambulances selecting {selectedHospital.name} will appear here in real time.</p>
          </div>
        ) : (
          hospitalEmergencies.map((emg) => {
            const isSelected = selectedCaseId === emg.emergencyId;
            const isCritical = emg.severity === 'CRITICAL';
            const etaMin = Math.ceil(emg.etaSeconds / 60);

            return (
              <div
                key={emg.emergencyId}
                onClick={() => onSelectCase(emg.emergencyId)}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border relative overflow-hidden ${
                  isSelected
                    ? 'border-blue-400 bg-blue-500/15 ring-2 ring-blue-500/30 shadow-lg shadow-blue-900/30'
                    : isCritical
                    ? 'crystal-critical'
                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                }`}
              >
                {/* Top header row: Ambulance ID + Live Badge + Severity */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white tracking-wide">
                      {emg.ambulanceId}
                    </span>
                    <StatusPill severity={emg.severity} size="sm" isLive={isCritical} />
                  </div>

                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-[11px] font-bold text-white tabular-nums border border-white/10">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span>{etaMin > 0 ? `${etaMin} min` : 'Arriving'}</span>
                  </div>
                </div>

                {/* Emergency Classification & Case ID */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300 font-semibold">
                    {emg.emergencyType} Emergency
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {emg.emergencyId}
                  </span>
                </div>

                {/* Patient status snippet */}
                <div className="p-2 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 truncate max-w-[170px]">
                    {emg.chiefComplaint || 'Patient in transit'}
                  </span>
                  <span className={`font-semibold uppercase tracking-wider ${
                    emg.status === 'ARRIVED' ? 'text-emerald-400' : 'text-blue-400'
                  }`}>
                    {emg.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
