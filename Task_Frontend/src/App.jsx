import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import { EcommerceAuthProvider } from "./context/EcommerceAuthContext";

import DashboardLayout from "./layouts/DashboardLayout";
import StudentManagement from "./pages/students/StudentManagement";
import ExpenseTracker from "./pages/expenses/ExpenseTracker";
import Ecommerce from "./pages/ecommerce/Ecommerce";
import ProductDetails from "./components/ecommerce/ProductDetails";
import CustomerLogin from "./pages/auth/CustomerLogin";
import CustomerRegister from "./pages/auth/CustomerRegister";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AdminLogin from "./pages/auth/AdminLogin";
import Cart from "./components/ecommerce/Cart";
import Checkout from "./components/ecommerce/Checkout";
import MyOrders from "./components/ecommerce/MyOrders";
import Profile from "./components/ecommerce/Profile";
import Wishlist from "./components/ecommerce/Wishlist";
import AdminDashboard from "./components/ecommerce/admin/AdminDashboard";
import AdminProducts from "./components/ecommerce/admin/AdminProducts";
import AdminOrders from "./components/ecommerce/admin/AdminOrders";
import AdminCustomers from "./components/ecommerce/admin/AdminCustomers";

function App() {
  return (
    <AuthProvider>
      <EcommerceAuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              duration: 5000,
              style: {
                borderRadius: "10px",
                background: "#ffffff",
                color: "#1e293b",
                padding: "14px 18px",
                fontSize: "14px",
              },
              success: {
                duration: 5000,
                iconTheme: {
                  primary: "#16a34a",
                  secondary: "#ffffff",
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: "#dc2626",
                  secondary: "#ffffff",
                },
              },
            }}
          />

          <Routes>
            <Route element={<DashboardLayout />}>
              <Route index element={<Navigate to="/students" replace />} />
              <Route path="/students" element={<StudentManagement />} />
              <Route path="/expenses" element={<ExpenseTracker />} />
              <Route path="/ecommerce" element={<Ecommerce />} />
              <Route path="/ecommerce/products/:id"  element={<ProductDetails />}/>
              <Route path="/ecommerce/login" element={<CustomerLogin />} />
              <Route path="/ecommerce/register"  element={<CustomerRegister />}/>
              <Route path="/ecommerce/forgot-password"  element={<ForgotPassword />}/>
              <Route path="/ecommerce/reset-password"element={<ResetPassword />}/>
              <Route path="/ecommerce/admin/login" element={<AdminLogin />} />
              <Route path="/ecommerce/cart" element={<Cart />} />
              <Route path="/ecommerce/checkout" element={<Checkout />} />
              <Route path="/ecommerce/my-orders" element={<MyOrders />} />
              <Route path="/ecommerce/profile" element={<Profile />} />
              <Route path="/ecommerce/wishlist" element={<Wishlist />} />
              <Route path="/ecommerce/admin" element={<AdminDashboard />} />
              <Route path="/ecommerce/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/ecommerce/admin/products" element={<AdminProducts />} />
              <Route path="/ecommerce/admin/orders" element={<AdminOrders />} />
              <Route path="/ecommerce/admin/customers" element={<AdminCustomers />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </EcommerceAuthProvider>
    </AuthProvider>
  );
}

export default App;
