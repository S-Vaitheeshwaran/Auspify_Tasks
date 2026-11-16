import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  ArrowLeft,
  Package,
  Minus,
  Plus,
  ShoppingCart,
  ShoppingBag,
  Truck,
  ShieldCheck
} from "lucide-react";

import api from "../../services/api";
import { useEcommerceAuth } from "../../context/EcommerceAuthContext";

import "./../../pages/ecommerce/Ecommerce.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { customer, token, isCustomerAuthenticated } =
    useEcommerceAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingAction, setAddingAction] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setImageError(false);
      setQuantity(1);

      const response = await api.get(`/ecommerce/products/${id}`);

      const productData =
        response.data?.paramObjectsMap?.product ??
        response.data?.product;

      if (!productData) {
        throw new Error("Product not found");
      }

      setProduct(productData);
    } catch (error) {
      console.error("Product details error:", error);
      toast.error(
        error.response?.data?.errors?.[0]?.details ||
        error.message ||
        "Unable to load product"
      );
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(price || 0);

  const increaseQuantity = () => {
    if (quantity < product.stockQuantity) {
      setQuantity((previous) => previous + 1);
    }
  };

  const decreaseQuantity = () => {
    setQuantity((previous) => Math.max(1, previous - 1));
  };

  const addToCart = async (buyNow = false) => {
    if (!isCustomerAuthenticated || !customer || !token) {
      navigate("/ecommerce/login", {
        state: { from: `/ecommerce/products/${id}` }
      });
      return;
    }

    if (!customer.id) {
      toast.error("Customer information is incomplete. Please log in again.");
      return;
    }

    if (product.stockQuantity < quantity) {
      toast.error("Requested quantity is not available.");
      return;
    }

    try {
      setAddingAction(buyNow ? "buyNow" : "cart");

      const response = await api.post(
        "/ecommerce/cart/items",
        {
          customerId: customer.id,
          productId: product.id,
          quantity
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data?.status === false) {
        throw new Error("Unable to add product to cart");
      }

      if (buyNow) {
        navigate("/ecommerce/checkout");
      } else {
        toast.success("Product added to your cart!");
      }
    } catch (error) {
      console.error("Add to cart error:", error);

      toast.error(
        error.response?.data?.errors?.[0]?.details ||
        error.response?.data?.message ||
        "Unable to add product to cart"
      );
    } finally {
      setAddingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="pd-state">
        <div className="pd-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pd-state">
        <Package size={48} />
        <h2>Product not found</h2>
        <Link to="/ecommerce" className="pd-back-button">
          Back to Shop
        </Link>
      </div>
    );
  }

  const outOfStock = product.stockQuantity <= 0;

  return (
    <div className="pd-page">
      <div className="pd-container">

        <Link to="/ecommerce" className="pd-breadcrumb">
          <ArrowLeft size={17} />
          Continue Shopping
        </Link>

        <div className="pd-product-layout">

          <div className="pd-image-container">
            {product.imageUrl && !imageError ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="pd-product-image"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="pd-image-placeholder">
                <Package size={70} />
                <span>Product image unavailable</span>
              </div>
            )}
          </div>

          <div className="pd-information">

            <span className="pd-category">
              {product.category || "General"}
            </span>

            <h1>{product.name}</h1>

            <div className="pd-price">
              {formatPrice(product.price)}
            </div>

            <div className={`pd-stock ${outOfStock ? "out" : ""}`}>
              <span className="pd-stock-dot"></span>
              {outOfStock
                ? "Out of stock"
                : `${product.stockQuantity} units available`}
            </div>

            <div className="pd-divider"></div>

            <h3>Product Description</h3>

            <p className="pd-description">
              {product.description || "No description available."}
            </p>

            <div className="pd-divider"></div>

            <div className="pd-quantity-section">
              <span>Quantity</span>

              <div className="pd-quantity-control">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>

                <span>{quantity}</span>

                <button
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stockQuantity}
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="pd-total">
              <span>Total Price</span>
              <strong>{formatPrice(product.price * quantity)}</strong>
            </div>

            <div className="pd-actions">
              <button
                className="pd-add-cart"
                onClick={() => addToCart()}
                disabled={outOfStock || addingAction !== null}
              >
                <ShoppingCart size={19} />
                {addingAction === "cart"
                  ? "Adding..."
                  : outOfStock
                    ? "Out of Stock"
                    : "Add to Cart"}
              </button>

              <button
                className="pd-buy-now"
                onClick={() => addToCart(true)}
                disabled={outOfStock || addingAction !== null}
              >
                <ShoppingBag size={19} />
                {addingAction === "buyNow"
                  ? "Processing..."
                  : outOfStock
                    ? "Out of Stock"
                    : "Buy Now"}
              </button>
            </div>

            <div className="pd-benefits">
              <div>
                <Truck size={20} />
                <span>Convenient Delivery</span>
              </div>

              <div>
                <ShieldCheck size={20} />
                <span>Secure Shopping</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
