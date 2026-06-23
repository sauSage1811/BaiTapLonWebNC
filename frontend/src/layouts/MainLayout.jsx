import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
