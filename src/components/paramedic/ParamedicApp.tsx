import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { StatusPill } from '../common/StatusPill';
import { LiveOperationsMap } from '../map/LiveOperationsMap';
import { VoiceInputOrb } from './VoiceInputOrb';
import { VitalsConfirmationSheet } from './VitalsConfirmationSheet';
import { MedicalReportUploadModal } from './MedicalReportUploadModal';
import { HospitalSelectionModal } from './HospitalSelectionModal';
import { VoiceExtractionResult } from '../../types';
import { 
  Heart, 
  Activity, 
  Brain, 
  Building2, 
  Navigation, 
  FileUp, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertOctagon, 
  Radio,
  FileText
} from 'lucide-react';

export const ParamedicApp: React.FC = () => {
  const {
    activeAmbulance,
    activeEmergency,
    hospitals,
    currentVitals,
    reports,
    startEmergency,
    selectHospital,
    updateVitals,
    updateTreatment,
    addReport,
    updateStatus,
    toggleSimulation,
    isSimulatingMovement,
    resetEmergency
  } = useEmergency();

  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pendingVoiceExtraction, setPendingVoiceExtraction] = useState<VoiceExtractionResult | null>(null);

  const isCritical = activeEmergency?.severity === 'CRITICAL';
  const targetHospital = hospitals.find(h => h.hospitalId === activeEmergency?.hospitalId);

  const handleStartCardiacCase = () => {
    startEmergency('CARDIAC', 'CRITICAL');
  };

  const handleStartTraumaCase = () => {
    startEmergency('TRAUMA', 'CRITICAL');
  };

  const handleVoiceExtracted = (result: VoiceExtractionResult) => {
    setPendingVoiceExtraction(result);
  };

  const handleConfirmVitals = (confirmed: any) => {
    updateVitals({
      heartRate: confirmed.heartRate,
      bloodPressure: confirmed.bloodPressure,
      spo2: confirmed.spo2,
      respiratoryRate: confirmed.respiratoryRate,
      consciousness: confirmed.consciousness
    });
    if (confirmed.treatment) {
      updateTreatment(confirmed.treatment);
    }
    setPendingVoiceExtraction(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-asva-bg text-white pb-16">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 px-4 py-3 bg-[#071018]/85 backdrop-blur-crystal border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/asva_logo.png" alt="ASVA Logo" className="w-9 h-9 rounded-xl object-cover shadow-md shadow-blue-500/20" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-white">ASVA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Live Net</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Vehicle: <span className="text-white font-semibold">{activeAmbulance.vehicleNumber}</span> ({activeAmbulance.ambulanceId})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeEmergency && (
            <GlassButton
              size="sm"
              variant={isSimulatingMovement ? 'secondary' : 'primary'}
              onClick={toggleSimulation}
              icon={isSimulatingMovement ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              {isSimulatingMovement ? 'Pause GPS' : 'Simulate GPS'}
            </GlassButton>
          )}

          <button
            onClick={resetEmergency}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1"
            title="Reset to default scenarios"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 max-w-4xl mx-auto w-full space-y-4 flex-1">
        {/* If NO active emergency: Show Standby / 1-Tap Emergency Trigger */}
        {!activeEmergency ? (
          <div className="py-8 space-y-6">
            <GlassCard className="text-center py-10 px-6 border-blue-500/30 bg-gradient-to-b from-blue-950/20 to-transparent">
              <div className="w-16 h-16 rounded-3xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center mx-auto mb-4 text-blue-400 shadow-xl shadow-blue-500/20">
                <Radio className="w-8 h-8 animate-pulse" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                Ready for Dispatch
              </h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-8">
                Ambulance <strong className="text-white">{activeAmbulance.ambulanceId}</strong> is operational. Patient name is optional and will not delay triage routing.
              </p>

              <div className="max-w-xs mx-auto space-y-3">
                <GlassButton
                  size="lg"
                  variant="critical"
                  onClick={handleStartCardiacCase}
                  className="w-full text-base font-bold shadow-2xl shadow-red-600/40 py-4 h-auto"
                >
                  <AlertOctagon className="w-5 h-5 mr-2" />
                  START CRITICAL CARDIAC EMERGENCY
                </GlassButton>

                <GlassButton
                  size="md"
                  variant="secondary"
                  onClick={handleStartTraumaCase}
                  className="w-full text-xs font-semibold"
                >
                  Start Severe Trauma Emergency
                </GlassButton>
              </div>
            </GlassCard>

            <div className="text-center">
              <span className="text-xs text-slate-500">
                Connected to Cloud Firestore & Cloudinary Medical Ingestion Pipeline
              </span>
            </div>
          </div>
        ) : (
          /* ACTIVE EMERGENCY IN PROGRESS */
          <div className="space-y-4">
            {/* Case Header Banner */}
            <GlassCard isCritical={isCritical} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isCritical ? 'bg-red-500 animate-ping' : 'bg-blue-500'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white tracking-wide">
                        Case {activeEmergency.emergencyId.replace('EMG-', '')}
                      </span>
                      <StatusPill severity={activeEmergency.severity} isLive size="sm" />
                      <StatusPill status={activeEmergency.status} size="sm" />
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Type: <strong className="text-white font-semibold">{activeEmergency.emergencyType}</strong>
                      {activeEmergency.patientAge && ` • Age: ${activeEmergency.patientAge}`}
                    </div>
                  </div>
                </div>

                {/* Destination & ETA pill */}
                <div className="flex items-center gap-2">
                  {targetHospital ? (
                    <div
                      onClick={() => setShowHospitalModal(true)}
                      className="cursor-pointer px-3 py-1.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 flex items-center gap-2 transition-all"
                    >
                      <Building2 className="w-4 h-4 text-blue-400" />
                      <div className="text-left">
                        <div className="text-xs font-bold text-white truncate max-w-[150px]">
                          {targetHospital.name}
                        </div>
                        <div className="text-[10px] text-blue-300 tabular-nums">
                          ETA {Math.ceil(activeEmergency.etaSeconds / 60)}m • {targetHospital.availableBeds} beds
                        </div>
                      </div>
                    </div>
                  ) : (
                    <GlassButton
                      size="sm"
                      variant="primary"
                      onClick={() => setShowHospitalModal(true)}
                      icon={<Building2 className="w-3.5 h-3.5" />}
                    >
                      Select Destination Hospital
                    </GlassButton>
                  )}
                </div>
              </div>

              {/* Status progression bar */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-blue-400" />
                  Status: <strong className="text-white">{activeEmergency.status.replace(/_/g, ' ')}</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  {activeEmergency.status === 'PATIENT_RECEIVED' && (
                    <button
                      onClick={() => setShowHospitalModal(true)}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline"
                    >
                      Route to Hospital &rarr;
                    </button>
                  )}
                  {activeEmergency.status === 'EN_ROUTE' && (
                    <button
                      onClick={() => updateStatus('APPROACHING')}
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300"
                    >
                      Mark Approaching &rarr;
                    </button>
                  )}
                  {activeEmergency.status === 'APPROACHING' && (
                    <button
                      onClick={() => updateStatus('ARRIVED')}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                    >
                      Confirm Arrival &rarr;
                    </button>
                  )}
                  {activeEmergency.status === 'ARRIVED' && (
                    <button
                      onClick={() => updateStatus('COMPLETED')}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                    >
                      Complete Handover &rarr;
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Tactical Live Map View */}
            <div className="h-64 sm:h-72 w-full rounded-card overflow-hidden">
              <LiveOperationsMap
                className="h-full w-full"
                focusAmbulanceId={activeAmbulance.ambulanceId}
              />
            </div>

            {/* Medical Vitals Monitor (TRD Section 11 & UI/UX Section 13) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Live Patient Telemetry
                </span>
                <span className="text-[11px] text-slate-500 tabular-nums">
                  Updated: {currentVitals?.recordedAt ? new Date(currentVitals.recordedAt).toLocaleTimeString() : 'Telemetry Active'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Heart Rate */}
                <GlassCard className={`p-3.5 text-center ${
                  (currentVitals?.heartRate || 0) > 115 || (currentVitals?.heartRate || 0) < 50 
                    ? 'border-red-500/60 bg-red-950/20' 
                    : ''
                }`}>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-red-400" /> Heart Rate
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums my-1">
                    {currentVitals?.heartRate ?? '--'}
                    <span className="text-xs text-slate-400 font-normal ml-1">BPM</span>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase ${
                    (currentVitals?.heartRate || 0) > 115 ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {(currentVitals?.heartRate || 0) > 115 ? 'Tachycardia' : 'Stable'}
                  </span>
                </GlassCard>

                {/* SpO2 */}
                <GlassCard className={`p-3.5 text-center ${
                  (currentVitals?.spo2 || 100) < 90 
                    ? 'border-red-500/60 bg-red-950/20' 
                    : ''
                }`}>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-blue-400" /> SpO₂ Oxygen
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums my-1">
                    {currentVitals?.spo2 ?? '--'}
                    <span className="text-xs text-slate-400 font-normal ml-1">%</span>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase ${
                    (currentVitals?.spo2 || 100) < 90 ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {(currentVitals?.spo2 || 100) < 90 ? 'Severe Hypoxia' : 'Normal'}
                  </span>
                </GlassCard>

                {/* Blood Pressure */}
                <GlassCard className="p-3.5 text-center">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-purple-400" /> Blood Press.
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums my-1">
                    {currentVitals?.bloodPressure || '--/--'}
                  </div>
                  <span className="text-[10px] font-semibold uppercase text-slate-400">
                    mmHg
                  </span>
                </GlassCard>

                {/* Consciousness */}
                <GlassCard className={`p-3.5 text-center ${
                  currentVitals?.consciousness === 'UNCONSCIOUS' 
                    ? 'border-red-500/60 bg-red-950/20' 
                    : ''
                }`}>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
                    <Brain className="w-3.5 h-3.5 text-yellow-400" /> Consciousness
                  </span>
                  <div className="text-lg sm:text-xl font-bold text-white uppercase my-2 truncate">
                    {currentVitals?.consciousness || 'ALERT'}
                  </div>
                  <span className={`text-[10px] font-semibold uppercase ${
                    currentVitals?.consciousness === 'UNCONSCIOUS' ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {currentVitals?.consciousness === 'UNCONSCIOUS' ? 'Unresponsive' : 'Responsive'}
                  </span>
                </GlassCard>
              </div>
            </div>

            {/* In-Transit Treatment & Notes */}
            {activeEmergency.currentTreatment && (
              <GlassCard className="p-3 bg-white/5 border-white/10 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <strong className="text-white block mb-0.5">Administered In-Transit Treatment:</strong>
                  <span className="text-slate-300">{activeEmergency.currentTreatment}</span>
                </div>
              </GlassCard>
            )}

            {/* Voice-First Medical Entry (The Signature Voice Orb) */}
            <GlassCard className="border-purple-500/30 bg-purple-950/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Radio className="w-4 h-4" />
                  Voice-First Clinical Telemetry
                </span>
                <span className="text-[10px] text-purple-300">
                  Natural Speech &rarr; Structured AI Extraction
                </span>
              </div>
              <VoiceInputOrb onExtractionComplete={handleVoiceExtracted} />
            </GlassCard>

            {/* Medical Reports Section */}
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Diagnostic Reports ({reports.length})
                  </span>
                </div>
                <GlassButton
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowUploadModal(true)}
                  icon={<FileUp className="w-3.5 h-3.5" />}
                >
                  + Upload Diagnostic
                </GlassButton>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  No ECGs or medical scans uploaded yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {reports.map((report) => (
                    <div
                      key={report.reportId}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="text-xl">
                          {report.reportType === 'ECG' ? '📈' : report.reportType === 'XRAY' ? '🩻' : '🩸'}
                        </span>
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-white truncate">{report.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            {report.cloudinaryPublicId}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold whitespace-nowrap">
                        Synced
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        )}
      </main>

      {/* Voice Confirmation Sheet Modal */}
      {pendingVoiceExtraction && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <VitalsConfirmationSheet
            extraction={pendingVoiceExtraction}
            onConfirm={handleConfirmVitals}
            onCancel={() => setPendingVoiceExtraction(null)}
          />
        </div>
      )}

      {/* Hospital Selection Modal */}
      {showHospitalModal && (
        <HospitalSelectionModal
          hospitals={hospitals}
          currentSelectedHospitalId={activeEmergency?.hospitalId}
          onSelectHospital={(id) => {
            selectHospital(id);
            setShowHospitalModal(false);
          }}
          onClose={() => setShowHospitalModal(false)}
        />
      )}

      {/* Medical Report Upload Modal */}
      {showUploadModal && activeEmergency && (
        <MedicalReportUploadModal
          emergencyId={activeEmergency.emergencyId}
          ambulanceId={activeEmergency.ambulanceId}
          onUploadSuccess={(report) => {
            addReport(report);
            setShowUploadModal(false);
          }}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
};
