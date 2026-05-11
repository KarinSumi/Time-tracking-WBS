import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/Toast';
import './App.css';

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        {/* All authenticated routes use DashboardLayout as shell */}
        {['/','logs','projects','plans','team','reports','settings','admin'].map(p => (
          <Route key={p} path={p === '/' ? '/' : `/${p}`} element={
            <ProtectedRoute><DashboardLayout /></ProtectedRoute>
          } />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
