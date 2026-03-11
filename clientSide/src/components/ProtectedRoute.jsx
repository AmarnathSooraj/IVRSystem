import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const adminUser = localStorage.getItem('adminUser');
  
  if (!adminUser) {
    // If user is not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }
  
  // If user is logged in, render the protected component
  return children;
};

export default ProtectedRoute;
