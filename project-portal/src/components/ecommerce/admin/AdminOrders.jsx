
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../../services/api";
import { useEcommerceAuth } from "../../../context/EcommerceAuthContext";
import "../../../pages/ecommerce/Ecommerce.css";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED"
];

function AdminOrders() {
  const { token, isAdminAuthenticated } = useEcommerceAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get("/ecommerce/orders", authConfig);
      const data = response.data?.paramObjectsMap;

      const orderList =
        data?.orders ??
        data?.orderList ??
        response.data?.orders ??
        response.data?.orderList ??
        [];

      setOrders(Array.isArray(orderList) ? orderList : []);
    } catch (error) {
      console.error("Fetch orders error:", error);
      toast.error(
        error.response?.data?.message || "Unable to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated && token) {
      fetchOrders();
    }
  }, [isAdminAuthenticated, token]);

  const updateOrderStatus = async (orderId, status) => {
    if (!status) return;

    try {
      setUpdatingId(orderId);

      await api.put(
        `/ecommerce/orders/${orderId}/status`,
        { status },
        authConfig
      );

      toast.success("Order status updated successfully");
      setSelectedOrder(null);
      await fetchOrders();
    } catch (error) {
      console.error("Update order status error:", error);
      toast.error(
        error.response?.data?.message || "Unable to update order status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      String(order.orderNumber || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      String(order.customerId || "").includes(search);

    const matchesStatus =
      statusFilter === "ALL" || order.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN");
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
          <h1>Order Management</h1>
          <p>View customer orders and manage order processing.</p>
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
            onClick={fetchOrders}
          >
            Refresh Orders
          </button>
        </div>
      </div>

      <div className="admin-summary-grid">
        <div className="admin-summary-card">
          <span>Total Orders</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="admin-summary-card">
          <span>Pending</span>
          <strong>
            {orders.filter((o) => o.orderStatus === "PENDING").length}
          </strong>
        </div>
        <div className="admin-summary-card">
          <span>Processing</span>
          <strong>
            {orders.filter((o) => o.orderStatus === "PROCESSING").length}
          </strong>
        </div>
        <div className="admin-summary-card">
          <span>Delivered</span>
          <strong>
            {orders.filter((o) => o.orderStatus === "DELIVERED").length}
          </strong>
        </div>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-toolbar">
          <div>
            <h2>All Orders</h2>
            <p>{filteredOrders.length} orders found</p>
          </div>

          <div className="admin-filter-group">
            <input
              className="admin-search-input"
              type="search"
              placeholder="Search order or customer ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              className="admin-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">All Statuses</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="admin-loading">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="admin-empty">No orders found.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer ID</th>
                  <th>Order Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.orderNumber || `#${order.id}`}</td>
                    <td>{order.customerId}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      ₹{Number(order.totalAmount || 0).toFixed(2)}
                    </td>
                    <td>
                      <span
                        className={`admin-status ${String(
                          order.orderStatus || ""
                        ).toLowerCase()}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>
                      <button
                        className="admin-edit-btn"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View / Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="admin-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <span className="admin-eyebrow">ORDER DETAILS</span>
                <h2>{selectedOrder.orderNumber}</h2>
              </div>
              <button
                className="admin-modal-close"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>

            <div className="admin-order-information">
              <p>
                <strong>Customer ID:</strong> {selectedOrder.customerId}
              </p>
              <p>
                <strong>Order Date:</strong>{" "}
                {formatDate(selectedOrder.createdAt)}
              </p>
              <p>
                <strong>Total Amount:</strong> ₹
                {Number(selectedOrder.totalAmount || 0).toFixed(2)}
              </p>
              <p>
                <strong>Current Status:</strong>{" "}
                {selectedOrder.orderStatus}
              </p>
            </div>

            <h3>Order Items</h3>

            {selectedOrder.items?.length ? (
              <div className="admin-order-items">
                {selectedOrder.items.map((item) => (
                  <div
                    className="admin-order-item"
                    key={item.id || item.productId}
                  >
                    <div>
                      <strong>{item.productName}</strong>
                      <p>Quantity: {item.quantity}</p>
                    </div>
                    <strong>
                      ₹{Number(item.subtotal || 0).toFixed(2)}
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="admin-empty">No order items available.</p>
            )}

            <div className="admin-status-update">
              <label htmlFor="order-status">Update Order Status</label>
              <select
                id="order-status"
                className="admin-select"
                value={selectedOrder.orderStatus}
                onChange={(event) =>
                  setSelectedOrder((previous) => ({
                    ...previous,
                    orderStatus: event.target.value
                  }))
                }
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <button
                className="admin-primary-btn"
                disabled={updatingId === selectedOrder.id}
                onClick={() =>
                  updateOrderStatus(
                    selectedOrder.id,
                    selectedOrder.orderStatus
                  )
                }
              >
                {updatingId === selectedOrder.id
                  ? "Updating..."
                  : "Save Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
