import { Navigate, Route, Routes } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import MainLayout from "../layouts/MainLayout";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import CategoryPage from "../pages/CategoryPage";
import ProductPage from "../pages/ProductPage";
import TablePage from "../pages/TablePage";

function PrivateRoute({ children }) {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
}

function AdminRoute({ children }) {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (user.role !== "admin") {
        return <Navigate to="/dashboard" />;
    }

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
            <Route path="/login" element={<Login />} />

            <Route
                path="/dashboard"
                element={
                    <ProtectedLayout>
                        <Dashboard />
                    </ProtectedLayout>
                }
            />

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