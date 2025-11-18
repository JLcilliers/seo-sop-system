import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SOPRepository from './pages/SOPRepository';
import SOPDetail from './pages/SOPDetail';
import OnboardingDashboard from './pages/OnboardingDashboard';
import Layout from './components/Layout';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        
        <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="repository" element={<SOPRepository />} />
          <Route path="repository/:id" element={<SOPDetail />} />
          <Route path="onboarding" element={<OnboardingDashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
