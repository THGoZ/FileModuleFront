import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router';

interface PublicRoutesProps {
  element: React.ReactNode;
}

const PublicRoutes: React.FC<PublicRoutesProps> = ({ element }) => {
  const { checkValid } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  useEffect(() => {
    setIsAuthenticated(checkValid());
  }, []);


  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{element}</>;
};

export default PublicRoutes;