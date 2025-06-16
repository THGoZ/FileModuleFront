import type { UserRole } from "@/constants/enums";
import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import { Navigate, useLocation } from "react-router";

interface ProtectedRoutesProps {
  element: React.ReactElement;
  allowedRoles?: UserRole[];
}

const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({
  element,
  allowedRoles,
}) => {
  const { checkValid, tokenDetails } = useAuth();
  const isAuthenticated = checkValid();
  const location = useLocation();

  const [isValidating] = useState(false);

  if (isValidating) {
    return null;
  }

  if (!isAuthenticated) {
    console.log("no autenticado");
    return <Navigate to="/" state={{ from: location }} />;
  }

  if (!tokenDetails) {
    console.log("no token", tokenDetails);
    return <Navigate to="/" state={{ from: location }} />;
  }

  const hasValidRole =
    !allowedRoles || allowedRoles.includes(tokenDetails.role as UserRole);

  if (!hasValidRole) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{element}</>;
};

export default ProtectedRoutes;
