import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { initializeDemoData } from './storage/initStorage';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { PatientLayout } from './components/layout/PatientSidebar';
import { HospitalLayout } from './components/layout/HospitalSidebar';
import { ChatBot } from './components/chatbot/ChatBot';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import HospitalsPage from './pages/public/HospitalsPage';
import HospitalDetailPage from './pages/public/HospitalDetailPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import BookAppointment from './pages/patient/BookAppointment';
import PatientDoctors from './pages/patient/PatientDoctors';
import PatientNotifications from './pages/patient/PatientNotifications';
import PatientMedicalRecords from './pages/patient/PatientMedicalRecords';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import PatientProfile from './pages/patient/PatientProfile';
import PatientSettings from './pages/patient/PatientSettings';
import AIAssistantPage from './pages/patient/AIAssistantPage';

// Hospital Pages
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import HospitalAppointments from './pages/hospital/HospitalAppointments';
import HospitalDoctors from './pages/hospital/HospitalDoctors';
import HospitalPatients from './pages/hospital/HospitalPatients';
import HospitalDepartments from './pages/hospital/HospitalDepartments';
import HospitalSchedule from './pages/hospital/HospitalSchedule';
import HospitalRecords from './pages/hospital/HospitalRecords';
import HospitalPrescriptions from './pages/hospital/HospitalPrescriptions';
import HospitalAnalytics from './pages/hospital/HospitalAnalytics';
import HospitalNotifications from './pages/hospital/HospitalNotifications';
import HospitalProfile from './pages/hospital/HospitalProfile';
import HospitalSettings from './pages/hospital/HospitalSettings';

// Seed on startup
initializeDemoData();

// 404 Page
function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <p className="text-8xl font-bold text-blue-600 font-heading">404</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-4 mb-2">Page not found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" className="btn-primary">Go Home</a>
      </div>
    </div>
  );
}

// Route Guards
function RequireAuth({ children, role }: { children: React.ReactNode; role?: 'patient' | 'hospital' }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <LoadingSpinner fullPage text="Loading..." />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role && user?.role !== role) return <Navigate to={user?.role === 'hospital' ? '/hospital/dashboard' : '/patient/dashboard'} replace />;
  return <>{children}</>;
}

function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner fullPage text="Loading..." />;
  if (isAuthenticated) return <Navigate to={user?.role === 'hospital' ? '/hospital/dashboard' : '/patient/dashboard'} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/hospitals" element={<HospitalsPage />} />
        <Route path="/hospitals/:id" element={<HospitalDetailPage />} />

        {/* Auth */}
        <Route path="/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
        <Route path="/register" element={<RedirectIfAuth><RegisterPage /></RedirectIfAuth>} />

        {/* Patient Routes */}
        <Route path="/patient/*" element={
          <RequireAuth role="patient">
            <PatientLayout>
              <Routes>
                <Route path="dashboard" element={<PatientDashboard />} />
                <Route path="appointments" element={<PatientAppointments />} />
                <Route path="book" element={<BookAppointment />} />
                <Route path="hospitals" element={<HospitalsPage />} />
                <Route path="doctors" element={<PatientDoctors />} />
                <Route path="notifications" element={<PatientNotifications />} />
                <Route path="records" element={<PatientMedicalRecords />} />
                <Route path="prescriptions" element={<PatientPrescriptions />} />
                <Route path="profile" element={<PatientProfile />} />
                <Route path="settings" element={<PatientSettings />} />
                <Route path="ai-assistant" element={<AIAssistantPage />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </PatientLayout>
          </RequireAuth>
        } />

        {/* Hospital Routes */}
        <Route path="/hospital/*" element={
          <RequireAuth role="hospital">
            <HospitalLayout>
              <Routes>
                <Route path="dashboard" element={<HospitalDashboard />} />
                <Route path="appointments" element={<HospitalAppointments />} />
                <Route path="doctors" element={<HospitalDoctors />} />
                <Route path="patients" element={<HospitalPatients />} />
                <Route path="departments" element={<HospitalDepartments />} />
                <Route path="schedule" element={<HospitalSchedule />} />
                <Route path="records" element={<HospitalRecords />} />
                <Route path="prescriptions" element={<HospitalPrescriptions />} />
                <Route path="analytics" element={<HospitalAnalytics />} />
                <Route path="notifications" element={<HospitalNotifications />} />
                <Route path="profile" element={<HospitalProfile />} />
                <Route path="settings" element={<HospitalSettings />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </HospitalLayout>
          </RequireAuth>
        } />

        {/* Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Floating Chatbot on public pages */}
      {!isAuthenticated && <ChatBot />}
      {isAuthenticated && user?.role === 'patient' && <ChatBot />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '12px', fontSize: '14px' },
            }}
            richColors
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
