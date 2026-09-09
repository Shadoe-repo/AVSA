import { EmergencyCase, VitalsRecord, MedicalReport } from '../types';

export interface SnowflakeLogEntry {
  table: 'EMERGENCY_CASES' | 'VITALS' | 'MEDICAL_REPORTS' | 'AMBULANCE_LOCATIONS';
  recordId: string;
  payload: Record<string, any>;
  timestamp: string;
}

class SnowflakeWarehouseManager {
  private logs: SnowflakeLogEntry[] = [];

  constructor() {
    // Pre-populate with historical logs
    this.logs.push(
      {
        table: 'EMERGENCY_CASES',
        recordId: 'EMG-82931',
        payload: { EMERGENCY_ID: 'EMG-82931', AMBULANCE_ID: 'AMB-1047', EMERGENCY_TYPE: 'CARDIAC', SEVERITY: 'CRITICAL', STATUS: 'EN_ROUTE' },
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        table: 'VITALS',
        recordId: 'VIT-101',
        payload: { VITAL_ID: 'VIT-101', EMERGENCY_ID: 'EMG-82931', HEART_RATE: 120, SPO2: 86, BLOOD_PRESSURE: '90/60', CONSCIOUSNESS: 'UNCONSCIOUS' },
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString()
      },
      {
        table: 'MEDICAL_REPORTS',
        recordId: 'REP-5521',
        payload: { REPORT_ID: 'REP-5521', EMERGENCY_ID: 'EMG-82931', REPORT_TYPE: 'ECG', CLOUDINARY_PUBLIC_ID: 'asva/emergencies/EMG-82931/reports/ECG/001' },
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString()
      }
    );
  }

  public syncEmergency(caseData: EmergencyCase) {
    this.logs.unshift({
      table: 'EMERGENCY_CASES',
      recordId: caseData.emergencyId,
      payload: {
        EMERGENCY_ID: caseData.emergencyId,
        AMBULANCE_ID: caseData.ambulanceId,
        HOSPITAL_ID: caseData.hospitalId,
        EMERGENCY_TYPE: caseData.emergencyType,
        SEVERITY: caseData.severity,
        STATUS: caseData.status,
        ETA_SECONDS: caseData.etaSeconds,
        UPDATED_AT: caseData.updatedAt
      },
      timestamp: new Date().toISOString()
    });
  }

  public syncVitals(vital: VitalsRecord) {
    this.logs.unshift({
      table: 'VITALS',
      recordId: vital.vitalId,
      payload: {
        VITAL_ID: vital.vitalId,
        EMERGENCY_ID: vital.emergencyId,
        HEART_RATE: vital.heartRate,
        BLOOD_PRESSURE: vital.bloodPressure,
        SPO2: vital.spo2,
        RESPIRATORY_RATE: vital.respiratoryRate,
        CONSCIOUSNESS: vital.consciousness,
        RECORDED_AT: vital.recordedAt
      },
      timestamp: new Date().toISOString()
    });
  }

  public syncReport(report: MedicalReport) {
    this.logs.unshift({
      table: 'MEDICAL_REPORTS',
      recordId: report.reportId,
      payload: {
        REPORT_ID: report.reportId,
        EMERGENCY_ID: report.emergencyId,
        AMBULANCE_ID: report.ambulanceId,
        REPORT_TYPE: report.reportType,
        CLOUDINARY_PUBLIC_ID: report.cloudinaryPublicId,
        UPLOADED_BY: report.uploadedBy,
        UPLOADED_AT: report.uploadedAt
      },
      timestamp: new Date().toISOString()
    });
  }

  public getRecentLogs(): SnowflakeLogEntry[] {
    return this.logs.slice(0, 20);
  }

  public getWarehouseMetrics() {
    return {
      avgResponseTimeMin: 4.8,
      avgTransportTimeMin: 12.4,
      hospitalPrepTimeGainedMin: 9.2,
      criticalCaseRate: '64%',
      distribution: [
        { type: 'CARDIAC', count: 42, percentage: 40 },
        { type: 'TRAUMA', count: 32, percentage: 30 },
        { type: 'RESPIRATORY', count: 20, percentage: 19 },
        { type: 'STROKE', count: 12, percentage: 11 }
      ],
      weeklyEmergencyVolume: [
        { day: 'Mon', count: 28 },
        { day: 'Tue', count: 34 },
        { day: 'Wed', count: 42 },
        { day: 'Thu', count: 38 },
        { day: 'Fri', count: 50 },
        { day: 'Sat', count: 62 },
        { day: 'Sun', count: 58 }
      ]
    };
  }
}

export const snowflakeWarehouse = new SnowflakeWarehouseManager();
