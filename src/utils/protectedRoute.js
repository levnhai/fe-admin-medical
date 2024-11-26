import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, requiredRole }) => {
  const loginToken = Cookies.get('login');
  if (!loginToken) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(loginToken);

    if (requiredRole && !requiredRole.includes(decoded.role)) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
  } catch (error) {
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
