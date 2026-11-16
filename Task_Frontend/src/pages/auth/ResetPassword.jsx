
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import "./Auth.css";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    email: searchParams.get("email") || "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.newPassword.length < 8) {
      toast.error("Password must contain at least 8 characters");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/ecommerce/accounts/reset-password",
        {
          email: form.email.trim(),
          otp: form.otp.trim(),
          newPassword: form.newPassword
        }
      );

      if (response.data?.status === false) {
        throw new Error(
          response.data?.message || "Password reset failed"
        );
      }

      toast.success("Password reset successfully!");
      navigate("/ecommerce/login");
    } catch (error) {
      console.error("Reset password error:", error);

      toast.error(
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.details ||
        error.message ||
        "Password reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <LockKeyhole size={30} />
        </div>

        <h1>Reset Password</h1>
        <p className="auth-subtitle">
          Enter the OTP sent to your email and choose a new password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label>OTP</label>
            <input
              name="otp"
              value={form.otp}
              onChange={handleChange}
              placeholder="Enter OTP"
              required
            />
          </div>

          <div className="auth-field">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="auth-field">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/ecommerce/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
