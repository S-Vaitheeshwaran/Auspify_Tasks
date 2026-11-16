import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { useEcommerceAuth } from "../../context/EcommerceAuthContext";
import "./Auth.css";

function CustomerLogin() {
  const navigate = useNavigate();
  const { loginCustomer } = useEcommerceAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/ecommerce/accounts/login", {
        email: form.email.trim(),
        password: form.password,
      });

      // Extract the actual backend response
      const data = response.data?.paramObjectsMap;
      const customerResponse = data?.customer;

      const customer = customerResponse?.customer;
      const token = customerResponse?.token;

      if (response.data?.status !== true || !customer || !token) {
        throw new Error(data?.message || "Invalid login response");
      }

      // Save customer and token in EcommerceAuthContext
      loginCustomer({
        customer,
        token,
      });

      toast.success("Customer login successful!");

      navigate("/ecommerce");
    } catch (error) {
      console.error("Customer login error:", error);

      toast.error(
        error.response?.data?.message ||
          error.response?.data?.paramObjectsMap?.message ||
          error.message ||
          "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <ShoppingBag size={30} />
        </div>

        <h1>Welcome Back</h1>
        <p className="auth-subtitle">
          Sign in to continue shopping with ShopSphere.
        </p>

        <form onSubmit={handleSubmit}>
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
            <label>Password</label>
            <div className="auth-password">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
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

          <div className="auth-forgot">
            <Link to="/ecommerce/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?
          <Link to="/ecommerce/register"> Create Account</Link>
        </p>

        <Link to="/ecommerce" className="auth-back">
          Back to Shop
        </Link>
      </div>
    </div>
  );
}

export default CustomerLogin;
