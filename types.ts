export type UserRole = 'admin' | 'medical';

export interface Visit {
  id: string;
  date: string; // ISO String
  disease: string;
  diagnosis: string;
  prescription: string;
  notes: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  address: string;
  
  // Latest/Active Condition
  diseases: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  
  // History
  medicalHistory: Visit[];
  
  created_by: string;
  updated_at: string;
}

export interface PatientFormData {
  name: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  address: string;
  diseases: string;
  diagnosis: string;
  prescription: string;
  notes: string;
}