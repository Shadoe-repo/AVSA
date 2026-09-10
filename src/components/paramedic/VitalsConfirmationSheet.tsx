import React, { useState } from 'react';
import { VoiceExtractionResult, ConsciousnessLevel } from '../../types';
import { GlassButton } from '../common/GlassButton';
import { CheckCircle2, AlertTriangle, Heart, Activity, Wind, Brain, ShieldAlert, TestTube2 } from 'lucide-react';

interface VitalsConfirmationSheetProps {
  extraction: VoiceExtractionResult;
  onConfirm: (confirmedVitals: {
    heartRate: number;
    bloodPressure: string;
    spo2: number;
    respiratoryRate: number;
    consciousness: ConsciousnessLevel;
    treatment?: string;
    allergy?: string;
    bloodGlucose?: number;
  }) => void;
  onCancel: () => void;
}

export const VitalsConfirmationSheet: React.FC<VitalsConfirmationSheetProps> = ({
  extraction,
  onConfirm,
  onCancel
}) => {
  const [hr, setHr] = useState<number>(extraction.heartRate || 100);
  const [bp, setBp] = useState<string>(extraction.bloodPressure || '120/80');
  const [spo2, setSpo2] = useState<number>(extraction.spo2 || 95);
  const [rr, setRr] = useState<number>(extraction.respiratoryRate || 20);
  const [consciousness, setConsciousness] = useState<ConsciousnessLevel>(extraction.consciousness || 'ALERT');
  const [treatment, setTreatment] = useState<string>(extraction.treatment || 'Supplemental Oxygen, IV Line Established');
  const [allergy, setAllergy] = useState<string>(extraction.allergy || 'None reported');
  const [bloodGlucose, setBloodGlucose] = useState<number>(extraction.bloodGlucose || 96);

  const isAmbiguous = (field: string) => extraction.ambiguousFields.includes(field);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      heartRate: Number(hr),
      bloodPressure: bp,
      spo2: Number(spo2),
      respiratoryRate: Number(rr),
      consciousness,
      treatment,
      allergy,
      bloodGlucose: Number(bloodGlucose)
    });
  };

  return (
    <div className="crystal-modal p-6 w-full max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-6 duration-200">
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Paramedic Voice Verification
          </h3>
          <p className="text-xs text-slate-400">
            Review and confirm extracted medical values before syncing to hospital ER
          </p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold tabular-nums">
          {Math.round(extraction.confidenceScore * 100)}% Match
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vitals Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Heart Rate */}
          <div className={`p-3 rounded-2xl bg-white/5 border ${
            isAmbiguous('heartRate') ? 'border-amber-400 bg-amber-500/10' : 'border-white/10'
          }`}>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Heart className="w-3.5 h-3.5 text-red-400" /> Heart Rate (BPM)
            </label>
            <input
              type="number"
              value={hr}
              onChange={(e) => setHr(Number(e.target.value))}
              className="w-full bg-transparent text-xl font-bold text-white tabular-nums outline-none"
              required
            />
          </div>

          {/* SpO2 */}
          <div className={`p-3 rounded-2xl bg-white/5 border ${
            isAmbiguous('spo2') ? 'border-amber-400 bg-amber-500/10' : 'border-white/10'
          }`}>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-blue-400" /> SpO₂ Saturation
            </label>
            <div className="flex items-center">
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                className="w-full bg-transparent text-xl font-bold text-white tabular-nums outline-none"
                required
              />
              <span className="text-slate-400 font-bold">%</span>
            </div>
          </div>

          {/* Blood Pressure */}
          <div className={`p-3 rounded-2xl bg-white/5 border ${
            isAmbiguous('bloodPressure') ? 'border-amber-400 bg-amber-500/10' : 'border-white/10'
          }`}>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-purple-400" /> Blood Pressure
            </label>
            <input
              type="text"
              value={bp}
              onChange={(e) => setBp(e.target.value)}
              className="w-full bg-transparent text-xl font-bold text-white tabular-nums outline-none"
              placeholder="120/80"
              required
            />
          </div>

          {/* Respiratory Rate */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Wind className="w-3.5 h-3.5 text-teal-400" /> Resp. Rate (/min)
            </label>
            <input
              type="number"
              value={rr}
              onChange={(e) => setRr(Number(e.target.value))}
              className="w-full bg-transparent text-xl font-bold text-white tabular-nums outline-none"
              required
            />
          </div>

          {/* Blood Glucose */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <TestTube2 className="w-3.5 h-3.5 text-emerald-400" /> Blood Glucose
            </label>
            <div className="flex items-center">
              <input
                type="number"
                value={bloodGlucose}
                onChange={(e) => setBloodGlucose(Number(e.target.value))}
                className="w-full bg-transparent text-xl font-bold text-white tabular-nums outline-none"
                required
              />
              <span className="text-slate-400 font-bold">mg/dL</span>
            </div>
          </div>

          {/* Allergy */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Allergy
            </label>
            <input
              type="text"
              value={allergy}
              onChange={(e) => setAllergy(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-white outline-none"
              placeholder="None reported"
              required
            />
          </div>
        </div>

        {/* Consciousness Level Selector */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Brain className="w-3.5 h-3.5 text-yellow-400" /> Consciousness State
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['ALERT', 'VERBAL', 'PAIN', 'UNCONSCIOUS'] as ConsciousnessLevel[]).map((level) => (
              <button
                type="button"
                key={level}
                onClick={() => setConsciousness(level)}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  consciousness === level
                    ? level === 'UNCONSCIOUS' 
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/40' 
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-600/40'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Treatment Notes */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Immediate In-Transit Treatment
          </label>
          <input
            type="text"
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none"
            placeholder="e.g. Oxygen at 4L/min, IV access established"
          />
        </div>

        {extraction.ambiguousFields.length > 0 && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Yellow highlighted fields had lower acoustic confidence. Please review before committing.</span>
          </div>
        )}

        {/* Action CTAs */}
        <div className="flex gap-3 pt-2">
          <GlassButton type="button" variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="primary" className="flex-1">
            Confirm & Sync to ER
          </GlassButton>
        </div>
      </form>
    </div>
  );
};
