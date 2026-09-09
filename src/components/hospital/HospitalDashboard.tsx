import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { useAuth } from '../../context/AuthContext';
import appLogo from '../../assets/asva_logo.png';
import { IncomingAmbulanceQueue } from './IncomingAmbulanceQueue';
import { AmbulanceDetailInspector } from './AmbulanceDetailInspector';
import { LiveOperationsMap } from '../map/LiveOperationsMap';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { 
  Building2, 
  Bed, 
  UserCheck, 
  ShieldCheck, 
  LogOut, 
  Maximize2, 
  Activity, 
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

export const HospitalDashboard: React.FC = () => {
  const {
    hospitals,
    selectedHospitalId,
    selectedHospital,
    setSelectedHospitalId,
    selectedCaseId,
    setSelectedCaseId,
    hospitalEmergencies,
    allActiveEmergencies,
    resetEmergency
  } = useEmergency();

  const { currentUser, loginWithGoogle } = useAuth();
  const [mobileTab, setMobileTab] = useState<'QUEUE' | 'MAP' | 'DETAILS'>('MAP');

  return (
    <div className="flex flex-col h-screen bg-asva-bg text-white overflow-hidden">
      {/* Hospital Ops Top Navigation Bar */}
      <header className="px-4 py-3 bg-[#071018]/90 backdrop-blur-crystal border-b border-white/10 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <img src={appLogo} alt="ASVA" className="w-8 h-8 rounded-full object-cover shadow-md shadow-blue-500/20" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">ASVA ER Command</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Hub
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Hospital Scoped:</span>
              <strong className="text-white font-medium">{selectedHospital.name}</strong>
            </div>
          </div>
        </div>

        {/* Center: Bed Availability & Hospital Selector */}
        <div className="hidden md:flex items-center gap-3">
          {/* Hospital Scope Switcher (TRD: Hospital isolation demo) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
            <Building2 className="w-4 h-4 text-blue-400" />
            <select
              value={selectedHospitalId}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedHospitalId(newId);
                loginWithGoogle(newId);
                const hospitalCases = allActiveEmergencies.filter(em => em.hospitalId === newId);
                setSelectedCaseId(hospitalCases.length > 0 ? hospitalCases[0].emergencyId : null);
              }}
              className="bg-transparent text-white font-semibold outline-none cursor-pointer pr-2"
            >
              {hospitals.map(h => (
                <option key={h.hospitalId} value={h.hospitalId} className="bg-slate-900 text-white">
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bed Telemetry */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300">
            <Bed className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>{selectedHospital.availableBeds}</strong> ER Beds Available (<strong className="text-white">{selectedHospital.icuBeds}</strong> ICU)
            </span>
          </div>
        </div>

        {/* Right: Authenticated User Lockup */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
              {currentUser?.name.charAt(0) || 'D'}
            </div>
            <div className="text-left">
              <div className="text-[11px] font-bold text-white leading-tight">
                {currentUser?.name || 'Dr. Debanjan Chatterjee, MD'}
              </div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                {currentUser?.role || 'ER Chief'} • Google Auth
              </div>
            </div>
          </div>

          <button
            onClick={resetEmergency}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors text-xs"
            title="Reset to default scenarios"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden bg-slate-900/60 border-b border-white/10 p-1.5 gap-1.5 text-xs">
        <button
          onClick={() => setMobileTab('QUEUE')}
          className={`flex-1 py-1.5 rounded-xl font-semibold transition-colors ${
            mobileTab === 'QUEUE' ? 'bg-blue-600 text-white' : 'text-slate-400'
          }`}
        >
          Queue ({hospitalEmergencies.length})
        </button>
        <button
          onClick={() => setMobileTab('MAP')}
          className={`flex-1 py-1.5 rounded-xl font-semibold transition-colors ${
            mobileTab === 'MAP' ? 'bg-blue-600 text-white' : 'text-slate-400'
          }`}
        >
          Tactical Map
        </button>
        <button
          onClick={() => setMobileTab('DETAILS')}
          className={`flex-1 py-1.5 rounded-xl font-semibold transition-colors ${
            mobileTab === 'DETAILS' ? 'bg-blue-600 text-white' : 'text-slate-400'
          }`}
        >
          Case Inspector
        </button>
      </div>

      {/* Main 3-Column Operational Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Incoming Ambulance Queue */}
        <aside className={`w-full lg:w-80 xl:w-96 flex-shrink-0 border-r border-white/10 bg-[#08131d]/60 backdrop-blur-md ${
          mobileTab === 'QUEUE' ? 'block' : 'hidden lg:block'
        }`}>
          <IncomingAmbulanceQueue
            selectedCaseId={selectedCaseId}
            onSelectCase={(id) => {
              setSelectedCaseId(id);
              setMobileTab('DETAILS');
            }}
          />
        </aside>

        {/* Center Column: Live Tactical Map with Ambulance Corridors */}
        <section className={`flex-1 flex flex-col min-w-0 p-3 relative ${
          mobileTab === 'MAP' ? 'flex' : 'hidden lg:flex'
        }`}>
          <div className="flex-1 rounded-card overflow-hidden relative shadow-2xl">
            <LiveOperationsMap
              onSelectCase={(id) => {
                setSelectedCaseId(id);
                setMobileTab('DETAILS');
              }}
              focusAmbulanceId="AMB-1047"
            />
          </div>
        </section>

        {/* Right Column: Case Detail Inspector */}
        <aside className={`w-full lg:w-80 xl:w-96 flex-shrink-0 border-l border-white/10 bg-[#08131d]/60 backdrop-blur-md ${
          mobileTab === 'DETAILS' ? 'block' : 'hidden lg:block'
        }`}>
          <AmbulanceDetailInspector />
        </aside>
      </div>
    </div>
  );
};
