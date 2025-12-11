import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/ui';
import { Stethoscope, Pill, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types';

interface LoginProps {
  targetRole: UserRole;
}

const Login: React.FC<LoginProps> = ({ targetRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // --- MOCK LOGIN LOGIC ---
    setTimeout(() => {
      if (email === 'admin' && password === 'admin') {
        // Set mock session
        localStorage.setItem('medicare_auth', JSON.stringify({
          uid: 'test-user-123',
          role: targetRole,
          name: 'Test Admin'
        }));
        
        navigate(targetRole === 'admin' ? '/admin' : '/medical');
      } else {
        setError('Invalid credentials. Try "admin" / "admin" for testing.');
      }
      setLoading(false);
    }, 1000);
  };

  const isDoctor = targetRole === 'admin';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-50 to-transparent z-0"></div>
      
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 z-10 items-center">
        
        {/* Left Side: Illustration */}
        <div className="hidden md:block">
          <img 
            src="https://img.freepik.com/free-vector/health-professional-team-concept-illustration_114360-1618.jpg" 
            alt="Medical Team"
            className="w-full h-auto object-contain mix-blend-multiply" 
          />
          <div className="text-center mt-6">
            <h2 className="text-2xl font-bold text-gray-800">MediCare System</h2>
            <p className="text-gray-600 mt-2">Secure patient management for modern healthcare facilities.</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className={`mx-auto w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center mb-6 transform rotate-3 transition-transform hover:rotate-0 ${isDoctor ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' : 'bg-gradient-to-br from-green-500 to-green-600 text-white'}`}>
              {isDoctor ? <Stethoscope size={40} /> : <Pill size={40} />}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {isDoctor ? 'Doctor Portal' : 'Medical Store'}
            </h1>
            <p className="text-gray-500 mt-2">Testing Environment Access</p>
          </div>

          <Card className={`shadow-xl border-t-4 ${isDoctor ? 'border-t-primary-600' : 'border-t-green-600'}`}>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold">Demo Credentials:</p>
                <p>Email: <span className="font-mono bg-blue-100 px-1 rounded">admin</span></p>
                <p>Password: <span className="font-mono bg-blue-100 px-1 rounded">admin</span></p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 animate-pulse">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              
              <Input
                label="Email / Username"
                type="text"
                placeholder="admin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="•••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button 
                type="submit" 
                className={`w-full py-3 text-lg ${!isDoctor ? '!bg-green-600 hover:!bg-green-700' : ''}`} 
                isLoading={loading}
              >
                Enter Demo Mode
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Switch Role?{' '}
                <button 
                  onClick={() => navigate(isDoctor ? '/medical-login' : '/')}
                  className={`font-semibold hover:underline focus:outline-none ${isDoctor ? 'text-primary-600' : 'text-green-600'}`}
                >
                  Go to {isDoctor ? 'Medical Store' : 'Doctor'} Login
                </button>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
