import { VoiceExtractionResult, ConsciousnessLevel, EmergencyType, EmergencySeverity } from '../types';

export function parseClinicalSpeech(transcript: string): VoiceExtractionResult {
  const text = transcript.toLowerCase();
  const ambiguousFields: string[] = [];
  let confidenceScore = 0.95;

  let heartRate: number | undefined = undefined;
  let bloodPressure: string | undefined = undefined;
  let spo2: number | undefined = undefined;
  let respiratoryRate: number | undefined = undefined;
  let consciousness: ConsciousnessLevel | undefined = undefined;
  let emergencyType: EmergencyType | undefined = undefined;
  let severity: EmergencySeverity | undefined = undefined;
  let treatment: string | undefined = undefined;
  let allergy: string | undefined = undefined;
  let bloodGlucose: number | undefined = undefined;

  // Extract Heart Rate / Pulse
  const hrMatch = text.match(/(?:heart rate|pulse|hr|beats per minute|bpm)\s*(?:is|at|of)?\s*(\d{2,3})/i) 
    || text.match(/(\d{2,3})\s*(?:bpm|beats per minute)/i);
  if (hrMatch) {
    const val = parseInt(hrMatch[1], 10);
    if (val >= 30 && val <= 250) {
      heartRate = val;
    } else {
      ambiguousFields.push('heartRate');
      confidenceScore -= 0.15;
    }
  }

  // Extract SpO2 / Oxygen Saturation
  const spo2Match = text.match(/(?:oxygen saturation|oxygen sat|saturation|spo2|oxygen|o2 sat|sat)\s*(?:is|at|of)?\s*(\d{2,3})\s*(?:%|percent)?/i)
    || text.match(/(\d{2,3})\s*(?:%|percent)\s*(?:o2|spo2|oxygen|saturation|sat)/i);
  if (spo2Match) {
    const val = parseInt(spo2Match[1], 10);
    if (val >= 40 && val <= 100) {
      spo2 = val;
    } else {
      ambiguousFields.push('spo2');
      confidenceScore -= 0.15;
    }
  }

  // Extract Blood Pressure
  const bpMatch = text.match(/(?:blood pressure|bp)\s*(?:is|at|of)?\s*(\d{2,3})\s*(?:over|\/|by)\s*(\d{2,3})/i)
    || text.match(/(\d{2,3})\s*(?:over|\/|by)\s*(\d{2,3})\s*(?:blood pressure|bp|millimeter|mmhg)?/i);
  if (bpMatch) {
    const sys = parseInt(bpMatch[1], 10);
    const dia = parseInt(bpMatch[2], 10);
    if (sys > dia && sys >= 50 && sys <= 260 && dia >= 30 && dia <= 160) {
      bloodPressure = `${sys}/${dia}`;
    } else {
      bloodPressure = `${sys}/${dia}`;
      ambiguousFields.push('bloodPressure');
      confidenceScore -= 0.1;
    }
  }

  // Extract Respiratory Rate
  const respMatch = text.match(/(?:respiratory rate|respiration|breathing rate|breathing|rr)\s*(?:is|at|of)?\s*(\d{1,2})/i);
  if (respMatch) {
    respiratoryRate = parseInt(respMatch[1], 10);
  }

  // Extract Consciousness
  if (text.includes('unconscious') || text.includes('unresponsive') || text.includes('passed out') || text.includes('comatose')) {
    consciousness = 'UNCONSCIOUS';
    severity = 'CRITICAL';
  } else if (text.includes('responds to pain') || text.includes('pain only') || text.includes('pain response')) {
    consciousness = 'PAIN';
    severity = 'CRITICAL';
  } else if (text.includes('responds to voice') || text.includes('verbal') || text.includes('drowsy') || text.includes('confused')) {
    consciousness = 'VERBAL';
    severity = 'HIGH';
  } else if (text.includes('alert') || text.includes('conscious') || text.includes('awake') || text.includes('oriented') || text.includes('responsive')) {
    consciousness = 'ALERT';
  }

  // Extract Emergency Classification
  if (text.includes('cardiac') || text.includes('heart attack') || text.includes('chest pain') || text.includes('stemi') || text.includes('angina')) {
    emergencyType = 'CARDIAC';
  } else if (text.includes('trauma') || text.includes('accident') || text.includes('collision') || text.includes('fracture') || text.includes('bleeding')) {
    emergencyType = 'TRAUMA';
  } else if (text.includes('respiratory') || text.includes('asthma') || text.includes('copd') || text.includes('breathless') || text.includes('stridor')) {
    emergencyType = 'RESPIRATORY';
  } else if (text.includes('stroke') || text.includes('facial droop') || text.includes('hemiplegia') || text.includes('paralysis')) {
    emergencyType = 'STROKE';
  }

  // Extract Treatments mentioned
  const treatmentsFound: string[] = [];
  if (text.includes('oxygen') || text.includes('o2 mask') || text.includes('nasal cannula')) {
    treatmentsFound.push('Supplemental Oxygen');
  }
  if (text.includes('aspirin')) {
    treatmentsFound.push('Aspirin 325mg');
  }
  if (text.includes('iv line') || text.includes('iv access') || text.includes('fluids') || text.includes('saline')) {
    treatmentsFound.push('IV Saline Access');
  }
  if (text.includes('c-spine') || text.includes('collar') || text.includes('immobilized')) {
    treatmentsFound.push('C-Spine Immobilization');
  }
  if (text.includes('nebulizer') || text.includes('albuterol') || text.includes('inhaler')) {
    treatmentsFound.push('Bronchodilator Nebulizer');
  }
  if (treatmentsFound.length > 0) {
    treatment = treatmentsFound.join(', ');
  }

  // Determine Severity if not already set
  if (!severity) {
    if ((spo2 !== undefined && spo2 < 90) || (heartRate !== undefined && (heartRate > 130 || heartRate < 45))) {
      severity = 'CRITICAL';
    } else if ((spo2 !== undefined && spo2 < 94) || (heartRate !== undefined && (heartRate > 110 || heartRate < 55))) {
      severity = 'HIGH';
    } else {
      severity = 'MODERATE';
    }
  }

  return {
    heartRate,
    bloodPressure,
    spo2,
    respiratoryRate,
    consciousness,
    emergencyType,
    severity,
    treatment,
    allergy,
    bloodGlucose,
    confidenceScore: Math.max(0.4, Number(confidenceScore.toFixed(2))),
    ambiguousFields,
    rawTranscript: transcript
  };
}

export const CLINICAL_VOICE_PRESETS = [
  {
    title: 'Cardiac Arrest / STEMI',
    phrase: 'Patient is unconscious, heart rate 120, oxygen saturation 86 percent, blood pressure 90 over 60, started supplemental oxygen and aspirin',
    expectedType: 'CARDIAC',
    expectedSeverity: 'CRITICAL'
  },
  {
    title: 'Severe Motor Trauma',
    phrase: 'Motorcycle collision, patient responds to pain only, severe hemorrhage, heart rate 138, blood pressure 80 over 50, SpO2 92%, IV access secured',
    expectedType: 'TRAUMA',
    expectedSeverity: 'CRITICAL'
  },
  {
    title: 'Acute Respiratory Failure',
    phrase: 'Acute asthma attack with cyanosis, patient alert but distressed, respiratory rate 32, SpO2 88 percent, heart rate 108, nebulizer administered',
    expectedType: 'RESPIRATORY',
    expectedSeverity: 'HIGH'
  }
];
