import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthProvider";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";

function App() {
    useEffect(() => {
        const savedTheme = localStorage.getItem("themeMode") || "light";
        document.body.classList.toggle("dark-theme", savedTheme === "dark");
    }, []);

    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
