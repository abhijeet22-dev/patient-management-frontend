import { Patient, Visit } from "../types";

// --- MOCK DATABASE ---
// Refactored to have UNIQUE patients by phone, with history arrays.

let MOCK_PATIENTS: Patient[] = [
  {
    id: "1",
    name: "Sarah Jenkins",
    age: 45,
    gender: "Female",
    phone: "555-0123",
    address: "42 Wellness Blvd, Health City",
    diseases: "Hypertension",
    diagnosis: "Stage 1 Hypertension monitored.",
    prescription: "Lisinopril 10mg daily",
    notes: "Patient advised to reduce salt intake.",
    created_by: "admin",
    updated_at: new Date().toISOString(),
    medicalHistory: [
      {
        id: "visit-1",
        date: new Date().toISOString(),
        disease: "Hypertension",
        diagnosis: "Stage 1 Hypertension monitored.",
        prescription: "Lisinopril 10mg daily",
        notes: "Patient advised to reduce salt intake."
      },
      {
        id: "visit-old-1",
        date: new Date(Date.now() - 5184000000).toISOString(), // ~2 months ago
        disease: "Seasonal Allergies",
        diagnosis: "Pollen allergy reaction.",
        prescription: "Cetirizine 10mg for 5 days",
        notes: "Completed course."
      }
    ]
  },
  {
    id: "2",
    name: "Michael Chen",
    age: 28,
    gender: "Male",
    phone: "555-9876",
    address: "88 Recovery Lane",
    diseases: "Acute Bronchitis",
    diagnosis: "Viral infection, symptomatic treatment.",
    prescription: "Cough syrup, Ibuprofen 400mg",
    notes: "Follow up in 1 week if symptoms persist.",
    created_by: "admin",
    updated_at: new Date(Date.now() - 86400000).toISOString(), // yesterday
    medicalHistory: [
       {
        id: "visit-2",
        date: new Date(Date.now() - 86400000).toISOString(),
        disease: "Acute Bronchitis",
        diagnosis: "Viral infection, symptomatic treatment.",
        prescription: "Cough syrup, Ibuprofen 400mg",
        notes: "Follow up in 1 week if symptoms persist."
       }
    ]
  },
  {
    id: "3",
    name: "Emily Davis",
    age: 62,
    gender: "Female",
    phone: "555-4567",
    address: "123 Senior Care Dr",
    diseases: "Type 2 Diabetes",
    diagnosis: "Uncontrolled blood sugar levels.",
    prescription: "Metformin 500mg BD, Insulin Glargine",
    notes: "Referred to dietician.",
    created_by: "admin",
    updated_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    medicalHistory: [
       {
        id: "visit-3",
        date: new Date(Date.now() - 172800000).toISOString(),
        disease: "Type 2 Diabetes",
        diagnosis: "Uncontrolled blood sugar levels.",
        prescription: "Metformin 500mg BD, Insulin Glargine",
        notes: "Referred to dietician."
       }
    ]
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getAllPatients = async () => {
  await delay(400);
  return [...MOCK_PATIENTS];
};

export const searchPatients = async () => {
  await delay(400);
  return [...MOCK_PATIENTS];
};

// INTELLIGENT ADD/UPDATE
// If patient with phone exists -> Add new visit to history
// If not -> Create new patient
export const addPatient = async (patientData: Omit<Patient, "id" | "medicalHistory" | "created_by" | "updated_at"> & { created_by: string, updated_at: string }) => {
  await delay(300);
  
  const existingIndex = MOCK_PATIENTS.findIndex(p => p.phone === patientData.phone);
  
  const newVisit: Visit = {
    id: Math.random().toString(36).substr(2, 9),
    date: patientData.updated_at,
    disease: patientData.diseases,
    diagnosis: patientData.diagnosis,
    prescription: patientData.prescription,
    notes: patientData.notes
  };

  if (existingIndex >= 0) {
    // UPDATE EXISTING PATIENT
    const existingPatient = MOCK_PATIENTS[existingIndex];
    
    const updatedPatient: Patient = {
      ...existingPatient,
      ...patientData, // Update demographics if changed
      // Ensure history is preserved and new visit added
      medicalHistory: [newVisit, ...(existingPatient.medicalHistory || [])],
      updated_at: new Date().toISOString()
    };
    
    MOCK_PATIENTS[existingIndex] = updatedPatient;
    return existingPatient.id;
  } else {
    // CREATE NEW PATIENT
    const newPatient: Patient = {
      ...patientData,
      id: Math.random().toString(36).substr(2, 9),
      medicalHistory: [newVisit]
    };
    MOCK_PATIENTS = [newPatient, ...MOCK_PATIENTS];
    return newPatient.id;
  }
};

export const updatePatient = async (id: string, patientData: Partial<Patient>) => {
  // This function might be used for editing specific details without adding a visit,
  // but for this specific request, we generally use the addPatient logic to append history.
  // However, if we edit demographics only:
  await delay(300);
  MOCK_PATIENTS = MOCK_PATIENTS.map(p => 
    p.id === id ? { ...p, ...patientData } : p
  );
};