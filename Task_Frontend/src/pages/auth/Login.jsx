import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import "./Auth.css";

function Login({ onSwitch }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/expense/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      const authData = response.data?.paramObjectsMap?.auth;

      if (response.data?.status === false || !authData?.token) {
        throw new Error(
          response.data?.errors?.[0]?.details ||
          "Invalid email or password."
        );
      }

      login(authData);
      toast.success(`Welcome, ${authData.name}!`);
      navigate("/expenses", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.errors?.[0]?.details ||
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">E</div>
          <h2>ExpenseTracker</h2>
          <p>Personal Finance Management</p>
        </div>

      

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="auth-password">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <button
            type="button"
            className="auth-switch"
            onClick={onSwitch}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
