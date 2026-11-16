
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  ShoppingBag,
  RefreshCw,
  XCircle,
  Eye,
  CalendarDays,
  Receipt,
  Clock,
  CheckCircle,
  Truck
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { useEcommerceAuth } from "../../context/EcommerceAuthContext";
import "./../../pages/ecommerce/Ecommerce.css";

function MyOrders({ embedded = false }) {
  const { customer, token, isCustomerAuthenticated } =
    useEcommerceAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const fetchOrders = useCallback(async () => {
    if (!isCustomerAuthenticated || !token) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await api.get(
        "/ecommerce/orders/MyOrders",
        authConfig
      );

      const data = response.data?.paramObjectsMap;

      if (response.data?.status !== true) {
        throw new Error(
          data?.message || "Unable to retrieve orders"
        );
      }

      // Support the common response shapes.
      const orderList =
        data?.orders ??
        data?.orderList ??
        response.data?.orders ??
        [];

      setOrders(Array.isArray(orderList) ? orderList : []);
    } catch (error) {
      console.error("Fetch orders error:", error);

      toast.error(
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.message ||
        error.message ||
        "Unable to load your orders"
      );

      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [token, isCustomerAuthenticated]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(Number(price) || 0);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "pending";

      case "CONFIRMED":
        return "confirmed";

      case "PROCESSING":
        return "processing";

      case "SHIPPED":
        return "shipped";

      case "DELIVERED":
        return "delivered";

      case "CANCELLED":
        return "cancelled";

      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED":
        return <CheckCircle size={15} />;

      case "SHIPPED":
        return <Truck size={15} />;

      case "CANCELLED":
        return <XCircle size={15} />;

      case "PROCESSING":
        return <Package size={15} />;

      default:
        return <Clock size={15} />;
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await api.get(
        `/ecommerce/orders/${orderId}`,
        authConfig
      );

      const order =
        response.data?.paramObjectsMap?.order;

      if (response.data?.status !== true || !order) {
        throw new Error("Unable to retrieve order details");
      }

      setSelectedOrder(order);
    } catch (error) {
      console.error("Order details error:", error);

      toast.error(
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.message ||
        "Unable to load order details"
      );
    }
  };

  const cancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      setCancellingOrder(orderId);

      await api.put(
        `/ecommerce/orders/${orderId}/cancel`,
        {},
        authConfig
      );

      toast.success("Order cancelled successfully");

      setSelectedOrder(null);
      await fetchOrders();
    } catch (error) {
      console.error("Cancel order error:", error);

      toast.error(
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.message ||
        "Unable to cancel order"
      );
    } finally {
      setCancellingOrder(null);
    }
  };

  const canCancel = (status) =>
    ["PENDING", "CONFIRMED"].includes(
      status?.toUpperCase()
    );

  if (!isCustomerAuthenticated || !token) {
    return (
      <div className="orders-state">
        <ShoppingBag size={52} />
        <h2>Please log in to view your orders</h2>
        <p>Sign in to access your order history.</p>

        <Link
          to="/ecommerce/login"
          className="orders-primary-button"
        >
          Customer Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="orders-state">
        <div className="cart-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className={`orders-page${embedded ? " orders-page--embedded" : ""}`}>
      <div className="orders-container">

        {!embedded && (
          <div className="orders-heading">
            <div>
              <span className="orders-eyebrow">
                YOUR SHOPSPHERE ACCOUNT
              </span>

              <h1>My Orders</h1>

              <p>
                Welcome back, {customer?.firstName}.
                Track and manage your purchases here.
              </p>
            </div>

            <Link
              to="/ecommerce"
              className="orders-back-link"
            >
              <ArrowLeft size={17} />
              Continue Shopping
            </Link>
          </div>
        )}

        {/* Order Statistics */}
        <div className="orders-stats">
          <div className="orders-stat-card">
            <div className="orders-stat-icon">
              <ShoppingBag size={22} />
            </div>

            <div>
              <span>Total Orders</span>
              <strong>{orders.length}</strong>
            </div>
          </div>

          <div className="orders-stat-card">
            <div className="orders-stat-icon">
              <Package size={22} />
            </div>

            <div>
              <span>Processing</span>
              <strong>
                {
                  orders.filter((order) =>
                    ["PENDING", "CONFIRMED", "PROCESSING"].includes(
                      order.orderStatus?.toUpperCase()
                    )
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="orders-stat-card">
            <div className="orders-stat-icon">
              <CheckCircle size={22} />
            </div>

            <div>
              <span>Delivered</span>
              <strong>
                {
                  orders.filter(
                    (order) =>
                      order.orderStatus?.toUpperCase() === "DELIVERED"
                  ).length
                }
              </strong>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="orders-list-heading">
          <div>
            <h2>Order History</h2>
            <p>{orders.length} orders found</p>
          </div>

          <button
            type="button"
            className="orders-refresh-button"
            onClick={fetchOrders}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">
              <ShoppingBag size={48} />
            </div>

            <h2>No orders yet</h2>

            <p>
              You haven't placed any orders. Start shopping
              and your purchases will appear here.
            </p>

            <Link
              to="/ecommerce"
              className="orders-primary-button"
            >
              Explore Products
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <article
                className="orders-card"
                key={order.id}
              >
                <div className="orders-card-header">
                  <div className="orders-card-info">
                    <div>
                      <span>ORDER NUMBER</span>
                      <strong>{order.orderNumber}</strong>
                    </div>

                    <div>
                      <span>ORDER DATE</span>
                      <strong>
                        <CalendarDays size={14} />
                        {formatDate(order.createdAt)}
                      </strong>
                    </div>
                  </div>

                  <span
                    className={`orders-status ${getStatusClass(
                      order.orderStatus
                    )}`}
                  >
                    {getStatusIcon(order.orderStatus)}
                    {order.orderStatus}
                  </span>
                </div>

                <div className="orders-card-body">
                  <div className="orders-product-summary">
                    <div className="orders-product-icon">
                      <Package size={28} />
                    </div>

                    <div>
                      <h3>
                        {order.items?.length || 0} Product(s)
                      </h3>
                      <p>
                        Order ID: #{order.id}
                      </p>
                    </div>
                  </div>

                  <div className="orders-total">
                    <span>Order Total</span>
                    <strong>
                      {formatPrice(order.totalAmount)}
                    </strong>
                  </div>
                </div>

                <div className="orders-card-footer">
                  <button
                    type="button"
                    className="orders-view-button"
                    onClick={() => viewOrderDetails(order.id)}
                  >
                    <Eye size={16} />
                    View Details
                  </button>

                  {canCancel(order.orderStatus) && (
                    <button
                      type="button"
                      className="orders-cancel-button"
                      onClick={() => cancelOrder(order.id)}
                      disabled={cancellingOrder === order.id}
                    >
                      <XCircle size={16} />
                      {cancellingOrder === order.id
                        ? "Cancelling..."
                        : "Cancel Order"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div
            className="orders-modal-overlay"
            onClick={() => setSelectedOrder(null)}
          >
            <div
              className="orders-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="orders-modal-header">
                <div>
                  <span>ORDER DETAILS</span>
                  <h2>{selectedOrder.orderNumber}</h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  aria-label="Close order details"
                >
                  <XCircle size={22} />
                </button>
              </div>

              <div className="orders-modal-status">
                <span
                  className={`orders-status ${getStatusClass(
                    selectedOrder.orderStatus
                  )}`}
                >
                  {getStatusIcon(selectedOrder.orderStatus)}
                  {selectedOrder.orderStatus}
                </span>

                <span>
                  {formatDate(selectedOrder.createdAt)}
                </span>
              </div>

              <h3 className="orders-modal-section-title">
                Delivery Address
              </h3>
              <div className="orders-delivery-address">
                <strong>{selectedOrder.deliveryName || "Recipient not available"}</strong>
                <span>{selectedOrder.deliveryPhone || ""}</span>
                <span>{selectedOrder.deliveryEmail || ""}</span>
                <p>
                  {[
                    selectedOrder.addressLine1,
                    selectedOrder.addressLine2,
                    selectedOrder.city,
                    selectedOrder.state,
                    selectedOrder.postalCode,
                    selectedOrder.country
                  ].filter(Boolean).join(", ") || "Delivery address not available"}
                </p>
                {selectedOrder.deliveryInstructions && (
                  <small>Instructions: {selectedOrder.deliveryInstructions}</small>
                )}
              </div>

              <h3 className="orders-modal-section-title">
                Products
              </h3>

              <div className="orders-modal-items">
                {selectedOrder.items?.map((item) => (
                  <div
                    className="orders-modal-item"
                    key={item.id}
                  >
                    <div>
                      <strong>{item.productName}</strong>
                      <span>
                        Quantity: {item.quantity} ×{" "}
                        {formatPrice(item.unitPrice)}
                      </span>
                    </div>

                    <strong>
                      {formatPrice(item.subtotal)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="orders-modal-total">
                <span>Total Amount</span>
                <strong>
                  {formatPrice(selectedOrder.totalAmount)}
                </strong>
              </div>

              {canCancel(selectedOrder.orderStatus) && (
                <button
                  type="button"
                  className="orders-modal-cancel"
                  onClick={() => cancelOrder(selectedOrder.id)}
                  disabled={
                    cancellingOrder === selectedOrder.id
                  }
                >
                  {cancellingOrder === selectedOrder.id
                    ? "Cancelling..."
                    : "Cancel This Order"}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default MyOrders;
