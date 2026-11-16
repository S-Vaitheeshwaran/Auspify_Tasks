import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import toast from "react-hot-toast";

import { useEcommerceAuth } from "../../../context/EcommerceAuthContext";

function AdminProfileMenu() {
  const navigate = useNavigate();
  const { admin, logout } = useEcommerceAuth();
  const displayName = admin?.name || admin?.firstName || "Admin";

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
    navigate("/ecommerce/admin/login", { replace: true });
  };

  return (
    <details className="admin-profile-menu">
      <summary className="admin-profile-trigger" aria-label="Admin profile menu">
        <span className="admin-profile-icon">
          <UserRound size={18} />
        </span>
        <span className="admin-profile-name">{displayName}</span>
        <ChevronDown size={16} />
      </summary>

      <div className="admin-profile-dropdown">
        <span className="admin-profile-dropdown-name">{displayName}</span>
        {admin?.email && (
          <span className="admin-profile-email">{admin.email}</span>
        )}
        <button type="button" onClick={handleLogout}>
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </details>
  );
}

export default AdminProfileMenu;
