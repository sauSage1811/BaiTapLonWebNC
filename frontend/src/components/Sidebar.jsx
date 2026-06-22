import { NavLink } from "react-router-dom";

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-brand-inner">
                    <div className="sidebar-brand-icon">☕</div>
                    <div className="sidebar-brand-text">
                        <h2 className="logo">Cafe Admin</h2>
                        <span className="logo-sub">Quản lý bán hàng</span>
                    </div>
                </div>
            </div>

            <div className="sidebar-menu-label">Menu chính</div>

            <nav>
                <NavLink to="/dashboard">
                    <span className="nav-icon">📊</span>
                    Dashboard
                </NavLink>
                <NavLink to="/categories">
                    <span className="nav-icon">📋</span>
                    Danh mục
                </NavLink>
                <NavLink to="/products">
                    <span className="nav-icon">☕</span>
                    Sản phẩm
                </NavLink>
                <NavLink to="/tables">
                    <span className="nav-icon">🪑</span>
                    Bàn
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-footer-text">© 2026 Coffee Management</div>
            </div>
        </aside>
    );
}

export default Sidebar;