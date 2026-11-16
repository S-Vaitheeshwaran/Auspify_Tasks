import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { useEcommerceAuth } from "../../context/EcommerceAuthContext";
import "./Auth.css";

function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdmin } = useEcommerceAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password) {
      toast.error("Please enter admin email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/ecommerce/admin/login", {
        email: form.email.trim(),
        password: form.password,
      });

      // Extract backend response
      const data = response.data?.paramObjectsMap;
      const adminResponse = data?.admin;

      // Support nested or flat admin response structures
      const admin = adminResponse?.admin ?? adminResponse;
      const token = adminResponse?.token ?? data?.token;

      if (response.data?.status !== true || !admin || !token) {
        throw new Error(data?.message || "Invalid admin login response");
      }

      // Save admin and token
      loginAdmin({
        admin,
        token,
      });

      toast.success("Admin login successful!");

      navigate("/ecommerce/admin/dashboard");
    } catch (error) {
      console.error("Admin login error:", error);

      toast.error(
        error.response?.data?.message ||
          error.response?.data?.paramObjectsMap?.message ||
          error.message ||
          "Admin login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <ShieldCheck size={30} />
        </div>

        <h1>Admin Login</h1>
        <p className="auth-subtitle">
          Sign in to manage your ShopSphere store.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Admin Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Enter admin email"
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>

            <div className="auth-password">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter admin password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Signing In..." : "Admin Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/ecommerce">Back to Shop</Link>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
