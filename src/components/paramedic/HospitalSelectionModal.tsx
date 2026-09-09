import React from 'react';
import { Hospital } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { useEmergency } from '../../context/EmergencyContext';
import { calculateDistanceKm, estimateEtaMinutes } from '../../services/routingService';
import { Building2, Navigation, Bed, CheckCircle2, X } from 'lucide-react';

interface HospitalSelectionModalProps {
  hospitals: Hospital[];
  currentSelectedHospitalId?: string | null;
  onSelectHospital: (hospitalId: string) => void;
  onClose?: () => void;
}

export const HospitalSelectionModal: React.FC<HospitalSelectionModalProps> = ({
  hospitals,
  currentSelectedHospitalId,
  onSelectHospital,
  onClose
}) => {
  const { activeEmergency, activeAmbulance } = useEmergency();
  const currentCoords = activeEmergency?.currentLocation || activeAmbulance.currentCoordinates;

  // Dynamically compute real-time distance and ETA from vehicle's current position
  const hospitalsWithDynamicMetrics = hospitals.map(h => {
    const dist = calculateDistanceKm(currentCoords, h.coordinates);
    const eta = estimateEtaMinutes(dist);
    return {
      ...h,
      dynamicDistanceKm: dist,
      dynamicEtaMinutes: eta
    };
  });

  // Sort hospitals by recommendation: Available beds + Distance
  const sorted = [...hospitalsWithDynamicMetrics].sort((a, b) => {
    // Score based on distance (shorter is better) and bed capacity (more is better)
    const scoreA = a.dynamicDistanceKm * 2 - (a.availableBeds || 0) * 0.5;
    const scoreB = b.dynamicDistanceKm * 2 - (b.availableBeds || 0) * 0.5;
    return scoreA - scoreB;
  });

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="crystal-modal p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Destination ER Selection
            </h3>
            <p className="text-xs text-slate-400">
              Ranked by live ER bed availability, ICU capability & travel ETA
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-3 mb-5">
          {sorted.map((hospital, index) => {
            const isRecommended = index === 0;
            const isSelected = currentSelectedHospitalId === hospital.hospitalId;

            return (
              <GlassCard
                key={hospital.hospitalId}
                isElevated={isRecommended || isSelected}
                className={`transition-all duration-200 border ${
                  isSelected
                    ? 'border-blue-400 bg-blue-500/15 ring-2 ring-blue-500/30'
                    : isRecommended
                    ? 'border-emerald-400/60 bg-emerald-950/20'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-white text-base">
                        {hospital.name}
                      </span>
                      {isRecommended && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold tracking-wider uppercase">
                          ★ Recommended
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-300 mb-2">
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5 text-blue-400" />
                        <strong className="text-white tabular-nums">{hospital.dynamicDistanceKm} km</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-emerald-400" />
                        <strong className="text-emerald-400 tabular-nums">{hospital.availableBeds} beds</strong>
                        <span className="text-slate-400">({hospital.icuBeds} ICU)</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-blue-300 font-semibold tabular-nums">
                        ETA {hospital.dynamicEtaMinutes} min
                      </span>
                    </div>

                    {/* Capabilities Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {hospital.capabilities.slice(0, 3).map((cap) => (
                        <span
                          key={cap}
                          className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-400 font-medium tracking-wide"
                        >
                          {cap.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                    <GlassButton
                      size="sm"
                      variant={isSelected ? 'secondary' : 'primary'}
                      onClick={() => onSelectHospital(hospital.hospitalId)}
                      className="whitespace-nowrap w-full sm:w-auto"
                    >
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                        </span>
                      ) : (
                        'Select Hospital'
                      )}
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
