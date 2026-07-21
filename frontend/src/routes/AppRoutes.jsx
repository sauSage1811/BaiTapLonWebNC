import { Navigate, Route, Routes } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import MainLayout from "../layouts/MainLayout";

import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import Dashboard from "../pages/Dashboard";
import CategoryPage from "../pages/CategoryPage";
import ProductPage from "../pages/ProductPage";
import TablePage from "../pages/TablePage";

import CreateOrderPage from "../pages/CreateOrderPage"; 
import AddItemPage from "../pages/AddItemPage";

import PayOrderPage from "../pages/PayOrderPage";
import OrderHistoryPage from "../pages/OrderHistoryPage"; 

function PrivateRoute({ children }) {
    const { user, loading } = useContext(AuthContext);
    if (loading) return null;
    if (!user) return <Navigate to="/login" />;
    return children;
}

function AdminRoute({ children }) {
    const { user, loading } = useContext(AuthContext);
    if (loading) return null;
    if (!user) return <Navigate to="/login" />;
    if (user.role !== "admin") return <Navigate to="/dashboard" />;
    return children;
}

function ProtectedLayout({ children }) {
    return (
        <PrivateRoute>
            <MainLayout>
                {children}
            </MainLayout>
        </PrivateRoute>
    );
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedLayout>
                        <Dashboard />
                    </ProtectedLayout>
                }
            />

            {/* CREATE ORDER */}
            <Route
                path="/create-order"
                element={
                    <ProtectedLayout>
                        <CreateOrderPage />
                    </ProtectedLayout>
                }
            />

            {/* ORDER ITEM */}
            <Route
                path="/orders/:orderId/add-item"
                element={
                    <ProtectedLayout>
                        <AddItemPage />
                    </ProtectedLayout>
                }
            />

            {/* PAY ORDER */}
            <Route
                path="/orders/:orderId/pay"
                element={
                    <ProtectedLayout>
                        <PayOrderPage />
                    </ProtectedLayout>
                }
            />

            {/* 2. THÊM ROUTE LỊCH SỬ ĐƠN HÀNG VÀO ĐÂY */}
            <Route
                path="/orders/history"
                element={
                    <ProtectedLayout>
                        <OrderHistoryPage />
                    </ProtectedLayout>
                }
            />

            {/* Admin Routes */}
            <Route
                path="/categories"
                element={
                    <AdminRoute>
                        <ProtectedLayout>
                            <CategoryPage />
                        </ProtectedLayout>
                    </AdminRoute>
                }
            />

            <Route
                path="/products"
                element={
                    <AdminRoute>
                        <ProtectedLayout>
                            <ProductPage />
                        </ProtectedLayout>
                    </AdminRoute>
                }
            />

            <Route
                path="/tables"
                element={
                    <AdminRoute>
                        <ProtectedLayout>
                            <TablePage />
                        </ProtectedLayout>
                    </AdminRoute>
                }
            />

            <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
    );
}

export default AppRoutes;