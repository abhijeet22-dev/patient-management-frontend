import React, { useEffect, useState, useMemo } from 'react';
import { Patient, PatientFormData } from '../types';
import { addPatient, getAllPatients } from '../services/patientService';
import { Button, Input, Select, TextArea, Card } from '../components/ui';
import { 
  Plus, Save, Edit2, Search, LogOut, 
  LayoutDashboard, Users, Printer, 
  ChevronLeft, Calendar, History, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- TYPES & HELPERS ---
type ViewMode = 'dashboard' | 'patient-list' | 'patient-form';

const initialForm: PatientFormData = {
  name: '',
  age: '',
  gender: 'Male',
  phone: '',
  address: '',
  diseases: '',
  diagnosis: '',
  prescription: '',
  notes: ''
};

const AdminDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  
  // Form State
  const [formData, setFormData] = useState<PatientFormData>(initialForm);
  const [isExistingPatient, setIsExistingPatient] = useState(false);
  const [existingHistory, setExistingHistory] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const navigate = useNavigate();

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    fetchPatients();
  }, []);

  // --- FILTERING LOGIC ---
  useEffect(() => {
    let result = [...patients];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lower) || 
        p.phone.includes(lower) ||
        p.id?.toLowerCase().includes(lower)
      );
    }

    setFilteredPatients(result);
  }, [patients, searchTerm]);

  const fetchPatients = async () => {
    try {
      const data = await getAllPatients();
      setPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      console.error("Failed to fetch patients", error);
    }
  };

  // --- HANDLERS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time check for existing patient by phone
    if (name === 'phone' && value.length > 5) {
        const existing = patients.find(p => p.phone === value);
        if (existing) {
            setIsExistingPatient(true);
            setExistingHistory(existing);
            // Auto-fill demographics
            setFormData(prev => ({
                ...prev,
                name: existing.name,
                age: existing.age.toString(),
                gender: existing.gender,
                address: existing.address
            }));
        } else {
            setIsExistingPatient(false);
            setExistingHistory(null);
        }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        age: Number(formData.age),
        updated_at: new Date().toISOString(),
        created_by: 'test-admin'
      };

      await addPatient(payload);
      
      setFormData(initialForm);
      setIsExistingPatient(false);
      setExistingHistory(null);
      await fetchPatients();
      setCurrentView('patient-list'); 
    } catch (error) {
      alert('Error saving patient record');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient: Patient) => {
    // When editing from list, we pre-fill and show history
    setIsExistingPatient(true);
    setExistingHistory(patient);
    setFormData({
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
      phone: patient.phone,
      address: patient.address,
      diseases: '', // Clear these for new entry
      diagnosis: '',
      prescription: '',
      notes: ''
    });
    setCurrentView('patient-form');
  };

  const handlePrint = (patient: Patient) => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      const historyRows = patient.medicalHistory?.map(v => `
        <tr>
          <td>${new Date(v.date).toLocaleDateString()}</td>
          <td>${v.disease}</td>
          <td>${v.diagnosis}</td>
          <td>${v.prescription}</td>
        </tr>
      `).join('') || '';

      printWindow.document.write(`
        <html>
          <head>
            <title>Patient Record - ${patient.name}</title>
            <style>
              body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
              .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
              .title { font-size: 24px; font-weight: bold; color: #2563eb; }
              .meta { text-align: right; font-size: 14px; color: #666; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
              .label { font-weight: bold; font-size: 12px; text-transform: uppercase; color: #888; margin-bottom: 5px; }
              .value { font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
              th { text-align: left; background: #f0f0f0; padding: 8px; border-bottom: 1px solid #ddd; }
              td { padding: 8px; border-bottom: 1px solid #eee; }
              .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">MediCare Medical Record</div>
              <div class="meta">
                Date: ${new Date().toLocaleDateString()}<br>
                ID: ${patient.id}
              </div>
            </div>
            
            <div class="grid">
              <div><div class="label">Patient Name</div><div class="value">${patient.name}</div></div>
              <div><div class="label">Phone</div><div class="value">${patient.phone}</div></div>
              <div><div class="label">Age / Gender</div><div class="value">${patient.age} / ${patient.gender}</div></div>
              <div><div class="label">Address</div><div class="value">${patient.address}</div></div>
            </div>

            <h3 style="margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Treatment History</h3>
            <table width="100%">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Condition</th>
                  <th>Diagnosis</th>
                  <th>Prescription</th>
                </tr>
              </thead>
              <tbody>
                ${historyRows}
              </tbody>
            </table>

            <div class="footer">Generated by MediCare Patient Management System</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('medicare_auth');
    navigate('/');
  };

  const stats = useMemo(() => {
    const today = new Date().setHours(0,0,0,0);
    // Calculate total visits today
    let todayVisits = 0;
    patients.forEach(p => {
       if (new Date(p.updated_at).setHours(0,0,0,0) === today) todayVisits++;
    });
    
    return { total: patients.length, today: todayVisits };
  }, [patients]);

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      
      {/* --- 1. SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-20 shadow-lg">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2 text-primary-600">
          <LayoutDashboard size={28} />
          <span className="text-xl font-bold tracking-tight">MediCare</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'dashboard' 
                ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          
          <button 
            onClick={() => setCurrentView('patient-list')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'patient-list' || currentView === 'patient-form'
                ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users size={18} />
            Patients
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        
        {/* VIEW 1: DASHBOARD */}
        {currentView === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            <header className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h2>
              <div className="text-sm text-gray-500">Welcome, Dr. Admin</div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={24} /></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Unique Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Calendar size={24} /></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Visits Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: PATIENT LIST */}
        {currentView === 'patient-list' && (
          <div className="animate-fade-in space-y-4">
            <header className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Patient Management</h2>
              <Button onClick={() => {
                setFormData(initialForm);
                setIsExistingPatient(false);
                setExistingHistory(null);
                setCurrentView('patient-form');
              }}>
                <Plus size={18} /> Add Consultation
              </Button>
            </header>

            <Card className="border-t-4 border-t-primary-500">
              {/* Filters Toolbar */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                 <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Show</span>
                  <select 
                    className="border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500 p-1.5"
                    value={entriesPerPage}
                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                  </select>
                </div>
                <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search name, phone..." 
                        className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                </div>
              </div>

              {/* Advanced Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4 border-b">Phone No</th>
                      <th className="px-6 py-4 border-b">Name</th>
                      <th className="px-6 py-4 border-b">Age / Gender</th>
                      <th className="px-6 py-4 border-b">Last Visit</th>
                      <th className="px-6 py-4 border-b">Current Condition</th>
                      <th className="px-6 py-4 border-b text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No matching records found.
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.slice(0, entriesPerPage).map((patient) => (
                        <tr key={patient.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {patient.phone}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                                {patient.name.charAt(0)}
                              </div>
                              <span className="font-semibold text-gray-800">{patient.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {patient.age} / {patient.gender}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(patient.updated_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                              {patient.diseases || 'Check-up'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center space-x-2">
                             <button 
                               onClick={() => handlePrint(patient)}
                               className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                             >
                               <Printer size={14} className="mr-1"/> Print
                             </button>
                             <button 
                               onClick={() => handleEdit(patient)}
                               className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-primary-600 rounded hover:bg-primary-700 shadow-sm"
                             >
                               <Edit2 size={14} className="mr-1"/> Update / Add
                             </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* VIEW 3: ADD/UPDATE FORM */}
        {currentView === 'patient-form' && (
          <div className="max-w-6xl mx-auto animate-fade-in flex gap-6">
             
             {/* Left: Form */}
             <div className="flex-1">
                 <div className="mb-6 flex items-center justify-between">
                    <button 
                      onClick={() => setCurrentView('patient-list')}
                      className="flex items-center text-gray-500 hover:text-gray-700 transition-colors font-medium"
                    >
                      <ChevronLeft size={20} /> Back to List
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">
                        {isExistingPatient ? 'New Consultation (Existing Patient)' : 'New Patient Registration'}
                    </h2>
                 </div>

                 <Card className={`border-t-4 shadow-lg ${isExistingPatient ? 'border-t-orange-500' : 'border-t-primary-500'}`}>
                    {isExistingPatient && (
                        <div className="mb-6 bg-orange-50 border border-orange-200 p-4 rounded-lg flex items-start gap-3">
                            <AlertCircle className="text-orange-600 mt-1" size={20} />
                            <div>
                                <h4 className="font-bold text-orange-800">Existing Patient Detected</h4>
                                <p className="text-sm text-orange-700">
                                    Patient with phone <b>{formData.phone}</b> already exists. 
                                    Adding details below will create a <b>new treatment entry</b> in their history.
                                </p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                           <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">1. Patient Details</h3>
                        </div>
                        
                        <Input 
                          label="Phone Number (Unique ID)" 
                          name="phone" 
                          value={formData.phone} 
                          onChange={handleInputChange} 
                          required 
                          placeholder="Search by phone..."
                          className={isExistingPatient ? "bg-gray-100" : ""}
                        />

                        <Input 
                          label="Full Name" 
                          name="name" 
                          value={formData.name} 
                          onChange={handleInputChange} 
                          required 
                          placeholder="e.g. John Doe"
                        />
                        
                        <Input 
                          label="Age" 
                          name="age" 
                          type="number" 
                          value={formData.age} 
                          onChange={handleInputChange} 
                          required 
                          placeholder="30"
                        />
                        
                        <Select 
                          label="Gender" 
                          name="gender" 
                          value={formData.gender} 
                          onChange={handleInputChange}
                          options={[
                            { value: 'Male', label: 'Male' },
                            { value: 'Female', label: 'Female' },
                            { value: 'Other', label: 'Other' },
                          ]} 
                        />

                        <div className="md:col-span-2">
                          <Input 
                            label="Address" 
                            name="address" 
                            value={formData.address} 
                            onChange={handleInputChange} 
                            required 
                            placeholder="Full Street Address"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <div className="md:col-span-2">
                           <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                               <Plus className="text-primary-600" size={20} />
                               2. Current Consultation / Treatment
                           </h3>
                        </div>
                        
                        <Input 
                          label="Condition / Disease" 
                          name="diseases" 
                          value={formData.diseases} 
                          onChange={handleInputChange} 
                          placeholder="e.g. Viral Fever"
                          className="bg-white"
                          required
                        />
                        
                        <Input 
                          label="Diagnosis" 
                          name="diagnosis" 
                          value={formData.diagnosis} 
                          onChange={handleInputChange} 
                          placeholder="Current diagnosis"
                          className="bg-white"
                        />
                        
                        <div className="md:col-span-2">
                          <TextArea 
                            label="Prescription" 
                            name="prescription" 
                            value={formData.prescription} 
                            onChange={handleInputChange} 
                            placeholder="Medication details..."
                            rows={4}
                            className="bg-white"
                            required
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <TextArea 
                            label="Doctor Notes" 
                            name="notes" 
                            value={formData.notes} 
                            onChange={handleInputChange} 
                            placeholder="Additional observations..."
                            className="bg-white"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <Button type="submit" className="flex-1 shadow-lg py-3 text-lg" isLoading={loading}>
                          <Save size={20} />
                          {isExistingPatient ? 'Add Treatment to History' : 'Register & Save'}
                        </Button>
                      </div>
                    </form>
                 </Card>
             </div>

             {/* Right: History Sidebar (Only visible if existing) */}
             {isExistingPatient && existingHistory && (
                 <div className="w-80 animate-slide-in">
                     <div className="sticky top-6">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <History size={16} /> Medical History
                                </h3>
                                <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">{existingHistory.medicalHistory?.length || 0} Visits</span>
                            </div>
                            <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-4 space-y-4">
                                {existingHistory.medicalHistory?.map((visit, idx) => (
                                    <div key={idx} className="relative pl-4 border-l-2 border-gray-200 pb-4 last:pb-0">
                                        <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                                        <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                            <Calendar size={10} /> {new Date(visit.date).toLocaleDateString()}
                                        </div>
                                        <h4 className="font-bold text-gray-800 text-sm">{visit.disease}</h4>
                                        <p className="text-xs text-gray-600 mt-1 italic line-clamp-2">"{visit.diagnosis}"</p>
                                        <div className="mt-2 bg-gray-50 p-2 rounded text-xs font-mono text-gray-700 border border-gray-100">
                                            {visit.prescription}
                                        </div>
                                    </div>
                                ))}
                                {(!existingHistory.medicalHistory || existingHistory.medicalHistory.length === 0) && (
                                    <p className="text-sm text-gray-400 text-center py-4">No history recorded.</p>
                                )}
                            </div>
                        </div>
                     </div>
                 </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;