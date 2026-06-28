import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logoImg from "../assets/logo.png";
import dashboardIcon from "../assets/icons/dashboard.svg";
import categoryIcon from "../assets/icons/category.svg";
import productIcon from "../assets/icons/product.svg";
import tableIcon from "../assets/icons/table.svg";

const adminMenuItems = [
    { to: "/dashboard", icon: dashboardIcon, label: "Dashboard" },
    { to: "/categories", icon: categoryIcon, label: "Danh m\u1ee5c" },
    { to: "/products", icon: productIcon, label: "S\u1ea3n ph\u1ea9m" },
    { to: "/tables", icon: tableIcon, label: "B\u00e0n" },
];

const staffMenuItems = [
    { to: "/dashboard", icon: dashboardIcon, label: "Dashboard" },
];

function Sidebar({ collapsed, onToggle }) {
    const { user } = useAuth();
    const menuItems = user?.role === "admin" ? adminMenuItems : staffMenuItems;

    return (
        <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
            <div className="sidebar-brand">
                <div className="sidebar-brand-inner">
                    <div className="sidebar-brand-icon"><img src={logoImg} alt="Cafe PKA Logo" className="sidebar-logo-img" /></div>
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
                    <span aria-hidden="true">{collapsed ? "≡" : "≡"}</span>
                </button>
            </div>

            <div className="sidebar-menu-label">Menu chính</div>

            <nav>
                {menuItems.map((item) => (
                    <NavLink 
                        key={item.to} 
                        to={item.to} 
                        title={item.label}
                    >
                        <img
                            className="nav-icon"
                            src={item.icon}
                            alt=""
                            aria-hidden="true"
                        />
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
