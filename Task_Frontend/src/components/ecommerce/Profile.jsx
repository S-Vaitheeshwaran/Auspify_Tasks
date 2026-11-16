
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  Save,
  Pencil,
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  RefreshCw,
  ShoppingBag
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { useEcommerceAuth } from "../../context/EcommerceAuthContext";
import MyOrders from "./MyOrders";
import "./../../pages/ecommerce/Ecommerce.css";

function Profile() {
  const { customer, token, logout } = useEcommerceAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const fetchProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await api.get(
        "/ecommerce/accounts/profile",
        authConfig
      );

      const data = response.data?.paramObjectsMap;

      if (response.data?.status !== true) {
        throw new Error(
          data?.message || "Unable to retrieve profile"
        );
      }

      // Supports common response wrappers.
      const customerData =
        data?.customer?.customer ??
        data?.customer ??
        data?.profile ??
        response.data?.customer ??
        response.data?.profile ??
        customer;

      if (!customerData) {
        throw new Error("Customer profile data not found");
      }

      setProfile({
        firstName: customerData.firstName || "",
        lastName: customerData.lastName || "",
        email: customerData.email || "",
        phone: customerData.phone || ""
      });
    } catch (error) {
      console.error("Fetch profile error:", error);

      toast.error(
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.message ||
        error.message ||
        "Unable to load profile"
      );

      // Use authenticated context as a fallback.
      if (customer) {
        setProfile({
          firstName: customer.firstName || "",
          lastName: customer.lastName || "",
          email: customer.email || "",
          phone: customer.phone || ""
        });
      }
    } finally {
      setLoading(false);
    }
  }, [token, customer]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const validateProfile = () => {
    if (!profile.firstName.trim()) {
      toast.error("First name is required");
      return false;
    }

    if (!profile.lastName.trim()) {
      toast.error("Last name is required");
      return false;
    }

    if (!/^[A-Za-z ]+$/.test(profile.firstName.trim())) {
      toast.error("First name must contain only letters");
      return false;
    }

    if (!/^[A-Za-z ]+$/.test(profile.lastName.trim())) {
      toast.error("Last name must contain only letters");
      return false;
    }

    if (
      profile.phone &&
      !/^[0-9]{10,15}$/.test(profile.phone.trim())
    ) {
      toast.error("Enter a valid phone number");
      return false;
    }

    return true;
  };

  const updateProfile = async (event) => {
    event.preventDefault();

    if (!validateProfile()) return;

    const customerId = customer?.id;

    if (!customerId) {
      toast.error("Customer ID is not available");
      return;
    }

    try {
      setSaving(true);

      const request = {
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        phone: profile.phone.trim()
      };

      const response = await api.put(
        `/ecommerce/accounts/profile/${customerId}`,
        request,
        authConfig
      );

      if (response.data?.status !== true) {
        throw new Error(
          response.data?.paramObjectsMap?.message ||
          "Unable to update profile"
        );
      }

      toast.success("Profile updated successfully");
      setEditing(false);

      await fetchProfile();
    } catch (error) {
      console.error("Update profile error:", error);

      toast.error(
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.message ||
        error.message ||
        "Unable to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const updatePassword = async (event) => {
    event.preventDefault();

    if (!passwordData.currentPassword) {
      toast.error("Enter your current password");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must contain at least 8 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error("New password must be different");
      return;
    }

    try {
      setChangingPassword(true);

      const request = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      };

      const response = await api.put(
        "/ecommerce/accounts/change-password",
        request,
        authConfig
      );

      if (response.data?.status !== true) {
        throw new Error(
          response.data?.paramObjectsMap?.message ||
          "Unable to change password"
        );
      }

      logout();
      toast.success("Password changed. Please sign in again.");
      navigate("/ecommerce/login", { replace: true });
    } catch (error) {
      console.error("Change password error:", error);

      toast.error(
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.message ||
        error.message ||
        "Unable to change password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const togglePassword = (field) => {
    setShowPasswords((previous) => ({
      ...previous,
      [field]: !previous[field]
    }));
  };

  if (loading) {
    return (
      <div className="profile-state">
        <div className="cart-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Page Header */}
        <div className="profile-heading">
          <div>
            <span className="profile-eyebrow">
              YOUR SHOPSPHERE ACCOUNT
            </span>
            <h1>My Account</h1>
            <p>
              Hello, {profile.firstName || customer?.firstName || "Customer"}!
            </p>
          </div>

          <div className="profile-header-actions">
            <Link to="/ecommerce" className="profile-back-link">
              <ArrowLeft size={16} />
              Back to Shop
            </Link>

            {activeTab === "profile" && (
              <button
                type="button"
                className="profile-refresh-button"
                onClick={fetchProfile}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            )}
          </div>
        </div>

        <div
          className="profile-account-tabs"
          role="tablist"
          aria-label="Account sections"
        >
          <button
            type="button"
            id="profile-tab"
            role="tab"
            aria-selected={activeTab === "profile"}
            aria-controls="profile-tab-panel"
            className="profile-account-tab"
            onClick={() => setActiveTab("profile")}
          >
            <UserRound size={19} />
            <span>My Profile</span>
          </button>
          <button
            type="button"
            id="orders-tab"
            role="tab"
            aria-selected={activeTab === "orders"}
            aria-controls="profile-tab-panel"
            className="profile-account-tab"
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingBag size={19} />
            <span>My Orders</span>
          </button>
        </div>

        <div
          className="profile-tab-panel"
          id="profile-tab-panel"
          role="tabpanel"
          aria-labelledby={
            activeTab === "profile" ? "profile-tab" : "orders-tab"
          }
        >
          {activeTab === "profile" ? (
            <>
              <div className="profile-overview">
                <div className="profile-avatar">
                  <UserRound size={38} />
                </div>

                <div className="profile-overview-info">
                  <h2>
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p>{profile.email}</p>
                  <span>
                    <ShieldCheck size={14} />
                    Customer Account
                  </span>
                </div>
              </div>

              <div className="profile-layout">
                {/* Personal Information */}
                <section className="profile-card">
                  <div className="profile-card-heading">
                    <div>
                      <h2>Personal Information</h2>
                      <p>Manage your registered customer details.</p>
                    </div>

                    {!editing ? (
                      <button
                        type="button"
                        className="profile-edit-button"
                        onClick={() => setEditing(true)}
                      >
                        <Pencil size={15} />
                        Edit
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="profile-cancel-button"
                        onClick={() => {
                          setEditing(false);
                          fetchProfile();
                        }}
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    )}
                  </div>

                  <form onSubmit={updateProfile}>
                    <div className="profile-form-grid">
                      <div className="profile-field">
                        <label htmlFor="firstName">First Name</label>
                        <div className="profile-input-wrapper">
                          <UserRound size={17} />
                          <input
                            id="firstName"
                            name="firstName"
                            value={profile.firstName}
                            onChange={handleProfileChange}
                            disabled={!editing}
                            placeholder="Enter first name"
                          />
                        </div>
                      </div>

                      <div className="profile-field">
                        <label htmlFor="lastName">Last Name</label>
                        <div className="profile-input-wrapper">
                          <UserRound size={17} />
                          <input
                            id="lastName"
                            name="lastName"
                            value={profile.lastName}
                            onChange={handleProfileChange}
                            disabled={!editing}
                            placeholder="Enter last name"
                          />
                        </div>
                      </div>

                      <div className="profile-field">
                        <label htmlFor="email">Email Address</label>
                        <div className="profile-input-wrapper">
                          <Mail size={17} />
                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={profile.email}
                            disabled
                          />
                        </div>
                        <small>Email cannot be changed here.</small>
                      </div>

                      <div className="profile-field">
                        <label htmlFor="phone">Phone Number</label>
                        <div className="profile-input-wrapper">
                          <Phone size={17} />
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={profile.phone}
                            onChange={handleProfileChange}
                            disabled={!editing}
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                    </div>

                    {editing && (
                      <div className="profile-form-actions">
                        <button
                          type="submit"
                          className="profile-save-button"
                          disabled={saving}
                        >
                          <Save size={16} />
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    )}
                  </form>
                </section>

                {/* Change Password */}
                <section className="profile-card">
                  <div className="profile-card-heading">
                    <div>
                      <h2>Change Password</h2>
                      <p>Keep your account secure with a strong password.</p>
                    </div>

                    <div className="profile-security-icon">
                      <LockKeyhole size={21} />
                    </div>
                  </div>

                  <form onSubmit={updatePassword}>
                    {[
                      {
                        name: "currentPassword",
                        label: "Current Password",
                        key: "current"
                      },
                      {
                        name: "newPassword",
                        label: "New Password",
                        key: "new"
                      },
                      {
                        name: "confirmPassword",
                        label: "Confirm New Password",
                        key: "confirm"
                      }
                    ].map((field) => (
                      <div className="profile-field" key={field.name}>
                        <label htmlFor={field.name}>{field.label}</label>

                        <div className="profile-input-wrapper">
                          <LockKeyhole size={17} />

                          <input
                            id={field.name}
                            name={field.name}
                            type={
                              showPasswords[field.key] ? "text" : "password"
                            }
                            value={passwordData[field.name]}
                            onChange={handlePasswordChange}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            autoComplete="new-password"
                          />

                          <button
                            type="button"
                            className="profile-password-toggle"
                            onClick={() => togglePassword(field.key)}
                            aria-label={`Toggle ${field.label}`}
                          >
                            {showPasswords[field.key]
                              ? <EyeOff size={17} />
                              : <Eye size={17} />}
                          </button>
                        </div>
                      </div>
                    ))}

                    <p className="profile-password-hint">
                      Use at least 8 characters for your new password.
                    </p>

                    <button
                      type="submit"
                      className="profile-save-button profile-password-submit"
                      disabled={changingPassword}
                    >
                      <LockKeyhole size={16} />
                      {changingPassword
                        ? "Updating..."
                        : "Update Password"}
                    </button>
                  </form>
                </section>

              </div>
            </>
          ) : (
            <MyOrders embedded />
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
