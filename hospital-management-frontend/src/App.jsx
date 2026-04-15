import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Home from './pages/Home';
import HospitalDetails from './pages/HospitalDetails';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Availability from './pages/Availability';
import Analytics from './pages/Analytics';
import Ambulance from './pages/Ambulance';
import AmbulanceDriver from './pages/AmbulanceDriver';
import AuthPage, { getSession, clearSession } from './pages/AuthPage';
import Gate from './pages/Gate';
import UserAuth from './pages/UserAuth';

import UserDashboard from './pages/UserDashboard';

function AppShell({ user, onLogout }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isDriverPage = location.pathname === '/ambulance-driver';
  const isPatient = user?.role === 'user';

  return (
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {!isPatient && (
        <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} user={user} onLogout={onLogout} />
      )}

      <div className={isPatient ? "main-content-fluid" : "main-content"}>
        {!isPatient && (
          <Topbar onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} user={user} onLogout={onLogout} />
        )}
        <div className={isDriverPage || isPatient ? '' : 'page-wrapper'}>
          <Routes>
            <Route index element={isPatient ? <UserDashboard user={user} /> : <Home />} />
            <Route path="/hospital" element={<HospitalDetails />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/availability" element={<Availability />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/ambulance" element={<Ambulance />} />
            <Route path="/ambulance-driver" element={<AmbulanceDriver />} />
            <Route path="*" element={
              <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>404</div>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginTop: 12, fontFamily: 'var(--font-heading)' }}>Page Not Found</h2>
                <p style={{ marginTop: 8 }}>The page you are looking for does not exist.</p>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
}

import { supabase } from './supabase';

export default function App() {
  const [user, setUser] = useState(() => getSession());
  const [authView, setAuthView] = useState('hospital'); // Default directly to login, bypassing intermediate Gate
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function recoverSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && !user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          handleAuth(profile);
        }
      }
      setAuthLoading(false);
    }
    recoverSession();
  }, []);

  function handleAuth(userData) {
    localStorage.setItem('hms_session', JSON.stringify(userData));
    setUser(userData);
  }

  function handleLogout() {
    clearSession();
    setUser(null);
    setAuthView('hospital');
    // Force a deterministic redirect to clear router history
    // and avoid hitting stale authenticated routes
    window.location.replace('/clinical-portal/');
  }

  return (
    <BrowserRouter basename="/clinical-portal">
      {user ? (
        <AppShell user={user} onLogout={handleLogout} />
      ) : (
        <Routes>
          <Route path="/" element={
            authView === 'hospital' ? <AuthPage onAuth={handleAuth} /> :
            authView === 'user' ? <UserAuth onAuth={handleAuth} /> :
            authView === 'driver' ? <Navigate to="/ambulance-driver-portal" replace /> :
            <AuthPage onAuth={handleAuth} />
          } />
          <Route path="/ambulance-driver-portal" element={<AmbulanceDriver onAuth={handleAuth} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}
