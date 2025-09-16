import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
  requiredRole,
  requireApproval,
}) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  if (requireApproval && user.role === "FREELANCER" && !user.is_approved) {
    return <Navigate to="/pending-approval" replace />;
  }

  return children;
}
