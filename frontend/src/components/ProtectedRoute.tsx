import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Mock auth check: check for a value in localStorage
  const isAuthenticated = !!localStorage.getItem('auth_token');

  if (!isAuthenticated) {
    // If not authenticated, redirect to /login
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render children
  return <>{children}</>;
};

export default ProtectedRoute;
