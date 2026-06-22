import { NavLink } from "react-router-dom";

function Sidebar() {
    return (
        <aside className="sidebar">
            <h2 className="logo">Cafe PKA</h2>

            <nav>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/categories">Danh mục</NavLink>
                <NavLink to="/products">Sản phẩm</NavLink>
                <NavLink to="/tables">Bàn</NavLink>
            </nav>
        </aside>
    );
}

export default Sidebar;