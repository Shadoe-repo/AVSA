import React, { useState } from 'react';
import { EmergencyProvider } from './context/EmergencyContext';
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
  Sparkles,
  Layers
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeRole, setActiveRole } = useAuth();
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

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
