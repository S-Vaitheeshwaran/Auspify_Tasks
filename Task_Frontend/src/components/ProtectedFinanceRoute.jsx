
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedFinanceRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/finance/login" replace />;
  }

  return children;
}

export default ProtectedFinanceRoute;
