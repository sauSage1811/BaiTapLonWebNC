import { NavLink } from "react-router-dom";

const menuItems = [
    { to: "/dashboard", icon: "\ud83d\udcca", label: "Dashboard" },
    { to: "/categories", icon: "\ud83d\udccb", label: "Danh m\u1ee5c" },
    { to: "/products", icon: "\u2615", label: "S\u1ea3n ph\u1ea9m" },
    { to: "/tables", icon: "\ud83e\ude91", label: "B\u00e0n" },
];

function Sidebar({ collapsed, onToggle }) {
    return (
        <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
            <div className="sidebar-brand">
                <div className="sidebar-brand-inner">
                    <div className="sidebar-brand-icon">{"\u2615"}</div>
                    <div className="sidebar-brand-text">
                        <h2 className="logo">Cafe PKA</h2>
                        <span className="logo-sub">Quản Lý Hệ Thống</span>
                    </div>
                </div>
                <button
                    type="button"
                    className="sidebar-toggle"
                    onClick={onToggle}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    aria-expanded={!collapsed}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <span aria-hidden="true">{collapsed ? ">" : "<"}</span>
                </button>
            </div>

            <div className="sidebar-menu-label">Menu chính</div>

            <nav>
                {menuItems.map((item) => (
                    <NavLink key={item.to} to={item.to} title={item.label}>
                        <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-footer-text">{"\u00a9"} 2026 Coffee Management</div>
            </div>
        </aside>
    );
}

export default Sidebar;
