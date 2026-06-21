import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";

function PrivateRoute({ children }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                }
            />

            <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
    );
}

export default AppRoutes;