import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Heart, Package, ShoppingCart, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { useEcommerceAuth } from "../../context/EcommerceAuthContext";
import "./../../pages/ecommerce/Ecommerce.css";

function Wishlist() {
  const { customer, token, isCustomerAuthenticated } = useEcommerceAuth();
  const storageKey = `shopsphereWishlist_${customer?.id || "guest"}`;
  // Initialize from localStorage immediately; don't first render/save an empty list.
  const [items, setItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(Number(price) || 0);

  const removeItem = (productId) => {
    setItems((current) =>
      current.filter((item) => String(item.id) !== String(productId))
    );
    toast.success("Removed from wishlist");
  };

  const addToCart = async (product) => {
    if (!isCustomerAuthenticated || !customer?.id || !token) {
      toast.error("Please log in as a customer to add items to your cart");
      return;
    }
    if (Number(product.stockQuantity) <= 0) {
      toast.error("This product is currently out of stock");
      return;
    }

    try {
      await api.post(
        "/ecommerce/cart/items",
        {
          customerId: customer.id,
          productId: product.id,
          quantity: 1
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Product added to cart");
    } catch (error) {
      console.error("Wishlist add-to-cart error:", error);
      toast.error(
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.message ||
        "Unable to add product to cart"
      );
    }
  };

  const totalValue = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.price) || 0), 0),
    [items]
  );

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-heading">
          <div>
            <span className="eco-eyebrow">YOUR SAVED FAVORITES</span>
            <h1><Heart size={27} /> My Wishlist</h1>
            <p>Keep the products you love in one place.</p>
          </div>
          <Link to="/ecommerce" className="wishlist-back-link">
            <ArrowLeft size={17} /> Continue Shopping
          </Link>
        </div>

        <div className="wishlist-summary">
          <span>{items.length} saved {items.length === 1 ? "item" : "items"}</span>
          <strong>Combined value: {formatPrice(totalValue)}</strong>
        </div>

        {items.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon"><Heart size={43} /></div>
            <h2>Your wishlist is empty</h2>
            <p>Tap the heart on any product to save it here for later.</p>
            <Link to="/ecommerce#products" className="checkout-primary-button">
              Explore Products <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map((product) => (
              <article className="wishlist-card" key={product.id}>
                <div className="wishlist-card-image">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                  ) : (
                    <div className="eco-image-placeholder"><Package size={40} /></div>
                  )}
                  <button
                    type="button"
                    className="wishlist-remove-button"
                    onClick={() => removeItem(product.id)}
                    aria-label={`Remove ${product.name} from wishlist`}
                    title="Remove from wishlist"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
                <div className="wishlist-card-content">
                  <span className="eco-product-category">{product.category || "General"}</span>
                  <h3>{product.name}</h3>
                  <p>{product.description || "Explore this product."}</p>
                  <strong className="wishlist-price">{formatPrice(product.price)}</strong>
                  <div className="wishlist-card-actions">
                    <Link to={`/ecommerce/products/${product.id}`} className="eco-view-button">
                      View Product <ArrowRight size={15} />
                    </Link>
                    <button
                      type="button"
                      className="wishlist-add-cart-button"
                      onClick={() => addToCart(product)}
                      disabled={Number(product.stockQuantity) <= 0}
                    >
                      <ShoppingCart size={16} />
                      {Number(product.stockQuantity) <= 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
