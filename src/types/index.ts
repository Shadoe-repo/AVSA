export type EmergencySeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export type EmergencyType = 'CARDIAC' | 'TRAUMA' | 'RESPIRATORY' | 'STROKE' | 'GENERAL';

export type EmergencyStatus = 
  | 'CREATED'
  | 'PATIENT_RECEIVED'
  | 'HOSPITAL_SELECTED'
  | 'EN_ROUTE'
  | 'APPROACHING'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'CANCELLED';

export type ConsciousnessLevel = 'ALERT' | 'VERBAL' | 'PAIN' | 'UNCONSCIOUS';

export type ReportType = 'ECG' | 'BLOOD_TEST' | 'XRAY' | 'CT_MRI' | 'PRESCRIPTION' | 'OTHER';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Ambulance {
  ambulanceId: string;
  vehicleNumber: string;
  driverName?: string;
  paramedicName?: string;
  status: 'AVAILABLE' | 'ON_CALL' | 'MAINTENANCE';
  currentCoordinates: Coordinates;
  registeredAt: string;
}

export interface Hospital {
  hospitalId: string;
  name: string;
  coordinates: Coordinates;
  availableBeds: number;
  icuBeds: number;
  emergencyStatus: 'ACCEPTING' | 'AT_CAPACITY' | 'DIVERTING';
  capabilities: string[];
  status: 'ACTIVE' | 'OFFLINE';
  distanceKm?: number;
  etaMinutes?: number;
  address: string;
  phone: string;
}

export interface VitalsRecord {
  vitalId: string;
  emergencyId: string;
  heartRate: number | null;
  bloodPressure: string | null;
  spo2: number | null;
  respiratoryRate: number | null;
  temperature: number | null;
  consciousness: ConsciousnessLevel;
  recordedAt: string;
}

export interface MedicalReport {
  reportId: string;
  emergencyId: string;
  ambulanceId: string;
  reportType: ReportType;
  title: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  fileType: 'image/png' | 'image/jpeg' | 'application/pdf';
  fileSize?: string;
  uploadedBy: string;
  uploadedAt: string;
  notes?: string;
}

export interface EmergencyCase {
  emergencyId: string;
  ambulanceId: string;
  hospitalId: string | null;
  emergencyType: EmergencyType;
  severity: EmergencySeverity;
  status: EmergencyStatus;
  patientAge?: number;
  patientGender?: 'M' | 'F' | 'OTHER';
  chiefComplaint?: string;
  currentTreatment?: string;
  etaSeconds: number;
  currentLocation: Coordinates;
  destinationHospital?: Hospital | null;
  createdAt: string;
  updatedAt: string;
  arrivedAt?: string;
  completedAt?: string;
}

export interface HospitalUser {
  userId: string;
  email: string;
  name: string;
  hospitalId: string;
  role: 'DOCTOR' | 'ER_CHIEF' | 'TRIAGE_NURSE' | 'ADMIN';
  avatarUrl?: string;
}

export interface VoiceExtractionResult {
  heartRate?: number;
  bloodPressure?: string;
  spo2?: number;
  respiratoryRate?: number;
  consciousness?: ConsciousnessLevel;
  emergencyType?: EmergencyType;
  treatment?: string;
  severity?: EmergencySeverity;
  confidenceScore: number;
  ambiguousFields: string[];
  rawTranscript: string;
}
