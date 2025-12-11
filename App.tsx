import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import MedicalDashboard from './pages/MedicalDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // --- MOCK AUTH CHECK ---
    const checkAuth = () => {
      const authData = localStorage.getItem('medicare_auth');
      setIsAuthenticated(!!authData);
    };
    
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login targetRole="admin" />} />
        <Route path="/medical-login" element={<Login targetRole="medical" />} />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/medical" 
          element={
            <ProtectedRoute>
              <MedicalDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
