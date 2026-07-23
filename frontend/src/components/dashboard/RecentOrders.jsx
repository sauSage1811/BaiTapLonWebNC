import { Link } from "react-router-dom";

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function formatDateTime(value) {
    if (!value) return "---";
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

function getStatusMeta(status) {
    if (status === "paid") {
        return { label: "Đã thanh toán", className: "paid" };
    }

    if (status === "cancelled") {
        return { label: "Đã hủy", className: "cancelled" };
    }

    return { label: "Chờ xử lý", className: "pending" };
}

function getTableLabel(order) {
    const tableName = order?.tableName || "";

    if (tableName.toLowerCase().includes("mang")) {
        return "Mang về";
    }

    return tableName || (order?.tableId ? `Bàn #${order.tableId}` : "Mang về");
}

function RecentOrders({ orders, loading, error, onViewDetail }) {
    const rows = Array.isArray(orders) ? orders : [];

    return (
        <section className="dash-card dash-recent-orders-card">
            <div className="dash-card-header">
                <div>
                    <h2>Đơn hàng gần đây</h2>
                    <p>Các đơn mới nhất trong hệ thống</p>
                </div>
                <Link to="/orders/history" className="dash-card-link">Xem tất cả</Link>
            </div>

            <div className="dash-table-wrap">
                {loading ? (
                    <div className="dash-table-loading">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <span className="dash-skeleton-line" key={index} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="dash-card-state error">{error}</div>
                ) : rows.length === 0 ? (
                    <div className="dash-card-state">Chưa có đơn hàng nào</div>
                ) : (
                    <table className="dash-orders-table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Bàn</th>
                                <th>Nhân viên</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Thời gian</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((order) => {
                                const statusMeta = getStatusMeta(order.status);

                                return (
                                    <tr key={order.id}>
                                        <td className="dash-order-code">#{order.id}</td>
                                        <td>{getTableLabel(order)}</td>
                                        <td>{order.staffName || "---"}</td>
                                        <td className="dash-money">{formatMoney(order.totalAmount)}</td>
                                        <td>
                                            <span className={`dash-status-badge ${statusMeta.className}`}>
                                                {statusMeta.label}
                                            </span>
                                        </td>
                                        <td>{formatDateTime(order.createdAt)}</td>
                                        <td>
                                            <button
                                                type="button"
                                                className="dash-detail-button"
                                                onClick={() => onViewDetail(order.id)}
                                            >
                                                Xem
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
}

export default RecentOrders;
