import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ShoppingCart,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { useEcommerceAuth } from "../../context/EcommerceAuthContext";

function Cart() {
  const navigate = useNavigate();

  const { customer, token, isCustomerAuthenticated } = useEcommerceAuth();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [clearing, setClearing] = useState(false);

  const customerId = customer?.id;

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchCart = useCallback(async (showLoading = false) => {
    if (!isCustomerAuthenticated || !customerId || !token) {
      setCart(null);
      setLoading(false);
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }

      const response = await api.get(
        `/ecommerce/cart/${customerId}`,
        authConfig,
      );

      const cartData = response.data?.paramObjectsMap?.cart;

      if (response.data?.status === false) {
        throw new Error(
          response.data?.paramObjectsMap?.message || "Unable to retrieve cart",
        );
      }

      setCart(cartData || null);
    } catch (error) {
      console.error("Fetch cart error:", error);

      toast.error(
        error.response?.data?.paramObjectsMap?.message ||
          error.response?.data?.message ||
          "Unable to load your cart",
      );

      setCart(null);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [customerId, token, isCustomerAuthenticated]);

  useEffect(() => {
    fetchCart(true);
  }, [fetchCart]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(price) || 0);

  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdatingItem(item.cartItemId);

      await api.put(
        `/ecommerce/cart/items/${item.cartItemId}`,
        {
          customerId: customerId,
          quantity: newQuantity,
        },
        authConfig,
      );

      await fetchCart();
      toast.success("Cart quantity updated");
    } catch (error) {
      console.error("Update cart error:", error);

      toast.error(
        error.response?.data?.paramObjectsMap?.message ||
          error.response?.data?.message ||
          "Unable to update quantity",
      );
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setUpdatingItem(itemId);

      await api.delete(
        `/ecommerce/cart/${customerId}/items/${itemId}`,
        authConfig,
      );

      await fetchCart();
      toast.success("Product removed from cart");
    } catch (error) {
      console.error("Remove cart item error:", error);

      toast.error(
        error.response?.data?.paramObjectsMap?.message ||
          error.response?.data?.message ||
          "Unable to remove product",
      );
    } finally {
      setUpdatingItem(null);
    }
  };

  const clearCart = async () => {
    if (!cart?.items?.length) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove all products from your cart?",
    );

    if (!confirmed) return;

    try {
      setClearing(true);

      await api.delete(`/ecommerce/cart/${customerId}`, authConfig);

      setCart({
        ...cart,
        items: [],
        totalAmount: 0,
        totalItems: 0,
      });

      toast.success("Cart cleared successfully");
    } catch (error) {
      console.error("Clear cart error:", error);

      toast.error(
        error.response?.data?.paramObjectsMap?.message ||
          error.response?.data?.message ||
          "Unable to clear cart",
      );
    } finally {
      setClearing(false);
    }
  };

  if (!isCustomerAuthenticated || !customerId || !token) {
    return (
      <div className="cart-state">
        <ShoppingCart size={55} />
        <h2>Please log in to view your cart</h2>
        <p>Your shopping cart is available after customer login.</p>

        <Link to="/ecommerce/login" className="cart-primary-button">
          Customer Login
        </Link>

        <Link to="/ecommerce" className="cart-back-link">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart-state">
        <div className="cart-spinner"></div>
        <p>Loading your shopping cart...</p>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Header */}
        <div className="cart-heading">
          <div>
            <span className="cart-eyebrow">YOUR SHOPPING BAG</span>
            <h1>Shopping Cart</h1>
            <p>Review your selected products before checkout.</p>
          </div>

          <Link to="/ecommerce" className="cart-continue-link">
            <ArrowLeft size={17} />
            Continue Shopping
          </Link>
        </div>

        {isEmpty ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <ShoppingBag size={48} />
            </div>

            <h2>Your cart is empty</h2>

            <p>
              Looks like you haven't added anything to your cart yet. Discover
              products you'll love!
            </p>

            <Link to="/ecommerce" className="cart-primary-button">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Cart Items */}
            <div className="cart-items-section">
              <div className="cart-items-header">
                <h2>
                  Your Items
                  <span>({cart?.totalItems ?? 0})</span>
                </h2>

                <button
                  className="cart-clear-button"
                  onClick={clearCart}
                  disabled={clearing}
                >
                  <Trash2 size={15} />
                  {clearing ? "Clearing..." : "Clear Cart"}
                </button>
              </div>

              <div className="cart-items-list">
                {items.map((item) => (
                  <article className="cart-item" key={item.cartItemId}>
                    <div className="cart-item-image">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} />
                      ) : (
                        <ShoppingBag size={35} />
                      )}
                    </div>

                    <div className="cart-item-details">
                      <span className="cart-item-category">
                        {item.category || "General"}
                      </span>

                      <h3>{item.productName}</h3>

                      <p>Unit price: {formatPrice(item.unitPrice)}</p>

                      <strong className="cart-item-subtotal">
                        {formatPrice(item.subtotal)}
                      </strong>

                      <div className="cart-item-actions">
                        <div className="cart-quantity-control">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item, item.quantity - 1)
                            }
                            disabled={
                              item.quantity <= 1 ||
                              updatingItem === item.cartItemId
                            }
                            aria-label="Decrease quantity"
                          >
                            <Minus size={15} />
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item, item.quantity + 1)
                            }
                            disabled={updatingItem === item.cartItemId}
                            aria-label="Increase quantity"
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        <button
                          type="button"
                          className="cart-remove-button"
                          onClick={() => removeItem(item.cartItemId)}
                          disabled={updatingItem === item.cartItemId}
                        >
                          <Trash2 size={15} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <button className="cart-refresh-button" onClick={fetchCart}>
                <RefreshCw size={15} />
                Refresh Cart
              </button>
            </div>

            {/* Order Summary */}
            <aside className="cart-summary">
              <h2>Order Summary</h2>

              <div className="cart-summary-row">
                <span>Total Items</span>
                <strong>{cart?.totalItems ?? 0}</strong>
              </div>

              <div className="cart-summary-row">
                <span>Subtotal</span>
                <strong>{formatPrice(cart?.totalAmount)}</strong>
              </div>

              <div className="cart-summary-row">
                <span>Shipping</span>
                <strong className="cart-free-shipping">
                  Calculated at checkout
                </strong>
              </div>

              <div className="cart-summary-divider"></div>

              <div className="cart-summary-total">
                <span>Cart Total</span>
                <strong>{formatPrice(cart?.totalAmount)}</strong>
              </div>

              <button
                className="cart-checkout-button"
                onClick={() => navigate("/ecommerce/checkout")}
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>

              <div className="cart-secure-note">
                <ShoppingBag size={17} />
                Secure shopping experience
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
