import { Hospital, Ambulance, EmergencyCase, VitalsRecord, MedicalReport } from '../types';

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    hospitalId: 'HOSP-021',
    name: 'Apollo Multispecialty Hospital',
    coordinates: { latitude: 22.5697, longitude: 88.4048 },
    availableBeds: 18,
    icuBeds: 5,
    emergencyStatus: 'ACCEPTING',
    capabilities: ['CARDIAC_CATH', 'TRAUMA_LEVEL_1', 'STROKE_CENTRE', 'BURN_UNIT'],
    status: 'ACTIVE',
    distanceKm: 4.2,
    etaMinutes: 9,
    address: '58 Canal Circular Road, Kadapara, Kolkata',
    phone: '+91 33 2320 3040'
  },
  {
    hospitalId: 'HOSP-002',
    name: 'Fortis Hospital Anandapur',
    coordinates: { latitude: 22.5186, longitude: 88.4032 },
    availableBeds: 24,
    icuBeds: 7,
    emergencyStatus: 'ACCEPTING',
    capabilities: ['CARDIAC_CATH', 'TRAUMA_LEVEL_1', 'NEURO_ICU'],
    status: 'ACTIVE',
    distanceKm: 5.1,
    etaMinutes: 11,
    address: '730 Anandapur, E.M Bypass Road, Kolkata',
    phone: '+91 33 6628 4444'
  },
  {
    hospitalId: 'HOSP-003',
    name: 'SSKM Government Emergency Hospital',
    coordinates: { latitude: 22.5401, longitude: 88.3435 },
    availableBeds: 8,
    icuBeds: 2,
    emergencyStatus: 'ACCEPTING',
    capabilities: ['TRAUMA_LEVEL_1', 'TOXICOLOGY', 'GENERAL_SURGERY'],
    status: 'ACTIVE',
    distanceKm: 7.8,
    etaMinutes: 15,
    address: '244 AJC Bose Road, Bhowanipore, Kolkata',
    phone: '+91 33 2223 1589'
  },
  {
    hospitalId: 'HOSP-004',
    name: 'AMRI Hospital Dhakuria',
    coordinates: { latitude: 22.5127, longitude: 88.3686 },
    availableBeds: 12,
    icuBeds: 4,
    emergencyStatus: 'ACCEPTING',
    capabilities: ['CARDIAC_CATH', 'NEUROLOGY', 'PULMONOLOGY'],
    status: 'ACTIVE',
    distanceKm: 6.4,
    etaMinutes: 13,
    address: 'P-4 & 5 CIT Scheme LXXII, Block A, Gariahat, Kolkata',
    phone: '+91 33 6680 0000'
  }
];

export const INITIAL_AMBULANCES: Ambulance[] = [
  {
    ambulanceId: 'AMB-1047',
    vehicleNumber: 'WB-02-AK-4421',
    driverName: 'Unit 1047 Driver',
    paramedicName: 'Unit 1047 Paramedic',
    status: 'ON_CALL',
    currentCoordinates: { latitude: 22.5726, longitude: 88.3639 },
    registeredAt: '2026-01-15T08:00:00Z'
  },
  {
    ambulanceId: 'AMB-1082',
    vehicleNumber: 'WB-02-BM-9102',
    driverName: 'Unit 1082 Driver',
    paramedicName: 'Unit 1082 Paramedic',
    status: 'ON_CALL',
    currentCoordinates: { latitude: 22.5510, longitude: 88.3750 },
    registeredAt: '2026-02-10T09:30:00Z'
  },
  {
    ambulanceId: 'AMB-1031',
    vehicleNumber: 'WB-02-CX-7789',
    driverName: 'Unit 1031 Driver',
    paramedicName: 'Unit 1031 Paramedic',
    status: 'ON_CALL',
    currentCoordinates: { latitude: 22.5850, longitude: 88.3900 },
    registeredAt: '2026-03-01T11:15:00Z'
  },
  {
    ambulanceId: 'AMB-1090',
    vehicleNumber: 'WB-02-DZ-3310',
    driverName: 'Unit 1090 Driver',
    paramedicName: 'Unit 1090 Paramedic',
    status: 'ON_CALL',
    currentCoordinates: { latitude: 22.5620, longitude: 88.4200 },
    registeredAt: '2026-04-12T14:20:00Z'
  }
];

export const INITIAL_EMERGENCIES: EmergencyCase[] = [
  {
    emergencyId: 'EMG-82931',
    ambulanceId: 'AMB-1047',
    hospitalId: 'HOSP-021',
    emergencyType: 'CARDIAC',
    severity: 'CRITICAL',
    status: 'EN_ROUTE',
    patientAge: 58,
    patientGender: 'M',
    chiefComplaint: 'Acute chest pain radiating to left jaw, sudden syncope, diaphoretic',
    currentTreatment: 'Supplemental Oxygen at 4L/min, Aspirin 325mg administered, IV line established',
    etaSeconds: 300, // 5 min
    currentLocation: { latitude: 22.5726, longitude: 88.3639 },
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    emergencyId: 'EMG-82915',
    ambulanceId: 'AMB-1082',
    hospitalId: 'HOSP-021',
    emergencyType: 'TRAUMA',
    severity: 'CRITICAL',
    status: 'EN_ROUTE',
    patientAge: 32,
    patientGender: 'M',
    chiefComplaint: 'High-speed motor vehicle collision, blunt chest trauma, hypotension',
    currentTreatment: 'C-spine immobilized, bilateral IV access, crystalloid bolus ongoing',
    etaSeconds: 660, // 11 min
    currentLocation: { latitude: 22.5510, longitude: 88.3750 },
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    emergencyId: 'EMG-82944',
    ambulanceId: 'AMB-1031',
    hospitalId: 'HOSP-021',
    emergencyType: 'RESPIRATORY',
    severity: 'HIGH',
    status: 'EN_ROUTE',
    patientAge: 67,
    patientGender: 'F',
    chiefComplaint: 'Severe acute COPD exacerbation, audible stridor, cyanosis',
    currentTreatment: 'Nebulized Albuterol/Ipratropium, CPAP at 8 cmH2O',
    etaSeconds: 420, // 7 min
    currentLocation: { latitude: 22.5850, longitude: 88.3900 },
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    emergencyId: 'EMG-82950',
    ambulanceId: 'AMB-1090',
    hospitalId: 'HOSP-021',
    emergencyType: 'GENERAL',
    severity: 'MODERATE',
    status: 'EN_ROUTE',
    patientAge: 45,
    patientGender: 'F',
    chiefComplaint: 'Severe abdominal pain in lower right quadrant with persistent vomiting',
    currentTreatment: 'IV fluids running, Ondansetron 4mg given',
    etaSeconds: 240, // 4 min
    currentLocation: { latitude: 22.5620, longitude: 88.4200 },
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_VITALS: Record<string, VitalsRecord[]> = {
  'EMG-82931': [
    {
      vitalId: 'VIT-101',
      emergencyId: 'EMG-82931',
      heartRate: 120,
      bloodPressure: '90/60',
      spo2: 86,
      respiratoryRate: 24,
      temperature: 36.8,
      consciousness: 'UNCONSCIOUS',
      recordedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString()
    },
    {
      vitalId: 'VIT-102',
      emergencyId: 'EMG-82931',
      heartRate: 114,
      bloodPressure: '95/64',
      spo2: 91,
      respiratoryRate: 22,
      temperature: 36.8,
      consciousness: 'UNCONSCIOUS',
      recordedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString()
    }
  ],
  'EMG-82915': [
    {
      vitalId: 'VIT-201',
      emergencyId: 'EMG-82915',
      heartRate: 135,
      bloodPressure: '80/50',
      spo2: 93,
      respiratoryRate: 28,
      temperature: 36.2,
      consciousness: 'VERBAL',
      recordedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString()
    }
  ],
  'EMG-82944': [
    {
      vitalId: 'VIT-301',
      emergencyId: 'EMG-82944',
      heartRate: 104,
      bloodPressure: '138/88',
      spo2: 89,
      respiratoryRate: 30,
      temperature: 37.1,
      consciousness: 'ALERT',
      recordedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString()
    }
  ],
  'EMG-82950': [
    {
      vitalId: 'VIT-401',
      emergencyId: 'EMG-82950',
      heartRate: 88,
      bloodPressure: '124/80',
      spo2: 98,
      respiratoryRate: 18,
      temperature: 38.3,
      consciousness: 'ALERT',
      recordedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
    }
  ]
};

export const INITIAL_REPORTS: Record<string, MedicalReport[]> = {
  'EMG-82931': [
    {
      reportId: 'REP-5521',
      emergencyId: 'EMG-82931',
      ambulanceId: 'AMB-1047',
      reportType: 'ECG',
      title: '12-Lead Diagnostic ECG (STEMI Alert)',
      cloudinaryPublicId: 'asva/emergencies/EMG-82931/reports/ECG/001',
      cloudinaryUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
      fileType: 'image/jpeg',
      fileSize: '1.4 MB',
      uploadedBy: 'Paramedic Unit 1047',
      uploadedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      notes: 'Anterior wall ST-elevation confirmed in Leads V1-V4 with reciprocal depression in II, III, aVF.'
    }
  ],
  'EMG-82915': [
    {
      reportId: 'REP-5522',
      emergencyId: 'EMG-82915',
      ambulanceId: 'AMB-1082',
      reportType: 'XRAY',
      title: 'Field Portable Chest X-Ray',
      cloudinaryPublicId: 'asva/emergencies/EMG-82915/reports/XRAY/001',
      cloudinaryUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
      fileType: 'image/jpeg',
      fileSize: '2.8 MB',
      uploadedBy: 'Paramedic Unit 1082',
      uploadedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      notes: 'Possible left-sided hemothorax with 4th/5th rib fracture.'
    }
  ]
};
