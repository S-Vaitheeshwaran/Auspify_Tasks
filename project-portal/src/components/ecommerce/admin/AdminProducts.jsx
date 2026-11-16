
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../../services/api";
import { useEcommerceAuth } from "../../../context/EcommerceAuthContext";
import "../../../pages/ecommerce/Ecommerce.css";

const PRODUCT_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Living",
  "Accessories",
  "Beauty"
];

const emptyProduct = {
  name: "",
  description: "",
  category: "",
  price: "",
  stockQuantity: "",
  imageUrl: "",
  active: true
};

function AdminProducts() {
  const { token, isAdminAuthenticated } = useEcommerceAuth();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const getProductList = (response) => {
    const data = response.data?.paramObjectsMap;
    return data?.products ?? response.data?.products ?? [];
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/ecommerce/products", authConfig);
      setProducts(getProductList(response));
    } catch (error) {
      console.error("Fetch products error:", error);
      toast.error(
        error.response?.data?.message || "Unable to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated && token) {
      fetchProducts();
    }
  }, [isAdminAuthenticated, token]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const resetForm = () => {
    setForm(emptyProduct);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      price: product.price ?? "",
      stockQuantity: product.stockQuantity ?? "",
      imageUrl: product.imageUrl || "",
      active: product.active ?? true
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.category.trim()) {
      toast.error("Product name and category are required");
      return;
    }

    if (Number(form.price) < 0 || Number(form.stockQuantity) < 0) {
      toast.error("Price and stock cannot be negative");
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity)
    };

    try {
      setSaving(true);

      if (editingId !== null) {
        await api.put(
          `/ecommerce/products/${editingId}`,
          payload,
          authConfig
        );
        toast.success("Product updated successfully");
      } else {
        await api.post("/ecommerce/products", payload, authConfig);
        toast.success("Product added successfully");
      }

      resetForm();
      await fetchProducts();
    } catch (error) {
      console.error("Save product error:", error);
      toast.error(
        error.response?.data?.message || "Unable to save product"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await api.delete(`/ecommerce/products/${id}`, authConfig);
      toast.success("Product deleted successfully");
      await fetchProducts();
    } catch (error) {
      console.error("Delete product error:", error);
      toast.error(
        error.response?.data?.message || "Unable to delete product"
      );
    }
  };

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();

    return (
      product.name?.toLowerCase().includes(searchText) ||
      product.category?.toLowerCase().includes(searchText)
    );
  });

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
          <h1>Product Management</h1>
          <p>Manage your store products, prices and stock.</p>
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
            className="admin-primary-btn"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setForm(emptyProduct);
                setEditingId(null);
                setShowForm(true);
              }
            }}
          >
            {showForm ? "Close Form" : "+ Add Product"}
          </button>
        </div>
      </div>

      {showForm && (
        <form className="admin-form-card" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>

          <div className="admin-form-grid">
            <label>
              Product Name *
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Enter product name"
              />
            </label>

            <label>
              Category *
              <select
                className="admin-select"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {form.category &&
                  !PRODUCT_CATEGORIES.includes(form.category) && (
                    <option value={form.category}>{form.category}</option>
                  )}
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Price *
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </label>

            <label>
              Stock Quantity *
              <input
                type="number"
                name="stockQuantity"
                value={form.stockQuantity}
                onChange={handleChange}
                min="0"
                step="1"
                required
              />
            </label>

            <label className="admin-full-width">
              Image URL
              <input
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/product.jpg"
              />
            </label>

            <label className="admin-full-width">
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                placeholder="Enter product description"
              />
            </label>

            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
              />
              Product Active
            </label>
          </div>

          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={resetForm}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="admin-primary-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Product"
                  : "Save Product"}
            </button>
          </div>
        </form>
      )}

      <div className="admin-table-card">
        <div className="admin-table-toolbar">
          <div>
            <h2>All Products</h2>
            <p>{filteredProducts.length} products found</p>
          </div>

          <input
            className="admin-search-input"
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <p className="admin-loading">Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="admin-empty">No products found.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-cell">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                          />
                        ) : (
                          <div className="admin-product-placeholder">
                            No Image
                          </div>
                        )}
                        <span>{product.name}</span>
                      </div>
                    </td>

                    <td>{product.category}</td>
                    <td>₹{Number(product.price || 0).toFixed(2)}</td>
                    <td>{product.stockQuantity}</td>
                    <td>
                      <span
                        className={`admin-status ${
                          product.active ? "active" : "inactive"
                        }`}
                      >
                        {product.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-buttons">
                        <button
                          className="admin-edit-btn"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="admin-delete-btn"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </button>
                      </div>
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

export default AdminProducts;
