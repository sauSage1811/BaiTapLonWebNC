import { Link } from "react-router-dom";
import orderIcon from "../../assets/icons/order.svg";
import tableIcon from "../../assets/icons/table.svg";
import productIcon from "../../assets/icons/product.svg";
import historyIcon from "../../assets/icons/history.svg";

function QuickActions({ role }) {
    const adminActions = [
        { to: "/create-order", label: "Tạo đơn mới", icon: orderIcon },
        { to: "/tables", label: "Quản lý bàn", icon: tableIcon },
        { to: "/products", label: "Quản lý menu", icon: productIcon }
    ];

    const staffActions = [
        { to: "/create-order", label: "Tạo đơn mới", icon: orderIcon },
        { to: "/orders/history", label: "Lịch sử đơn", icon: historyIcon }
    ];

    const actions = role === "admin" ? adminActions : staffActions;

    return (
        <div className="dash-quick-actions" aria-label="Thao tác nhanh">
            {actions.map((action) => (
                <Link key={action.to} to={action.to} className="dash-quick-action">
                    <img src={action.icon} alt="" aria-hidden="true" />
                    <span>{action.label}</span>
                </Link>
            ))}
        </div>
    );
}

export default QuickActions;
