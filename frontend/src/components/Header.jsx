import { useAuth } from "../hooks/useAuth";
import { useLocation } from "react-router-dom";

const PAGE_META = {
    "/dashboard": {
        title: "Dashboard",
        description: "Tổng quan hoạt động kinh doanh"
    },
    "/categories": {
        title: "Danh mục",
        description: "Quản lý nhóm sản phẩm"
    },
    "/products": {
        title: "Menu",
        description: "Quản lý sản phẩm đang bán"
    },
    "/tables": {
        title: "Bàn",
        description: "Theo dõi trạng thái bàn"
    },
    "/create-order": {
        title: "Tạo đơn hàng",
        description: "Gọi món và xử lý đơn mới"
    },
    "/orders/history": {
        title: "Lịch sử đơn hàng",
        description: "Tra cứu các đơn đã tạo"
    },
    "/revenue": {
        title: "Doanh thu",
        description: "Báo cáo doanh thu đã thanh toán"
    }
};

function Header({ onMenuClick }) {
    const { user } = useAuth();
    const location = useLocation();
    const pageMeta = PAGE_META[location.pathname] || {
        title: "Coffee Management",
        description: "Quản lý vận hành quán"
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.charAt(0).toUpperCase();
    };

    return (
        <header className="header">
            <div className="header-left">
                <button
                    type="button"
                    className="header-menu-button"
                    onClick={onMenuClick}
                    aria-label="Mở menu"
                >
                    <span aria-hidden="true">☰</span>
                </button>
                <div className="header-title-block">
                    <h2>{pageMeta.title}</h2>
                    <p>{pageMeta.description}</p>
                </div>
            </div>

            <div className="header-user">
                <div className="header-user-info">
                    <div className="header-user-avatar">
                        {getInitials(user?.full_name)}
                    </div>
                    <div className="header-user-text">
                        <span className="header-user-name">{user?.full_name || "Người dùng"}</span>
                        <span className="role">{user?.role || "staff"}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
