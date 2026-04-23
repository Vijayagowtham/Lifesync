import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ user, allowedRoles, children }) {
  const location = useLocation();

  // If user is not authenticated, send them to login screen
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If a role array is provided and user's role is not in it, block access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect logic based on what their role actually is
    if (user.role === 'user') {
      window.location.href = '/';
      return null;
    } else if (user.role === 'hospital') {
      return <Navigate to="/hospital-dashboard" replace />;
    } else {
      // Fallback
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
