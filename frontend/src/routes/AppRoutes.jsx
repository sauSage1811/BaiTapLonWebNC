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
                    <ProtectedLayout>
                        <CategoryPage />
                    </ProtectedLayout>
                }
            />

            <Route
                path="/products"
                element={
                    <ProtectedLayout>
                        <ProductPage />
                    </ProtectedLayout>
                }
            />

            <Route
                path="/tables"
                element={
                    <ProtectedLayout>
                        <TablePage />
                    </ProtectedLayout>
                }
            />

            <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
    );
}

export default AppRoutes;