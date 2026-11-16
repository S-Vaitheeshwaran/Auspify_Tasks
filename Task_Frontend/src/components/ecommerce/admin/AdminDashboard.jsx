
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  IndianRupee,
  Clock,
  Users,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  ClipboardList,
  ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../../services/api";
import { useEcommerceAuth } from "../../../context/EcommerceAuthContext";
import "./../../../pages/ecommerce/Ecommerce.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const {
    admin,
    token,
    isAdminAuthenticated
  } = useEcommerceAuth();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const fetchDashboardData = useCallback(async () => {
    if (!isAdminAuthenticated || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [productResponse, orderResponse] = await Promise.all([
        api.get("/ecommerce/products"),
        api.get("/ecommerce/orders", authConfig)
      ]);

      const productData = productResponse.data?.paramObjectsMap;
      const orderData = orderResponse.data?.paramObjectsMap;

      if (productResponse.data?.status === false) {
        throw new Error("Unable to retrieve products");
      }

      if (orderResponse.data?.status === false) {
        throw new Error("Unable to retrieve orders");
      }

      const productList =
        productData?.products ??
        productResponse.data?.products ??
        [];

      const orderList =
        orderData?.orders ??
        orderData?.orderList ??
        orderResponse.data?.orders ??
        [];

      setProducts(Array.isArray(productList) ? productList : []);
      setOrders(Array.isArray(orderList) ? orderList : []);
    } catch (error) {
      console.error("Admin dashboard error:", error);

      toast.error(
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.message ||
        error.message ||
        "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  }, [token, isAdminAuthenticated]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(Number(amount) || 0);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "admin-status-pending";
      case "CONFIRMED":
        return "admin-status-confirmed";
      case "PROCESSING":
        return "admin-status-processing";
      case "SHIPPED":
        return "admin-status-shipped";
      case "DELIVERED":
        return "admin-status-delivered";
      case "CANCELLED":
        return "admin-status-cancelled";
      default:
        return "admin-status-default";
    }
  };

  if (!isAdminAuthenticated || !token) {
    return (
      <div className="admin-dashboard-state">
        <ShieldCheck size={50} />
        <h2>Admin authentication required</h2>
        <p>Please log in with your E-Commerce admin account.</p>

        <Link
          to="/ecommerce/admin/login"
          className="admin-primary-button"
        >
          Admin Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-dashboard-state">
        <div className="cart-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  const totalProducts = products.length;
  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) =>
      order.orderStatus?.toUpperCase() === "PENDING"
  ).length;

  const deliveredOrders = orders.filter(
    (order) =>
      order.orderStatus?.toUpperCase() === "DELIVERED"
  ).length;

  const totalRevenue = orders
    .filter(
      (order) =>
        !["CANCELLED"].includes(
          order.orderStatus?.toUpperCase()
        )
    )
    .reduce(
      (total, order) =>
        total + (Number(order.totalAmount) || 0),
      0
    );

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 5);

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: <Package size={23} />,
      color: "purple"
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: <ShoppingBag size={23} />,
      color: "blue"
    },
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue),
      icon: <IndianRupee size={23} />,
      color: "green"
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: <Clock size={23} />,
      color: "orange"
    }
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-container">

        {/* Header */}
        <div className="admin-dashboard-header">
          <div>
            <span className="admin-dashboard-eyebrow">
              SHOPSPHERE ADMINISTRATION
            </span>

            <h1>Dashboard Overview</h1>

            <p>
              Welcome back,{" "}
              {admin?.name || admin?.firstName || "Admin"}.
              Here's your store performance.
            </p>
          </div>

          <div className="admin-header-actions">
            <Link to="/ecommerce" className="admin-back-link">
              <ArrowLeft size={16} />
              Back to Store
            </Link>
            <button
              type="button"
              className="admin-refresh-button"
              onClick={fetchDashboardData}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="admin-stats-grid">
          {stats.map((stat) => (
            <div className="admin-stat-card" key={stat.title}>
              <div className={`admin-stat-icon ${stat.color}`}>
                {stat.icon}
              </div>

              <div className="admin-stat-content">
                <span>{stat.title}</span>
                <strong>{stat.value}</strong>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <section className="admin-section">
          <div className="admin-section-heading">
            <div>
              <h2>Quick Management</h2>
              <p>Manage your store from one place.</p>
            </div>
          </div>

          <div className="admin-quick-grid">
            <Link
              to="/ecommerce/admin/products"
              className="admin-quick-card"
            >
              <div className="admin-quick-icon">
                <Package size={24} />
              </div>

              <div>
                <h3>Manage Products</h3>
                <p>Add, edit and manage product inventory.</p>
              </div>

              <ArrowRight size={19} />
            </Link>

            <Link
              to="/ecommerce/admin/orders"
              className="admin-quick-card"
            >
              <div className="admin-quick-icon blue">
                <ClipboardList size={24} />
              </div>

              <div>
                <h3>Manage Orders</h3>
                <p>View orders and update order status.</p>
              </div>

              <ArrowRight size={19} />
            </Link>

            <Link
              to="/ecommerce/admin/customers"
              className="admin-quick-card"
            >
              <div className="admin-quick-icon green">
                <Users size={24} />
              </div>

              <div>
                <h3>Manage Customers</h3>
                <p>View your registered customers.</p>
              </div>

              <ArrowRight size={19} />
            </Link>
          </div>
        </section>

        {/* Order Overview */}
        <div className="admin-dashboard-bottom">

          <section className="admin-section admin-recent-section">
            <div className="admin-section-heading">
              <div>
                <h2>Recent Orders</h2>
                <p>Latest customer purchases.</p>
              </div>

              <Link
                to="/ecommerce/admin/orders"
                className="admin-view-all"
              >
                View All <ArrowRight size={15} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="admin-no-data">
                No orders available yet.
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order Number</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.orderNumber}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td>
                          <span
                            className={`admin-status ${getStatusClass(
                              order.orderStatus
                            )}`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="admin-section admin-overview-section">
            <div className="admin-section-heading">
              <div>
                <h2>Order Overview</h2>
                <p>Current order statistics.</p>
              </div>
            </div>

            <div className="admin-overview-item">
              <span>Pending</span>
              <strong>{pendingOrders}</strong>
            </div>

            <div className="admin-overview-item">
              <span>Delivered</span>
              <strong>{deliveredOrders}</strong>
            </div>

            <div className="admin-overview-item">
              <span>Cancelled</span>
              <strong>
                {
                  orders.filter(
                    (order) =>
                      order.orderStatus?.toUpperCase() === "CANCELLED"
                  ).length
                }
              </strong>
            </div>

            <div className="admin-overview-item">
              <span>Other Orders</span>
              <strong>
                {totalOrders - pendingOrders - deliveredOrders -
                  orders.filter(
                    (order) =>
                      order.orderStatus?.toUpperCase() === "CANCELLED"
                  ).length}
              </strong>
            </div>

            <div className="admin-overview-footer">
              <TrendingUp size={17} />
              Based on current order records
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
