import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { StatusPill } from '../common/StatusPill';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { MedicalReportViewerModal } from './MedicalReportViewerModal';
import { MedicalReport } from '../../types';
import { 
  Heart, 
  Activity, 
  Wind, 
  Brain, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  ExternalLink,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const AmbulanceDetailInspector: React.FC = () => {
  const {
    selectedCase,
    selectedCaseVitals,
    selectedCaseReports,
    selectedHospital
  } = useEmergency();

  const [activeReportModal, setActiveReportModal] = useState<MedicalReport | null>(null);

  if (!selectedCase) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <Building2 className="w-12 h-12 text-slate-700 mb-3" />
        <p className="text-sm font-medium text-slate-400">Select an ambulance from the triage queue to inspect live clinical telemetry.</p>
      </div>
    );
  }

  const latestVital = selectedCaseVitals[selectedCaseVitals.length - 1];
  const isCritical = selectedCase.severity === 'CRITICAL';
  const etaMinutes = Math.ceil(selectedCase.etaSeconds / 60);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 text-white">
      {/* Case Header Card */}
      <GlassCard isCritical={isCritical} className="p-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-white tracking-wider">
                {selectedCase.ambulanceId}
              </span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-xs text-slate-300">
                {selectedCase.emergencyId}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Triage: <strong className="text-white">{selectedCase.emergencyType} Emergency</strong>
            </div>
          </div>

          <div className="text-right">
            <StatusPill severity={selectedCase.severity} isLive={isCritical} size="md" />
            <div className="text-xs text-blue-400 font-bold tabular-nums mt-1 flex items-center justify-end gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>ETA {etaMinutes > 0 ? `${etaMinutes} min` : 'Arrived'}</span>
            </div>
          </div>
        </div>

        {/* Live Status bar */}
        <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-blue-400" />
            Operational State: <strong className="text-white">{selectedCase.status.replace(/_/g, ' ')}</strong>
          </span>
          <span className="text-[11px] text-slate-400">
            Destination: {selectedHospital.name}
          </span>
        </div>
      </GlassCard>

      {/* Live Vitals Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-400" />
            Live Vital Stream ({selectedCaseVitals.length} readings)
          </span>
          {latestVital && (
            <span className="text-[10px] text-slate-500 tabular-nums">
              Latest: {new Date(latestVital.recordedAt).toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Heart Rate */}
          <div className={`p-3 rounded-2xl border ${
            (latestVital?.heartRate || 0) > 115 ? 'bg-red-950/20 border-red-500/50' : 'bg-white/5 border-white/10'
          }`}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-red-400" /> Heart Rate
            </span>
            <div className="text-2xl font-bold text-white tabular-nums my-0.5">
              {latestVital?.heartRate ?? '--'}
              <span className="text-xs text-slate-400 font-normal ml-1">BPM</span>
            </div>
            <span className={`text-[10px] font-semibold uppercase ${
              (latestVital?.heartRate || 0) > 115 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {(latestVital?.heartRate || 0) > 115 ? 'Tachycardia' : 'Stable'}
            </span>
          </div>

          {/* SpO2 */}
          <div className={`p-3 rounded-2xl border ${
            (latestVital?.spo2 || 100) < 90 ? 'bg-red-950/20 border-red-500/50' : 'bg-white/5 border-white/10'
          }`}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-blue-400" /> SpO₂ Oxygen
            </span>
            <div className="text-2xl font-bold text-white tabular-nums my-0.5">
              {latestVital?.spo2 ?? '--'}
              <span className="text-xs text-slate-400 font-normal ml-1">%</span>
            </div>
            <span className={`text-[10px] font-semibold uppercase ${
              (latestVital?.spo2 || 100) < 90 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {(latestVital?.spo2 || 100) < 90 ? 'Critical Hypoxia' : 'Normal'}
            </span>
          </div>

          {/* Blood Pressure */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-purple-400" /> Blood Pressure
            </span>
            <div className="text-2xl font-bold text-white tabular-nums my-0.5">
              {latestVital?.bloodPressure || '--/--'}
            </div>
            <span className="text-[10px] font-semibold uppercase text-slate-400">
              mmHg
            </span>
          </div>

          {/* Consciousness */}
          <div className={`p-3 rounded-2xl border ${
            latestVital?.consciousness === 'UNCONSCIOUS' ? 'bg-red-950/20 border-red-500/50' : 'bg-white/5 border-white/10'
          }`}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Brain className="w-3.5 h-3.5 text-yellow-400" /> Consciousness
            </span>
            <div className="text-lg font-bold text-white uppercase my-1 truncate">
              {latestVital?.consciousness || 'ALERT'}
            </div>
            <span className={`text-[10px] font-semibold uppercase ${
              latestVital?.consciousness === 'UNCONSCIOUS' ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {latestVital?.consciousness === 'UNCONSCIOUS' ? 'Unresponsive' : 'Responsive'}
            </span>
          </div>
        </div>
      </div>

      {/* In-Transit Treatment & Chief Complaint */}
      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Chief Clinical Complaint
          </span>
          <p className="text-xs text-slate-200">
            {selectedCase.chiefComplaint || 'Patient loaded into ambulance. Triage assessment ongoing.'}
          </p>
        </div>

        {selectedCase.currentTreatment && (
          <div className="pt-2 border-t border-white/10">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1 mb-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active In-Transit Therapy
            </span>
            <p className="text-xs text-slate-300">
              {selectedCase.currentTreatment}
            </p>
          </div>
        )}
      </div>

      {/* Cloudinary Medical Diagnostic Reports */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-400" />
            Medical Diagnostics ({selectedCaseReports.length})
          </span>
          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Encrypted Cloudinary Feed
          </span>
        </div>

        {selectedCaseReports.length === 0 ? (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-slate-400">
            No diagnostic images or ECGs received yet.
          </div>
        ) : (
          <div className="space-y-2">
            {selectedCaseReports.map((rep) => (
              <div
                key={rep.reportId}
                onClick={() => setActiveReportModal(rep)}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/40 cursor-pointer flex items-center justify-between gap-3 transition-all group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-xl flex-shrink-0">
                    {rep.reportType === 'ECG' ? '📈' : rep.reportType === 'XRAY' ? '🩻' : '🩸'}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-white group-hover:text-blue-300 truncate">
                      {rep.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {rep.cloudinaryPublicId}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-2.5 py-1 rounded-xl bg-blue-600/30 group-hover:bg-blue-600 border border-blue-400/40 text-blue-300 group-hover:text-white text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap transition-colors"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Report Viewer */}
      {activeReportModal && (
        <MedicalReportViewerModal
          report={activeReportModal}
          onClose={() => setActiveReportModal(null)}
        />
      )}
    </div>
  );
};
