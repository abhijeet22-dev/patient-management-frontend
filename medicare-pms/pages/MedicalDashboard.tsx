import React, { useEffect, useState, useMemo } from 'react';
import { Patient, Visit } from '../types';
import { searchPatients } from '../services/patientService';
import { Button } from '../components/ui';
import { 
  Search, LogOut, Pill, Phone, User as UserIcon, 
  Clock, Calendar, History, ChevronRight, ChevronDown, Activity, AlertCircle, 
  Download, X, ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MedicalDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedPatientIds, setExpandedPatientIds] = useState<Set<string>>(new Set());
  const [showReportModal, setShowReportModal] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await searchPatients();
      // Sort by updated_at desc
      const sorted = data.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      setPatients(sorted);
    } catch (error) {
      console.error("Failed to load patients", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return patients;
    const lower = searchTerm.toLowerCase();
    return patients.filter(p => 
      p.name.toLowerCase().includes(lower) ||
      p.phone.includes(lower) ||
      p.diseases.toLowerCase().includes(lower) ||
      p.prescription.toLowerCase().includes(lower)
    );
  }, [patients, searchTerm]);

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedPatientIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedPatientIds(newSet);
  };

  const handleLogout = () => {
    localStorage.removeItem('medicare_auth');
    navigate('/medical-login');
  };

  const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  const formatTime = (isoString: string) => new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // --- REPORT LOGIC ---
  const dailyRecords = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    // Flatten all visits from all patients
    let allVisits: { patientName: string, phone: string, age: number, visit: Visit }[] = [];
    
    patients.forEach(p => {
        if (p.medicalHistory) {
            p.medicalHistory.forEach(v => {
                allVisits.push({
                    patientName: p.name,
                    phone: p.phone,
                    age: p.age,
                    visit: v
                });
            });
        }
    });

    return allVisits
      .filter(r => new Date(r.visit.date).setHours(0, 0, 0, 0) === today)
      .sort((a, b) => new Date(b.visit.date).getTime() - new Date(a.visit.date).getTime());
  }, [patients]);

  const handleDownloadReport = () => {
    if (dailyRecords.length === 0) {
      alert("No records found for today.");
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Time,Patient Name,Phone,Age,Disease,Diagnosis,Prescription\n";
    dailyRecords.forEach(row => {
      csvContent += [
        new Date(row.visit.date).toLocaleTimeString(),
        `"${row.patientName}"`,
        `"${row.phone}"`,
        `"${row.age}"`,
        `"${row.visit.disease}"`,
        `"${row.visit.diagnosis}"`,
        `"${row.visit.prescription.replace(/"/g, '""')}"`
      ].join(",") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Medical_Daily_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
       <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-2 rounded-lg shadow-sm">
              <Pill size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-none">Medical Store</h1>
              <span className="text-xs text-green-600 font-medium">Prescription Viewer</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setShowReportModal(true)} className="!py-1.5 !px-3 text-sm flex items-center gap-2 !bg-blue-600 hover:!bg-blue-700 text-white">
              <ClipboardList size={16} /> Daily Report
            </Button>
            <Button variant="outline" onClick={handleLogout} className="!py-1.5 !px-3 text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200">
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <Search className="text-green-600" size={24} />
              Find Patient & Treatments
            </h2>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-3 py-4 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:placeholder-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent sm:text-lg transition-all shadow-inner"
                placeholder="Search by Name, Phone, Disease..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Activity className="w-12 h-12 animate-spin mb-4 text-green-300" />
            <p>Accessing Secure Database...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPatients.map(patient => {
              const latestVisit = patient.medicalHistory?.[0] || {
                 disease: patient.diseases, 
                 diagnosis: patient.diagnosis, 
                 prescription: patient.prescription, 
                 date: patient.updated_at 
              };
              const historyCount = (patient.medicalHistory?.length || 0) - 1;
              const isExpanded = expandedPatientIds.has(patient.id);

              return (
                <div key={patient.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Patient Info */}
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-sm ${patient.gender === 'Female' ? 'bg-pink-400' : 'bg-blue-500'}`}>
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{patient.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Phone size={14} /> {patient.phone}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>{patient.age} Years</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>{patient.gender}</span>
                          </div>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-blue-100">
                          <Clock size={14} />
                          <span>{formatTime(latestVisit.date)}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Calendar size={12} /> {formatDate(latestVisit.date)}
                        </div>
                      </div>
                    </div>

                    {/* Latest Info */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                          <Activity size={14} className="text-red-500" /> Current Condition
                        </span>
                        <div className="font-semibold text-gray-800 text-lg">{latestVisit.disease}</div>
                        <div className="text-sm text-gray-600 mt-1 italic">"{latestVisit.diagnosis}"</div>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                          <Pill size={14} className="text-green-500" /> Prescribed Medication
                        </span>
                        <div className="font-mono text-sm bg-white p-3 rounded border border-gray-200 text-gray-700 border-l-4 border-l-green-500 shadow-sm">
                          {latestVisit.prescription}
                        </div>
                      </div>
                    </div>

                    {/* Footer / History Toggle */}
                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-sm">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${historyCount > 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                          {historyCount > 0 ? <AlertCircle size={12} /> : <UserIcon size={12} />}
                          {historyCount > 0 ? `${historyCount} Past Visit(s)` : 'First Visit'}
                        </span>
                      </div>
                      {historyCount > 0 && (
                        <button onClick={() => toggleExpand(patient.id)} className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors">
                          <History size={16} />
                          {isExpanded ? 'Hide History' : 'View History'}
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* History Panel */}
                  {isExpanded && historyCount > 0 && (
                    <div className="bg-gray-50 border-t border-gray-200 p-6 animate-fade-in">
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <History size={16} /> Previous Treatments
                      </h4>
                      <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                        {patient.medicalHistory?.slice(1).map((record) => (
                          <div key={record.id} className="relative pl-8">
                            <div className="absolute left-0 top-1.5 w-4.5 h-4.5 bg-gray-200 border-2 border-white rounded-full"></div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-gray-700">{record.disease}</span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {formatDate(record.date)} • {formatTime(record.date)}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div><span className="text-xs text-gray-400 block mb-0.5">Diagnosis</span>{record.diagnosis}</div>
                                <div><span className="text-xs text-gray-400 block mb-0.5">Prescription</span><span className="font-mono text-gray-600">{record.prescription}</span></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      
      {/* Daily Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <div>
                 <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><ClipboardList className="text-blue-600" /> Daily Medical Report</h2>
                 <p className="text-sm text-gray-500 mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
               </div>
               <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
               <div className="flex gap-4 mb-6">
                 <div className="bg-blue-50 p-4 rounded-xl flex-1 border border-blue-100">
                   <div className="text-sm text-blue-600 font-semibold mb-1 uppercase tracking-wide">Total Visits Today</div>
                   <div className="text-3xl font-bold text-blue-900">{dailyRecords.length}</div>
                 </div>
               </div>
               {dailyRecords.length === 0 ? (
                 <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl"><p>No medical activity recorded today.</p></div>
               ) : (
                 <div className="overflow-x-auto border border-gray-200 rounded-lg">
                   <table className="w-full text-left border-collapse">
                     <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                       <tr><th className="px-4 py-3 border-b">Time</th><th className="px-4 py-3 border-b">Patient</th><th className="px-4 py-3 border-b">Disease</th><th className="px-4 py-3 border-b">Prescription</th></tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100 text-sm">
                       {dailyRecords.map((r, i) => (
                         <tr key={i} className="hover:bg-gray-50">
                           <td className="px-4 py-3 whitespace-nowrap text-gray-500">{new Date(r.visit.date).toLocaleTimeString()}</td>
                           <td className="px-4 py-3 font-medium text-gray-900">{r.patientName}<div className="text-xs text-gray-400 font-normal">{r.phone}</div></td>
                           <td className="px-4 py-3">{r.visit.disease}<div className="text-xs text-gray-500">{r.visit.diagnosis}</div></td>
                           <td className="px-4 py-3 font-mono text-gray-600 text-xs">{r.visit.prescription}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowReportModal(false)} className="bg-white border border-gray-300 !text-gray-700 hover:bg-gray-50">Close</Button>
              <Button onClick={handleDownloadReport} disabled={dailyRecords.length === 0} className="!bg-green-600 hover:!bg-green-700 text-white shadow-green-200"><Download size={18} /> Download CSV Report</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalDashboard;