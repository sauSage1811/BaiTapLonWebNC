import { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem("sidebarCollapsed");
        return saved ? JSON.parse(saved) : false;
    });
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem("sidebarCollapsed", JSON.stringify(sidebarCollapsed));
    }, [sidebarCollapsed]);

    return (
        <div className={`main-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${sidebarOpen ? "sidebar-open" : ""}`}>
            <Sidebar
                collapsed={sidebarCollapsed}
                mobileOpen={sidebarOpen}
                onToggle={() => setSidebarCollapsed((current) => !current)}
                onNavigate={() => setSidebarOpen(false)}
            />
            <button
                type="button"
                className="sidebar-backdrop"
                onClick={() => setSidebarOpen(false)}
                aria-label="Đóng menu"
            />

            <div className="main-content">
                <Header onMenuClick={() => setSidebarOpen(true)} />

                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default MainLayout;
