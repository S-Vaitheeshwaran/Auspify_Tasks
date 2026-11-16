
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Search,
  ShoppingCart,
  UserRound,
  Menu,
  ArrowRight,
  Package,
  Truck,
  ShieldCheck,
  Headphones,
  RefreshCw,
  Heart,
  Star,
  X,
  LogOut
} from "lucide-react";

import toast from "react-hot-toast";
import { useEcommerceAuth } from "../../context/EcommerceAuthContext";
import api from "../../services/api";
import "./Ecommerce.css";

const categories = [
  { name: "All Products", icon: "🛍️" },
  { name: "Electronics", icon: "🎧" },
  { name: "Fashion", icon: "👕" },
  { name: "Home & Living", icon: "🏠" },
  { name: "Accessories", icon: "⌚" },
  { name: "Beauty", icon: "✨" }
];

function Ecommerce() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cartCount] = useState(0);

  const {
    customer,
    admin,
    isCustomerAuthenticated,
    isAdminAuthenticated,
    logout
  } = useEcommerceAuth();

  // Load saved items before the first render to avoid overwriting them with [].
  const wishlistStorageKey = `shopsphereWishlist_${customer?.id || "guest"}`;
  const [wishlist, setWishlist] = useState(() => {
    try {
      const savedWishlist = JSON.parse(localStorage.getItem(wishlistStorageKey) || "[]");
      return Array.isArray(savedWishlist) ? savedWishlist : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(wishlistStorageKey, JSON.stringify(wishlist));
  }, [wishlist, wishlistStorageKey]);

  const isWishlisted = (productId) =>
    wishlist.some((item) => String(item.id) === String(productId));

  const toggleWishlist = (product) => {
    if (isWishlisted(product.id)) {
      setWishlist((current) =>
        current.filter((item) => String(item.id) !== String(product.id))
      );
      toast.success("Removed from wishlist");
    } else {
      setWishlist((current) => [...current, product]);
      toast.success("Added to wishlist");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await api.get("/ecommerce/products");

      const productList =
        response.data?.paramObjectsMap?.products ??
        response.data?.products ??
        [];

      setProducts(Array.isArray(productList) ? productList : []);
    } catch (error) {
      console.error("Product loading error:", error);

      toast.error(
        error.response?.data?.errors?.[0]?.details ||
        "Unable to load products"
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    setMobileMenu(false);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All Products" ||
        product.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(price || 0);

  return (
    <div className="eco-store">

      {/* Announcement */}
      <div className="eco-announcement">
        <span>Free shipping on orders above ₹999</span>
        <span className="eco-announcement-divider">|</span>
        <span>Discover something you love today</span>
      </div>

      {/* Navbar */}
      <header className="eco-navbar">
        <div className="eco-nav-container">

          <Link to="/ecommerce" className="eco-logo">
            <span className="eco-logo-icon">S</span>
            <span>
              Shop<span className="eco-logo-highlight">Sphere</span>
            </span>
          </Link>

          <nav className={`eco-nav-links ${mobileMenu ? "eco-nav-open" : ""}`}>
            <a href="#home" onClick={() => setMobileMenu(false)}>
              Home
            </a>

            <a href="#categories" onClick={() => setMobileMenu(false)}>
              Categories
            </a>

            <a href="#products" onClick={() => setMobileMenu(false)}>
              Shop
            </a>

            <a href="#benefits" onClick={() => setMobileMenu(false)}>
              About
            </a>

          </nav>

          <div className="eco-nav-actions">

            {/* Search */}
            <label className="eco-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);

                  document.getElementById("products")?.scrollIntoView({
                    behavior: "smooth"
                  });
                }}
              />
            </label>

            {/* Wishlist */}
            <Link to="/ecommerce/wishlist" className="eco-icon-button eco-wishlist-nav" title="Wishlist" aria-label="Wishlist">
              <Heart size={21} />
              {wishlist.length > 0 && (
                <span className="eco-cart-count">{wishlist.length}</span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/ecommerce/cart" className="eco-icon-button">
              <ShoppingCart size={21} />
              {cartCount > 0 && (
                <span className="eco-cart-count">{cartCount}</span>
              )}
            </Link>

            {/* Dynamic Account Button */}
            {isCustomerAuthenticated ? (
              <Link
                to="/ecommerce/profile"
                className="eco-account-button"
                title="View my profile"
              >
                <UserRound size={18} />
                <span>{customer?.firstName || "Customer"}</span>
              </Link>
            ) : isAdminAuthenticated ? (
              <Link
                to="/ecommerce/admin/dashboard"
                className="eco-account-button"
                title="Admin Dashboard"
              >
                <UserRound size={18} />
                <span>{admin?.name || admin?.firstName || "Admin"}</span>
              </Link>
            ) : (
              <Link
                to="/ecommerce/login"
                className="eco-account-button"
              >
                <UserRound size={18} />
                <span>Account</span>
              </Link>
            )}

            {/* Logout Button */}
            {(isCustomerAuthenticated || isAdminAuthenticated) && (
              <button
                type="button"
                className="eco-logout-button"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={17} />
                <span>Logout</span>
              </button>
            )}

            {/* Mobile Menu */}
            <button
              className="eco-mobile-menu"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Toggle navigation"
            >
              {mobileMenu ? <X /> : <Menu />}
            </button>

          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="eco-hero" id="home">
        <div className="eco-hero-content">

          <span className="eco-eyebrow">
            YOUR EVERYDAY SHOPPING DESTINATION
          </span>

          <h1>
            Find Your
            <br />
            <span>Everyday</span> Favorites.
          </h1>

          <p>
            Explore products you'll love. Great choices, amazing value
            and a better shopping experience — all in one place.
          </p>

          <div className="eco-hero-actions">
            <a href="#products" className="eco-primary-button">
              Explore Products <ArrowRight size={18} />
            </a>

            <a href="#categories" className="eco-secondary-button">
              Browse Categories
            </a>
          </div>

          <div className="eco-hero-stats">
            <div>
              <strong>{products.length}+</strong>
              <span>Products</span>
            </div>

            <div>
              <strong>100%</strong>
              <span>Secure Shopping</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Support</span>
            </div>
          </div>

        </div>

        <div className="eco-hero-visual">
          <div className="eco-hero-image">
            <div className="eco-hero-image-overlay">
              <span>DISCOVER MORE</span>
              <h3>Shopping made simple.</h3>
            </div>
          </div>

          <div className="eco-floating-card">
            <span className="eco-floating-icon">✦</span>

            <div>
              <strong>Made for you</strong>
              <span>Explore our collection</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="eco-benefits" id="benefits">

        <div className="eco-benefit">
          <Truck size={25} />
          <div>
            <strong>Fast Delivery</strong>
            <span>Convenient delivery</span>
          </div>
        </div>

        <div className="eco-benefit">
          <ShieldCheck size={25} />
          <div>
            <strong>Secure Payments</strong>
            <span>Safe shopping experience</span>
          </div>
        </div>

        <div className="eco-benefit">
          <RefreshCw size={25} />
          <div>
            <strong>Easy Returns</strong>
            <span>Hassle-free assistance</span>
          </div>
        </div>

        <div className="eco-benefit">
          <Headphones size={25} />
          <div>
            <strong>Customer Support</strong>
            <span>We're here to help</span>
          </div>
        </div>

      </section>

      {/* Categories */}
      <section className="eco-section eco-categories" id="categories">

        <div className="eco-section-heading">
          <div>
            <span className="eco-eyebrow">EXPLORE OUR COLLECTION</span>
            <h2>Shop by Category</h2>
            <p>Find exactly what you're looking for.</p>
          </div>
        </div>

        <div className="eco-category-list">
          {categories.map((category) => (
            <button
              key={category.name}
              className={`eco-category-card ${
                selectedCategory === category.name ? "active" : ""
              }`}
              onClick={() => {
                setSelectedCategory(category.name);

                document.getElementById("products")?.scrollIntoView({
                  behavior: "smooth"
                });
              }}
            >
              <span className="eco-category-icon">
                {category.icon}
              </span>

              <span>{category.name}</span>
            </button>
          ))}
        </div>

      </section>

      {/* Products */}
      <section className="eco-section eco-products-section" id="products">

        <div className="eco-section-heading eco-product-heading">
          <div>
            <span className="eco-eyebrow">HANDPICKED FOR YOU</span>
            <h2>Explore Products</h2>
            <p>
              Discover our available products and find your next favorite.
            </p>
          </div>

          <button
            className="eco-refresh-button"
            onClick={fetchProducts}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="eco-loading">
            <div className="eco-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="eco-empty">
            <Package size={42} />
            <h3>No products found</h3>
            <p>Try another search or select a different category.</p>

            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("All Products");
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="eco-product-grid">

            {filteredProducts.map((product) => (
              <article className="eco-product-card" key={product.id}>

                <div className="eco-product-image">

                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="eco-image-placeholder">
                      <Package size={42} />
                    </div>
                  )}

                  <button
                    type="button"
                    className={`eco-wishlist-button ${isWishlisted(product.id) ? "is-wishlisted" : ""}`}
                    aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    aria-pressed={isWishlisted(product.id)}
                    onClick={() => toggleWishlist(product)}
                  >
                    <Heart size={19} fill={isWishlisted(product.id) ? "currentColor" : "none"} />
                  </button>

                  {product.stockQuantity <= 0 && (
                    <span className="eco-stock-label">
                      Out of stock
                    </span>
                  )}

                </div>

                <div className="eco-product-info">

                  <span className="eco-product-category">
                    {product.category || "General"}
                  </span>

                  <h3>{product.name}</h3>

                  <p>
                    {product.description || "Explore this product."}
                  </p>

                  <div className="eco-product-rating">
                    <Star size={14} fill="currentColor" />
                    <span>New Arrival</span>
                  </div>

                  <div className="eco-product-bottom">
                    <strong>{formatPrice(product.price)}</strong>

                    <Link
                      to={`/ecommerce/products/${product.id}`}
                      className="eco-view-button"
                    >
                      View <ArrowRight size={15} />
                    </Link>
                  </div>

                </div>
              </article>
            ))}

          </div>
        )}

      </section>

      {/* Call to action */}
      <section className="eco-cta">

        <div>
          <span className="eco-eyebrow">
            YOUR NEXT FAVORITE IS WAITING
          </span>

          <h2>Make every purchase count.</h2>

          <p>
            Explore our collection and enjoy a simple shopping experience.
          </p>
        </div>

        <a href="#products" className="eco-cta-button">
          Start Shopping <ArrowRight size={18} />
        </a>

      </section>

      {/* Footer */}
      <footer className="eco-footer">

        <div className="eco-footer-main">

          <div className="eco-footer-brand">
            <Link to="/ecommerce" className="eco-logo">
              <span className="eco-logo-icon">S</span>
              <span>
                Shop<span className="eco-logo-highlight">Sphere</span>
              </span>
            </Link>

            <p>Your everyday shopping destination.</p>
          </div>

          <div>
            <h4>Shopping</h4>
            <a href="#products">All Products</a>
            <a href="#categories">Categories</a>
            <Link to="/ecommerce/cart">Shopping Cart</Link>
            <Link to="/ecommerce/wishlist">My Wishlist</Link>
          </div>

          <div>
            <h4>My Account</h4>

            {isCustomerAuthenticated ? (
              <>
                <Link to="/ecommerce/my-orders">My Orders</Link>
                <button
                  type="button"
                  className="eco-footer-logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : isAdminAuthenticated ? (
              <>
                <Link to="/ecommerce/admin/dashboard">
                  Admin Dashboard
                </Link>
                <button
                  type="button"
                  className="eco-footer-logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/ecommerce/login">Login</Link>
                <Link to="/ecommerce/register">Register</Link>
              </>
            )}

          </div>

        </div>

        <div className="eco-footer-bottom">
          <span>
            © {new Date().getFullYear()} ShopSphere. All rights reserved.
          </span>

          <span>
            Designed for a better shopping experience.
          </span>
        </div>

      </footer>

    </div>
  );
}

export default Ecommerce;
