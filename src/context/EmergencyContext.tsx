import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  EmergencyCase, 
  Hospital, 
  Ambulance, 
  VitalsRecord, 
  MedicalReport, 
  Coordinates,
  EmergencyType,
  EmergencySeverity,
  EmergencyStatus
} from '../types';
import { 
  INITIAL_HOSPITALS, 
  INITIAL_AMBULANCES, 
  INITIAL_EMERGENCIES, 
  INITIAL_VITALS, 
  INITIAL_REPORTS 
} from '../data/initialData';
import { generateRoutePoints, checkHospitalGeofence, calculateDistanceKm, estimateEtaMinutes } from '../services/routingService';
import { snowflakeWarehouse } from '../services/snowflakeSync';

interface EmergencyContextType {
  // Paramedic View State
  activeAmbulance: Ambulance;
  activeEmergency: EmergencyCase | null;
  hospitals: Hospital[];
  vitalsHistory: VitalsRecord[];
  currentVitals: VitalsRecord | null;
  reports: MedicalReport[];
  routeCoordinates: Coordinates[];
  isSimulatingMovement: boolean;
  simulationStep: number;

  // Hospital View State
  hospitalEmergencies: EmergencyCase[];
  allActiveEmergencies: EmergencyCase[];
  selectedHospitalId: string;
  selectedHospital: Hospital;
  selectedCaseId: string | null;
  selectedCase: EmergencyCase | null;
  selectedCaseVitals: VitalsRecord[];
  selectedCaseReports: MedicalReport[];
  
  // Paramedic Actions
  startEmergency: (type?: EmergencyType, severity?: EmergencySeverity) => EmergencyCase;
  selectHospital: (hospitalId: string) => void;
  updateVitals: (vitals: Partial<VitalsRecord>) => void;
  updateTreatment: (treatment: string) => void;
  updateEmergencyDetails: (details: Partial<EmergencyCase>) => void;
  addReport: (report: MedicalReport) => void;
  updateStatus: (status: EmergencyStatus) => void;
  toggleSimulation: () => void;
  resetEmergency: () => void;

  // Hospital Actions
  setSelectedHospitalId: (id: string) => void;
  setSelectedCaseId: (id: string | null) => void;

  // Global Helpers
  connectionStatus: 'ONLINE_SYNC' | 'LOCAL_ACTIVE';
}

const EmergencyContext = createContext<EmergencyContextType | null>(null);

const STORAGE_KEY_CASES = 'asva_cases_v2';
const STORAGE_KEY_VITALS = 'asva_vitals_v2';
const STORAGE_KEY_REPORTS = 'asva_reports_v2';

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Cross-tab real-time communication channel
  const broadcastRef = useRef<BroadcastChannel | null>(null);

  // Active paramedic ambulance (AMB-1047 as per specification)
  const [activeAmbulance] = useState<Ambulance>(INITIAL_AMBULANCES[0]);
  const [hospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('HOSP-021');

  // Emergency state
  const [emergencies, setEmergencies] = useState<EmergencyCase[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CASES);
      return saved ? JSON.parse(saved) : INITIAL_EMERGENCIES;
    } catch {
      return INITIAL_EMERGENCIES;
    }
  });

  const [vitalsMap, setVitalsMap] = useState<Record<string, VitalsRecord[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VITALS);
      return saved ? JSON.parse(saved) : INITIAL_VITALS;
    } catch {
      return INITIAL_VITALS;
    }
  });

  const [reportsMap, setReportsMap] = useState<Record<string, MedicalReport[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REPORTS);
      return saved ? JSON.parse(saved) : INITIAL_REPORTS;
    } catch {
      return INITIAL_REPORTS;
    }
  });

  // Paramedic active emergency
  const activeEmergency = emergencies.find(e => e.ambulanceId === activeAmbulance.ambulanceId && e.status !== 'COMPLETED') || null;

  // Selected case on Hospital Dashboard
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(activeEmergency?.emergencyId || 'EMG-82931');

  // Live navigation & simulation state
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinates[]>([]);
  const [isSimulatingMovement, setIsSimulatingMovement] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const simulationTimerRef = useRef<number | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CASES, JSON.stringify(emergencies));
      localStorage.setItem(STORAGE_KEY_VITALS, JSON.stringify(vitalsMap));
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reportsMap));
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }, [emergencies, vitalsMap, reportsMap]);

  // Setup BroadcastChannel for real-time cross-tab updates
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('asva_realtime_events');
      broadcastRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'EMERGENCY_UPDATED') {
          setEmergencies(prev => {
            const index = prev.findIndex(c => c.emergencyId === payload.emergencyId);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = payload;
              return updated;
            }
            return [payload, ...prev];
          });
        } else if (type === 'VITALS_ADDED') {
          setVitalsMap(prev => ({
            ...prev,
            [payload.emergencyId]: [...(prev[payload.emergencyId] || []), payload.vital]
          }));
        } else if (type === 'REPORT_ADDED') {
          setReportsMap(prev => ({
            ...prev,
            [payload.emergencyId]: [...(prev[payload.emergencyId] || []), payload.report]
          }));
        }
      };

      return () => {
        channel.close();
      };
    }
  }, []);

  // Broadcast helper
  const notifyPeers = (type: string, payload: any) => {
    if (broadcastRef.current) {
      broadcastRef.current.postMessage({ type, payload });
    }
  };

  // Re-generate route coordinates whenever active emergency has a selected hospital
  useEffect(() => {
    if (activeEmergency && activeEmergency.destinationHospital) {
      const start = activeEmergency.currentLocation;
      const dest = activeEmergency.destinationHospital.coordinates;
      const pts = generateRoutePoints(start, dest, 30);
      setRouteCoordinates(pts);
    } else if (activeEmergency && activeEmergency.hospitalId) {
      const targetHosp = hospitals.find(h => h.hospitalId === activeEmergency.hospitalId);
      if (targetHosp) {
        const pts = generateRoutePoints(activeEmergency.currentLocation, targetHosp.coordinates, 30);
        setRouteCoordinates(pts);
      }
    } else {
      setRouteCoordinates([]);
    }
  }, [activeEmergency?.emergencyId, activeEmergency?.hospitalId]);

  // Start Emergency (1-tap workflow from TRD)
  const startEmergency = (
    type: EmergencyType = 'CARDIAC', 
    severity: EmergencySeverity = 'CRITICAL'
  ): EmergencyCase => {
    const newId = `EMG-${Math.floor(10000 + Math.random() * 90000)}`;
    const newCase: EmergencyCase = {
      emergencyId: newId,
      ambulanceId: activeAmbulance.ambulanceId,
      hospitalId: null,
      emergencyType: type,
      severity: severity,
      status: 'PATIENT_RECEIVED',
      etaSeconds: 600,
      currentLocation: activeAmbulance.currentCoordinates,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chiefComplaint: 'Patient in critical condition. Hospital triage routing initiated.'
    };

    // Initial vital reading
    const initialVital: VitalsRecord = {
      vitalId: `VIT-${Date.now().toString().slice(-4)}`,
      emergencyId: newId,
      heartRate: severity === 'CRITICAL' ? 120 : 96,
      bloodPressure: severity === 'CRITICAL' ? '90/60' : '120/80',
      spo2: severity === 'CRITICAL' ? 86 : 95,
      respiratoryRate: severity === 'CRITICAL' ? 24 : 18,
      temperature: 36.8,
      consciousness: severity === 'CRITICAL' ? 'UNCONSCIOUS' : 'ALERT',
      recordedAt: new Date().toISOString()
    };

    // Archive any prior active case for this vehicle and add new one
    setEmergencies(prev => [
      newCase,
      ...prev.map(e => e.ambulanceId === activeAmbulance.ambulanceId && e.status !== 'COMPLETED'
        ? { ...e, status: 'COMPLETED' as EmergencyStatus, completedAt: new Date().toISOString() }
        : e
      )
    ]);
    setVitalsMap(prev => ({ ...prev, [newId]: [initialVital] }));
    setSelectedCaseId(newId);
    setSimulationStep(0);
    setIsSimulatingMovement(false);

    snowflakeWarehouse.syncEmergency(newCase);
    snowflakeWarehouse.syncVitals(initialVital);
    notifyPeers('EMERGENCY_UPDATED', newCase);
    notifyPeers('VITALS_ADDED', { emergencyId: newId, vital: initialVital });

    return newCase;
  };

  // Hospital Selection
  const selectHospital = (hospitalId: string) => {
    if (!activeEmergency) return;
    const dest = hospitals.find(h => h.hospitalId === hospitalId) || null;
    const dist = dest ? calculateDistanceKm(activeEmergency.currentLocation, dest.coordinates) : 4.5;
    const etaMin = estimateEtaMinutes(dist);

    setSimulationStep(0); // Reset simulation position to start of new route

    const updated: EmergencyCase = {
      ...activeEmergency,
      hospitalId,
      destinationHospital: dest,
      status: 'EN_ROUTE',
      etaSeconds: etaMin * 60,
      updatedAt: new Date().toISOString()
    };

    setEmergencies(prev => prev.map(c => c.emergencyId === updated.emergencyId ? updated : c));
    snowflakeWarehouse.syncEmergency(updated);
    notifyPeers('EMERGENCY_UPDATED', updated);
  };

  // In-Transit Treatment update (preserves state immutability)
  const updateTreatment = (treatment: string) => {
    if (!activeEmergency) return;
    const updated: EmergencyCase = {
      ...activeEmergency,
      currentTreatment: treatment,
      updatedAt: new Date().toISOString()
    };
    setEmergencies(prev => prev.map(c => c.emergencyId === updated.emergencyId ? updated : c));
    snowflakeWarehouse.syncEmergency(updated);
    notifyPeers('EMERGENCY_UPDATED', updated);
  };

  // Emergency Case Details update
  const updateEmergencyDetails = (details: Partial<EmergencyCase>) => {
    if (!activeEmergency) return;
    const updated: EmergencyCase = {
      ...activeEmergency,
      ...details,
      updatedAt: new Date().toISOString()
    };
    setEmergencies(prev => prev.map(c => c.emergencyId === updated.emergencyId ? updated : c));
    snowflakeWarehouse.syncEmergency(updated);
    notifyPeers('EMERGENCY_UPDATED', updated);
  };

  // Update Vitals
  const updateVitals = (vitalsData: Partial<VitalsRecord>) => {
    if (!activeEmergency) return;
    const currentList = vitalsMap[activeEmergency.emergencyId] || [];
    const latest = currentList[currentList.length - 1];

    const newRecord: VitalsRecord = {
      vitalId: `VIT-${Date.now().toString().slice(-4)}`,
      emergencyId: activeEmergency.emergencyId,
      heartRate: vitalsData.heartRate !== undefined ? vitalsData.heartRate : latest?.heartRate || 100,
      bloodPressure: vitalsData.bloodPressure !== undefined ? vitalsData.bloodPressure : latest?.bloodPressure || '110/70',
      spo2: vitalsData.spo2 !== undefined ? vitalsData.spo2 : latest?.spo2 || 94,
      respiratoryRate: vitalsData.respiratoryRate !== undefined ? vitalsData.respiratoryRate : latest?.respiratoryRate || 20,
      temperature: vitalsData.temperature !== undefined ? vitalsData.temperature : latest?.temperature || 37.0,
      consciousness: vitalsData.consciousness || latest?.consciousness || 'ALERT',
      recordedAt: new Date().toISOString()
    };

    setVitalsMap(prev => ({
      ...prev,
      [activeEmergency.emergencyId]: [...(prev[activeEmergency.emergencyId] || []), newRecord]
    }));

    snowflakeWarehouse.syncVitals(newRecord);
    notifyPeers('VITALS_ADDED', { emergencyId: activeEmergency.emergencyId, vital: newRecord });
  };

  // Add Medical Report
  const addReport = (report: MedicalReport) => {
    setReportsMap(prev => ({
      ...prev,
      [report.emergencyId]: [...(prev[report.emergencyId] || []), report]
    }));

    snowflakeWarehouse.syncReport(report);
    notifyPeers('REPORT_ADDED', { emergencyId: report.emergencyId, report });
  };

  // Update Emergency Status
  const updateStatus = (status: EmergencyStatus) => {
    if (!activeEmergency) return;
    const updated: EmergencyCase = {
      ...activeEmergency,
      status,
      arrivedAt: status === 'ARRIVED' ? (activeEmergency.arrivedAt || new Date().toISOString()) : activeEmergency.arrivedAt,
      completedAt: status === 'COMPLETED' ? new Date().toISOString() : activeEmergency.completedAt,
      updatedAt: new Date().toISOString()
    };

    setEmergencies(prev => prev.map(c => c.emergencyId === updated.emergencyId ? updated : c));
    snowflakeWarehouse.syncEmergency(updated);
    notifyPeers('EMERGENCY_UPDATED', updated);
  };

  // Reset Emergency for testing
  const resetEmergency = () => {
    setEmergencies(INITIAL_EMERGENCIES);
    setVitalsMap(INITIAL_VITALS);
    setReportsMap(INITIAL_REPORTS);
    setIsSimulatingMovement(false);
    setSimulationStep(0);
    localStorage.removeItem(STORAGE_KEY_CASES);
    localStorage.removeItem(STORAGE_KEY_VITALS);
    localStorage.removeItem(STORAGE_KEY_REPORTS);
  };

  // Ambulance Movement Simulation along route with live geofencing (functional update to prevent stale closures)
  useEffect(() => {
    if (isSimulatingMovement && routeCoordinates.length > 0 && activeEmergency) {
      const activeId = activeEmergency.emergencyId;
      simulationTimerRef.current = window.setInterval(() => {
        setSimulationStep(prevStep => {
          const nextStep = prevStep + 1;
          if (nextStep >= routeCoordinates.length) {
            if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
            setIsSimulatingMovement(false);
            setEmergencies(prevList => prevList.map(c => {
              if (c.emergencyId !== activeId) return c;
              const completedCase: EmergencyCase = {
                ...c,
                status: 'ARRIVED',
                etaSeconds: 0,
                arrivedAt: c.arrivedAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              snowflakeWarehouse.syncEmergency(completedCase);
              notifyPeers('EMERGENCY_UPDATED', completedCase);
              return completedCase;
            }));
            return prevStep;
          }

          const currentCoord = routeCoordinates[nextStep];
          setEmergencies(prevList => prevList.map(c => {
            if (c.emergencyId !== activeId) return c;
            const targetHospital = hospitals.find(h => h.hospitalId === c.hospitalId);
            let newStatus = c.status;
            let remainingEta = Math.max(1, Math.round((routeCoordinates.length - nextStep) * 15));

            if (targetHospital) {
              const geofenceState = checkHospitalGeofence(currentCoord, targetHospital.coordinates);
              if (geofenceState === 'ARRIVED') {
                newStatus = 'ARRIVED';
                remainingEta = 0;
              } else if (geofenceState === 'APPROACHING' && c.status !== 'ARRIVED') {
                newStatus = 'APPROACHING';
              }
            }

            const updatedCase: EmergencyCase = {
              ...c,
              currentLocation: currentCoord,
              etaSeconds: remainingEta,
              status: newStatus,
              arrivedAt: newStatus === 'ARRIVED' ? (c.arrivedAt || new Date().toISOString()) : c.arrivedAt,
              updatedAt: new Date().toISOString()
            };
            snowflakeWarehouse.syncEmergency(updatedCase);
            notifyPeers('EMERGENCY_UPDATED', updatedCase);
            return updatedCase;
          }));

          return nextStep;
        });
      }, 1500);

      return () => {
        if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
      };
    }
  }, [isSimulatingMovement, routeCoordinates, activeEmergency?.emergencyId, hospitals]);

  const toggleSimulation = () => {
    if (routeCoordinates.length === 0) return;
    if (simulationStep >= routeCoordinates.length - 1) {
      setSimulationStep(0);
      setIsSimulatingMovement(true);
      return;
    }
    setIsSimulatingMovement(prev => !prev);
  };

  // Current active vitals
  const currentEmergencyVitals = activeEmergency ? (vitalsMap[activeEmergency.emergencyId] || []) : [];
  const currentVital = currentEmergencyVitals.length > 0 ? currentEmergencyVitals[currentEmergencyVitals.length - 1] : null;
  const currentReports = activeEmergency ? (reportsMap[activeEmergency.emergencyId] || []) : [];

  // Hospital View derived data
  const selectedHospital = hospitals.find(h => h.hospitalId === selectedHospitalId) || hospitals[0];
  
  // Hospital-isolated queue: ambulances routed to this hospital, prioritized strictly by SEVERITY then ETA
  const hospitalEmergencies = emergencies
    .filter(e => e.hospitalId === selectedHospitalId && e.status !== 'COMPLETED')
    .sort((a, b) => {
      const severityOrder: Record<EmergencySeverity, number> = {
        CRITICAL: 0,
        HIGH: 1,
        MODERATE: 2,
        LOW: 3
      };
      const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (sevDiff !== 0) return sevDiff;
      return a.etaSeconds - b.etaSeconds;
    });

  // All citywide active emergencies across all hospitals (for Traffic & Central Command)
  const allActiveEmergencies = emergencies
    .filter(e => e.status !== 'COMPLETED')
    .sort((a, b) => {
      const severityOrder: Record<EmergencySeverity, number> = {
        CRITICAL: 0,
        HIGH: 1,
        MODERATE: 2,
        LOW: 3
      };
      const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (sevDiff !== 0) return sevDiff;
      return a.etaSeconds - b.etaSeconds;
    });

  const selectedCase = emergencies.find(e => e.emergencyId === selectedCaseId) || null;
  const selectedCaseVitals = selectedCaseId ? (vitalsMap[selectedCaseId] || []) : [];
  const selectedCaseReports = selectedCaseId ? (reportsMap[selectedCaseId] || []) : [];

  return (
    <EmergencyContext.Provider
      value={{
        activeAmbulance,
        activeEmergency,
        hospitals,
        vitalsHistory: currentEmergencyVitals,
        currentVitals: currentVital,
        reports: currentReports,
        routeCoordinates,
        isSimulatingMovement,
        simulationStep,

        hospitalEmergencies,
        allActiveEmergencies,
        selectedHospitalId,
        selectedHospital,
        selectedCaseId,
        selectedCase,
        selectedCaseVitals,
        selectedCaseReports,

        startEmergency,
        selectHospital,
        updateVitals,
        updateTreatment,
        updateEmergencyDetails,
        addReport,
        updateStatus,
        toggleSimulation,
        resetEmergency,

        setSelectedHospitalId,
        setSelectedCaseId,

        connectionStatus: 'ONLINE_SYNC'
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
