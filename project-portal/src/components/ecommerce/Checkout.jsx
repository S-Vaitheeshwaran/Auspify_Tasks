import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle, Package, ShieldCheck,
  ShoppingBag, UserRound, MapPin
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { useEcommerceAuth } from "../../context/EcommerceAuthContext";
import "./../../pages/ecommerce/Ecommerce.css";

function Checkout() {
  const navigate = useNavigate();
  const { customer, token, isCustomerAuthenticated } = useEcommerceAuth();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const [delivery, setDelivery] = useState({
    deliveryName: `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim(),
    deliveryPhone: customer?.phone || "",
    deliveryEmail: customer?.email || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    deliveryInstructions: ""
  });

  const customerId = customer?.id;
  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchCart = useCallback(async () => {
    if (!isCustomerAuthenticated || !customerId || !token) {
      setCart(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get(`/ecommerce/cart/${customerId}`, authConfig);
      if (response.data?.status !== true) {
        throw new Error(response.data?.paramObjectsMap?.message || "Unable to retrieve cart");
      }
      setCart(response.data?.paramObjectsMap?.cart || null);
    } catch (error) {
      console.error("Checkout cart error:", error);
      toast.error(
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.message || "Unable to load your cart"
      );
    } finally {
      setLoading(false);
    }
  }, [customerId, token, isCustomerAuthenticated]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  useEffect(() => {
    setDelivery((previous) => ({
      ...previous,
      deliveryName: previous.deliveryName || `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim(),
      deliveryPhone: previous.deliveryPhone || customer?.phone || "",
      deliveryEmail: previous.deliveryEmail || customer?.email || ""
    }));
  }, [customer]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 2
    }).format(Number(price) || 0);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDelivery((previous) => ({ ...previous, [name]: value }));
  };

  const validateDelivery = () => {
    const required = [
      ["deliveryName", "Enter the recipient name."],
      ["deliveryPhone", "Enter a valid phone number."],
      ["deliveryEmail", "Enter a valid email address."],
      ["addressLine1", "Enter your address."],
      ["city", "Enter your city."],
      ["state", "Enter your state."],
      ["postalCode", "Enter a valid postal code."],
      ["country", "Enter your country."]
    ];
    for (const [field, message] of required) {
      if (!String(delivery[field] || "").trim()) {
        toast.error(message);
        document.querySelector(`[name="${field}"]`)?.focus();
        return false;
      }
    }
    if (!/^[0-9]{10,15}$/.test(delivery.deliveryPhone.trim())) {
      toast.error("Phone number must contain 10 to 15 digits.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(delivery.deliveryEmail.trim())) {
      toast.error("Enter a valid email address.");
      return false;
    }
    if (!/^[A-Za-z0-9 -]{3,12}$/.test(delivery.postalCode.trim())) {
      toast.error("Postal code must be 3 to 12 letters, numbers, spaces or hyphens.");
      return false;
    }
    return true;
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    if (!cart?.items?.length) {
      toast.error("Your cart is empty");
      return;
    }
    if (!validateDelivery()) return;

    try {
      setPlacingOrder(true);
      const payload = Object.fromEntries(
        Object.entries(delivery).map(([key, value]) => [key, value.trim()])
      );
      const response = await api.post(
        "/ecommerce/orders/place",
        payload,
        authConfig
      );
      const order = response.data?.paramObjectsMap?.order;
      if (response.data?.status !== true || !order) {
        throw new Error(
          response.data?.paramObjectsMap?.message || "Unable to place your order"
        );
      }
      setPlacedOrder(order);
      setCart(null);
      toast.success("Your order has been placed successfully!");
    } catch (error) {
      console.error("Place order error:", error);
      toast.error(
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.message ||
        error.message || "Unable to place your order"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!isCustomerAuthenticated || !customerId || !token) {
    return (
      <div className="checkout-state">
        <ShoppingBag size={50} />
        <h2>Please log in to continue</h2>
        <p>You need a customer account to place an order.</p>
        <Link to="/ecommerce/login" className="checkout-primary-button">Customer Login</Link>
      </div>
    );
  }

  if (loading) {
    return <div className="checkout-state"><div className="cart-spinner"></div><p>Loading checkout...</p></div>;
  }

  if (placedOrder) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-success">
            <div className="checkout-success-icon"><CheckCircle size={55} /></div>
            <span className="checkout-eyebrow">ORDER PLACED</span>
            <h1>Thank you for your order!</h1>
            <p>Your order has been placed successfully.</p>
            <div className="checkout-order-number">
              <span>Order Number</span><strong>{placedOrder.orderNumber}</strong>
            </div>
            <div className="checkout-success-details">
              <div><span>Order ID</span><strong>{placedOrder.id}</strong></div>
              <div><span>Order Status</span><strong>{placedOrder.orderStatus}</strong></div>
              <div><span>Total Amount</span><strong>{formatPrice(placedOrder.totalAmount)}</strong></div>
            </div>
            <div className="checkout-success-actions">
              <button className="checkout-primary-button" onClick={() => navigate("/ecommerce/my-orders")}>
                View My Orders <ArrowRight size={17} />
              </button>
              <Link to="/ecommerce" className="checkout-secondary-button">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  if (!items.length) {
    return (
      <div className="checkout-state">
        <ShoppingBag size={50} />
        <h2>Your cart is empty</h2>
        <p>Add products before proceeding to checkout.</p>
        <Link to="/ecommerce" className="checkout-primary-button">Continue Shopping</Link>
      </div>
    );
  }

  const fields = [
    { name: "deliveryName", label: "Recipient Name", placeholder: "Full name", required: true },
    { name: "deliveryPhone", label: "Phone Number", placeholder: "10 to 15 digits", required: true },
    { name: "deliveryEmail", label: "Email Address", placeholder: "name@example.com", type: "email", required: true },
    { name: "addressLine1", label: "Address Line 1", placeholder: "House / Flat / Street", required: true },
    { name: "addressLine2", label: "Address Line 2", placeholder: "Area / Landmark (optional)" },
    { name: "city", label: "City", placeholder: "City", required: true },
    { name: "state", label: "State", placeholder: "State", required: true },
    { name: "postalCode", label: "Postal Code", placeholder: "PIN / ZIP code", required: true },
    { name: "country", label: "Country", placeholder: "Country", required: true }
  ];

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-heading">
          <div>
            <span className="checkout-eyebrow">SECURE CHECKOUT</span>
            <h1>Checkout</h1>
            <p>Enter your delivery address and review your order.</p>
          </div>
          <Link to="/ecommerce/cart" className="checkout-back-link"><ArrowLeft size={17} /> Back to Cart</Link>
        </div>

        <form onSubmit={placeOrder}>
          <div className="checkout-layout">
            <div className="checkout-main">
              <section className="checkout-card">
                <div className="checkout-card-heading"><UserRound size={21} /><h2>Customer Information</h2></div>
                <div className="checkout-customer-details">
                  <div><span>Customer Name</span><strong>{customer?.firstName} {customer?.lastName}</strong></div>
                  <div><span>Email Address</span><strong>{customer?.email}</strong></div>
                  <div><span>Phone Number</span><strong>{customer?.phone || "Not provided"}</strong></div>
                </div>
                <p className="checkout-info-note">Your signed-in customer account will be linked to this order.</p>
              </section>

              <section className="checkout-card">
                <div className="checkout-card-heading"><MapPin size={21} /><h2>Delivery Address</h2></div>
                <p className="checkout-info-note">Where should we deliver your order?</p>
                <div className="checkout-address-grid">
                  {fields.map((field) => (
                    <label className={`checkout-field ${field.name === "addressLine1" || field.name === "addressLine2" ? "checkout-field--full" : ""}`} key={field.name}>
                      <span>{field.label}{field.required && <b> *</b>}</span>
                      <input
                        type={field.type || "text"}
                        name={field.name}
                        value={delivery[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        maxLength={field.name === "deliveryName" ? 150 : field.name === "deliveryEmail" ? 150 : field.name === "addressLine1" || field.name === "addressLine2" ? 255 : 100}
                        required={Boolean(field.required)}
                      />
                    </label>
                  ))}
                  <label className="checkout-field checkout-field--full">
                    <span>Delivery Instructions (Optional)</span>
                    <textarea
                      name="deliveryInstructions"
                      value={delivery.deliveryInstructions}
                      onChange={handleChange}
                      placeholder="Landmark, preferred delivery time, or instructions"
                      maxLength={500}
                      rows={3}
                    />
                  </label>
                </div>
              </section>

              <section className="checkout-card">
                <div className="checkout-card-heading"><Package size={21} /><h2>Order Items ({cart.totalItems})</h2></div>
                <div className="checkout-items-list">
                  {items.map((item) => (
                    <div className="checkout-item" key={item.cartItemId}>
                      <div className="checkout-item-image">
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : <ShoppingBag size={30} />}
                      </div>
                      <div className="checkout-item-info">
                        <h3>{item.productName}</h3>
                        <p>Quantity: {item.quantity}</p>
                        <span>Unit price: {formatPrice(item.unitPrice)}</span>
                      </div>
                      <strong className="checkout-item-price">{formatPrice(item.subtotal)}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <div className="checkout-security-note">
                <ShieldCheck size={20} />
                <span>Your order is associated with your authenticated customer account.</span>
              </div>
            </div>

            <aside className="checkout-summary">
              <h2>Order Summary</h2>
              <div className="checkout-summary-row"><span>Total Items</span><strong>{cart.totalItems}</strong></div>
              <div className="checkout-summary-row"><span>Subtotal</span><strong>{formatPrice(cart.totalAmount)}</strong></div>
              <div className="checkout-summary-divider"></div>
              <div className="checkout-summary-total"><span>Order Total</span><strong>{formatPrice(cart.totalAmount)}</strong></div>
              <button type="submit" className="checkout-place-button" disabled={placingOrder}>
                {placingOrder ? "Placing Order..." : "Place Order"}
                {!placingOrder && <ArrowRight size={18} />}
              </button>
              <Link to="/ecommerce/cart" className="checkout-edit-cart">Edit Cart</Link>
              <p className="checkout-summary-note">By placing your order, you confirm the delivery details and items above.</p>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Checkout;
