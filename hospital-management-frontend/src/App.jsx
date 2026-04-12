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

export default function App() {
  const [user, setUser] = useState(() => getSession());
  const [authView, setAuthView] = useState('gate'); // 'gate' | 'user' | 'hospital' | 'driver'

  function handleAuth(userData) {
    localStorage.setItem('hms_session', JSON.stringify(userData));
    setUser(userData);
  }

  function handleLogout() {
    clearSession();
    setUser(null);
    setAuthView('gate');
  }

  return (
    <BrowserRouter basename="/clinical-portal">
      {user ? (
        <AppShell user={user} onLogout={handleLogout} />
      ) : (
        <Routes>
          <Route path="/" element={
            authView === 'gate' ? <Gate onSelect={setAuthView} onAuth={handleAuth} /> :
            authView === 'user' ? <UserAuth onAuth={handleAuth} /> :
            authView === 'hospital' ? <AuthPage onAuth={handleAuth} /> :
            authView === 'driver' ? <Navigate to="/ambulance-driver-portal" /> :
            <Gate onSelect={setAuthView} onAuth={handleAuth} />
          } />
          <Route path="/ambulance-driver-portal" element={<AmbulanceDriver onAuth={handleAuth} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}
