import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logoImg from "../assets/logo.png";
import dashboardIcon from "../assets/icons/dashboard.svg";
import categoryIcon from "../assets/icons/category.svg";
import productIcon from "../assets/icons/product.svg";
import tableIcon from "../assets/icons/table.svg";
import logoutIcon from "../assets/icons/logout.svg";

const adminMenuItems = [
    { to: "/dashboard", icon: dashboardIcon, label: "Dashboard" },
    { to: "/categories", icon: categoryIcon, label: "Danh mục" },
    { to: "/products", icon: productIcon, label: "Menu" },
    { to: "/tables", icon: tableIcon, label: "Bàn" },
];

const staffMenuItems = [
    { to: "/dashboard", icon: dashboardIcon, label: "Dashboard" },
];

function Sidebar({ collapsed, onToggle }) {
    const { user, logout } = useAuth();
    const menuItems = user?.role === "admin" ? adminMenuItems : staffMenuItems;

    const handleLogout = async () => {
        await logout();
        window.location.href = "/login";
    };

    return (
        <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
            <div className="sidebar-brand">
                <div className="sidebar-brand-inner">
                    <div className="sidebar-brand-icon">
                        <img src={logoImg} alt="Cafe PKA Logo" className="sidebar-logo-img" />
                    </div>
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
                    <span aria-hidden="true">≡</span>
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
                <button className="btn-logout sidebar-logout" onClick={handleLogout} title="Đăng xuất">
                    <img src={logoutIcon} alt="" className="logout-icon" aria-hidden="true" />
                    <span className="nav-label">Đăng xuất</span>
                </button>
                <div className="sidebar-footer-text">{"\u00a9"} 2026 Coffee Management</div>
            </div>
        </aside>
    );
}

export default Sidebar;
