
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import "./Auth.css";

function CustomerRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must contain at least 8 characters");
      return;
    }

    if (!/^\d{10}$/.test(form.phone)) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password
      };

      const response = await api.post(
        "/ecommerce/accounts/register",
        payload
      );

      if (response.data?.status === false) {
        throw new Error(
          response.data?.message || "Registration failed"
        );
      }

      toast.success("Account created successfully!");
      navigate("/ecommerce/login");
    } catch (error) {
      console.error("Customer registration error:", error);

      toast.error(
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.details ||
        error.message ||
        "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-logo">
          <UserPlus size={30} />
        </div>

        <h1>Create Account</h1>
        <p className="auth-subtitle">
          Join ShopSphere and start shopping.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="auth-grid">
            <div className="auth-field">
              <label>First Name</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
              />
            </div>

            <div className="auth-field">
              <label>Last Name</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="10-digit phone number"
              maxLength={10}
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="auth-password">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
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

          <div className="auth-field">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already registered?
          <Link to="/ecommerce/login"> Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default CustomerRegister;
