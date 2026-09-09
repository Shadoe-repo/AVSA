import React, { useState, useEffect } from 'react';
import { EmergencyProvider, useEmergency } from './context/EmergencyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ParamedicApp } from './components/paramedic/ParamedicApp';
import { HospitalDashboard } from './components/hospital/HospitalDashboard';
import { TrafficCorridorView } from './components/traffic/TrafficCorridorView';
import { SnowflakeAnalyticsModal } from './components/analytics/SnowflakeAnalyticsModal';
import {
  Ambulance,
  Building2,
  TrafficCone,
  Database,
  Sun,
  MoonStar,
  Play,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeRole, setActiveRole } = useAuth();
  const { demoMode, setDemoMode } = useEmergency();
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('asva-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('asva-theme', theme);
  }, [theme]);

  return (
    <div className="relative min-h-screen bg-asva-bg">
      {/* Primary Role Views */}
      {activeRole === 'PARAMEDIC' && <ParamedicApp />}
      {activeRole === 'HOSPITAL' && <HospitalDashboard />}
      {activeRole === 'TRAFFIC' && <TrafficCorridorView />}

      {/* Floating System Switcher Dock (iOS 26 Floating Capsule) */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[2000] px-2 py-1.5 rounded-full bg-[#08131d]/90 backdrop-blur-strong border border-white/20 shadow-2xl flex items-center gap-1">
        <button
          onClick={() => setActiveRole('PARAMEDIC')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
            activeRole === 'PARAMEDIC'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Ambulance className="w-3.5 h-3.5" />
          <span>Paramedic</span>
        </button>

        <button
          onClick={() => setActiveRole('HOSPITAL')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
            activeRole === 'HOSPITAL'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Hospital ER</span>
        </button>

        <button
          onClick={() => setActiveRole('TRAFFIC')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
            activeRole === 'TRAFFIC'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <TrafficCone className="w-3.5 h-3.5" />
          <span>Traffic</span>
        </button>

        <div className="w-[1px] h-4 bg-white/20 mx-1" />

        <button
          onClick={() => setDemoMode(!demoMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
            demoMode ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
          title="Toggle demo mode"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Demo</span>
        </button>

        <button
          onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          className="flex items-center justify-center w-8 h-8 rounded-full text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200"
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <MoonStar className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => setShowAnalyticsModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-cyan-300 hover:text-white hover:bg-cyan-500/20 transition-all duration-200"
          title="Open Snowflake Data Warehouse"
        >
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Snowflake</span>
        </button>
      </div>

      {/* Snowflake Warehouse Modal */}
      {showAnalyticsModal && (
        <SnowflakeAnalyticsModal onClose={() => setShowAnalyticsModal(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <EmergencyProvider>
        <AppContent />
      </EmergencyProvider>
    </AuthProvider>
  );
}
