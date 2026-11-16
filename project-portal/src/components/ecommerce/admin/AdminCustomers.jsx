
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../../services/api";
import { useEcommerceAuth } from "../../../context/EcommerceAuthContext";
import "../../../pages/ecommerce/Ecommerce.css";

// Replace this with the actual GET endpoint from your Swagger UI.
const CUSTOMER_LIST_ENDPOINT = "/ecommerce/admin/customers";

function AdminCustomers() {
  const { token, isAdminAuthenticated } = useEcommerceAuth();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        CUSTOMER_LIST_ENDPOINT,
        authConfig
      );

      const data = response.data?.paramObjectsMap;

      const customerList =
        data?.customers ??
        data?.customerList ??
        response.data?.customers ??
        response.data?.customerList ??
        [];

      if (!Array.isArray(customerList)) {
        throw new Error("Unexpected customer list response format");
      }

      setCustomers(customerList);
    } catch (error) {
      console.error("Fetch customers error:", error);
      setCustomers([]);

      toast.error(
        error.response?.data?.message ||
          "Unable to load customers. Verify the customer-list API endpoint."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated && token) {
      fetchCustomers();
    }
  }, [isAdminAuthenticated, token]);

  const filteredCustomers = customers.filter((customer) => {
    const searchText = search.toLowerCase();

    const fullName =
      `${customer.firstName || ""} ${customer.lastName || ""}`.toLowerCase();

    return (
      fullName.includes(searchText) ||
      customer.email?.toLowerCase().includes(searchText) ||
      String(customer.phone || "").includes(searchText)
    );
  });

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN");
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="admin-access-denied">
        <h2>Admin access required</h2>
        <Link to="/ecommerce/admin/login">Admin Login</Link>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-eyebrow">SHOPSPHERE ADMIN</span>
          <h1>Customer Management</h1>
          <p>View and manage your registered store customers.</p>
        </div>

        <div className="admin-header-actions">
          <Link
            to="/ecommerce/admin/dashboard"
            className="admin-back-link"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <button
            className="admin-secondary-btn"
            onClick={fetchCustomers}
          >
            Refresh Customers
          </button>
        </div>
      </div>

      <div className="admin-summary-grid">
        <div className="admin-summary-card">
          <span>Total Customers</span>
          <strong>{customers.length}</strong>
        </div>

        <div className="admin-summary-card">
          <span>Active Customers</span>
          <strong>
            {customers.filter((customer) => customer.active).length}
          </strong>
        </div>

        <div className="admin-summary-card">
          <span>Inactive Customers</span>
          <strong>
            {customers.filter((customer) => !customer.active).length}
          </strong>
        </div>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-toolbar">
          <div>
            <h2>Registered Customers</h2>
            <p>{filteredCustomers.length} customers found</p>
          </div>

          <input
            className="admin-search-input"
            type="search"
            placeholder="Search name, email or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <p className="admin-loading">Loading customers...</p>
        ) : filteredCustomers.length === 0 ? (
          <p className="admin-empty">
            No customers found, or the customer-list API is not configured.
          </p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Registered Date</th>
                  <th>Account Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="admin-customer-cell">
                        <div className="admin-avatar">
                          {customer.firstName?.charAt(0)?.toUpperCase() || "C"}
                        </div>
                        <div>
                          <strong>
                            {customer.firstName} {customer.lastName}
                          </strong>
                          <small>Customer #{customer.id}</small>
                        </div>
                      </div>
                    </td>

                    <td>{customer.email}</td>
                    <td>{customer.phone || "—"}</td>
                    <td>{formatDate(customer.createdAt)}</td>
                    <td>
                      <span
                        className={`admin-status ${
                          customer.active ? "active" : "inactive"
                        }`}
                      >
                        {customer.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCustomers;
