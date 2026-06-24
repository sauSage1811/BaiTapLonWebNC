import { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem("sidebarCollapsed");
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem("sidebarCollapsed", JSON.stringify(sidebarCollapsed));
    }, [sidebarCollapsed]);

    return (
        <div className={`main-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed((current) => !current)}
            />

            <div className="main-content">
                <Header />

                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default MainLayout;
