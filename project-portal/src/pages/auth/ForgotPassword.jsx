
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import "./Auth.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post(
        "/ecommerce/accounts/forgot-password",
        { email: email.trim() }
      );

      if (response.data?.status === false) {
        throw new Error(
          response.data?.message || "Unable to send OTP"
        );
      }

      toast.success("OTP request submitted. Check your email.");

      navigate(
        `/ecommerce/reset-password?email=${encodeURIComponent(email.trim())}`
      );
    } catch (error) {
      console.error("Forgot password error:", error);

      toast.error(
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.details ||
        error.message ||
        "Unable to process request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Mail size={30} />
        </div>

        <h1>Forgot Password?</h1>
        <p className="auth-subtitle">
          Enter your registered email address. We'll send you a
          password reset OTP.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter registered email"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <p className="auth-switch">
          Remember your password?
          <Link to="/ecommerce/login"> Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
