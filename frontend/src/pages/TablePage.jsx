import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const emptyInvoice = {
    open: false,
    loading: false,
    error: "",
    data: null
};

function normalizeStatus(status) {
    if (status === "available") return "empty";
    if (status === "occupied") return "using";
    return status || "empty";
}

function normalizeTable(table) {
    const rawTableNumber = table.tableNumber || table.name || "";

    return {
        ...table,
        status: normalizeStatus(table.status),
        tableNumber: rawTableNumber.replace(/^Bàn\s*/i, ""),
        useTime: table.useTime || table.use_time || null,
        activeOrderId: table.active_order_id || null,
        latestPaidOrderId: table.latest_paid_order_id || null,
        latestPaidAt: table.latest_paid_at || null,
        latestPaidTotal: Number(table.latest_paid_total || 0)
    };
}

function formatMoney(value) {
    return `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} VNĐ`;
}

function formatDateTime(value) {
    if (!value) return "Chưa có dữ liệu";
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

function getTableName(table) {
    return table.name || `Bàn ${table.tableNumber || table.id}`;
}

function TablePage() {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState(null);
    const [invoice, setInvoice] = useState(emptyInvoice);

    const fetchTables = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const res = await api.get("/tables");
            setTables((res.data.data || []).map(normalizeTable));
        } catch (err) {
            setError(err.response?.data?.message || "Không tải được danh sách bàn");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        Promise.resolve().then(fetchTables);
    }, [fetchTables]);

    const groupedTables = useMemo(() => {
        const empty = [];
        const using = [];
        const maintenance = [];

        tables.forEach((table) => {
            if (table.status === "maintenance") {
                maintenance.push(table);
            } else if (table.status === "using") {
                using.push(table);
            } else {
                empty.push(table);
            }
        });

        return { empty, using, maintenance };
    }, [tables]);

    const setStatus = async (table, status, confirmation) => {
        if (status === "maintenance" && table.status !== "empty") {
            setMessage({ type: "error", text: "Cần trả bàn trước khi chuyển sang bảo trì" });
            return;
        }

        if (confirmation && !window.confirm(confirmation)) {
            return;
        }

        setActionLoadingId(table.id);
        setMessage(null);

        try {
            const res = await api.put(`/tables/${table.id}/status`, { status });
            const updated = normalizeTable(res.data.data);

            setTables((prev) => prev.map((item) => (item.id === table.id ? updated : item)));
            setMessage({
                type: "success",
                text: res.data?.message || "Cập nhật trạng thái bàn thành công"
            });
        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Không cập nhật được trạng thái bàn"
            });
        } finally {
            setActionLoadingId(null);
        }
    };

    const openInvoice = async (table) => {
        setInvoice({ open: true, loading: true, error: "", data: null });

        try {
            const res = await api.get(`/tables/${table.id}/latest-paid-order`);
            setInvoice({ open: true, loading: false, error: "", data: res.data.data });
        } catch (err) {
            setInvoice({
                open: true,
                loading: false,
                error: err.response?.data?.message || "Không tải được hóa đơn",
                data: null
            });
        }
    };

    const closeInvoice = () => {
        setInvoice(emptyInvoice);
    };

    const renderEmptyState = (text) => (
        <div className="tb-section-empty">
            {text}
        </div>
    );

    const renderEmptyTable = (table) => (
        <div key={table.id} className="tb-manage-card tb-manage-empty">
            <div className="tb-manage-card-main">
                <div>
                    <h3>{getTableName(table)}</h3>
                    <p>{table.capacity ? `${table.capacity} khách` : "Chưa có sức chứa"}</p>
                </div>
                <span className="tb-status-pill tb-status-empty">Bàn trống</span>
            </div>
            <button
                type="button"
                className="btn btn-sm btn-secondary"
                disabled={actionLoadingId === table.id}
                onClick={() => setStatus(table, "maintenance", `Chuyển ${getTableName(table)} sang bảo trì?`)}
            >
                {actionLoadingId === table.id ? "Đang cập nhật..." : "Chuyển sang bảo trì"}
            </button>
        </div>
    );

    const renderUsingTable = (table) => (
        <div key={table.id} className="tb-manage-card tb-manage-using">
            <div className="tb-manage-card-main">
                <div>
                    <h3>{getTableName(table)}</h3>
                    <p>Đang phục vụ tại bàn</p>
                </div>
                <span className="tb-status-pill tb-status-using">Đang sử dụng</span>
            </div>
            <div className="tb-manage-meta">
                <span>Mã đơn: {table.activeOrderId ? `#${table.activeOrderId} (đang mở)` : table.latestPaidOrderId ? `#${table.latestPaidOrderId}` : "Chưa có"}</span>
                <span>Thanh toán: {formatDateTime(table.latestPaidAt)}</span>
                <span>Tổng tiền: {table.latestPaidOrderId ? formatMoney(table.latestPaidTotal) : "Chưa có"}</span>
            </div>
            <div className="tb-manage-actions">
                <button type="button" className="btn btn-sm btn-edit" onClick={() => openInvoice(table)}>
                    Xem hóa đơn
                </button>
                <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    disabled={actionLoadingId === table.id}
                    onClick={() => setStatus(table, "empty", "Xác nhận khách đã rời đi và trả bàn này?")}
                >
                    {actionLoadingId === table.id ? "Đang trả..." : "Trả bàn"}
                </button>
            </div>
        </div>
    );

    const renderMaintenanceTable = (table) => (
        <div key={table.id} className="tb-manage-card tb-manage-maintenance">
            <div className="tb-manage-card-main">
                <div>
                    <h3>{getTableName(table)}</h3>
                    <p>{table.useTime || "Không có ghi chú bảo trì"}</p>
                </div>
                <span className="tb-status-pill tb-status-maintenance">Bảo trì</span>
            </div>
            <button
                type="button"
                className="btn btn-sm btn-secondary"
                disabled={actionLoadingId === table.id}
                onClick={() => setStatus(table, "empty", `Hoàn tất bảo trì ${getTableName(table)}?`)}
            >
                {actionLoadingId === table.id ? "Đang cập nhật..." : "Hoàn tất bảo trì"}
            </button>
        </div>
    );

    return (
        <div className="table-page">
            <div className="page-header">
                <div className="page-header-text">
                    <h1>Quản lý bàn</h1>
                    <p>Theo dõi trạng thái bàn và xử lý nhanh bảo trì, trả bàn.</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary btn-with-icon" onClick={fetchTables} disabled={loading}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.5 2v6h-6" /><path d="M2.5 22v-6h6" /><path d="M2 11.5a10 10 0 0 1 18.8-4.3" /><path d="M22 12.5a10 10 0 0 1-18.8 4.2" />
                        </svg>
                        {loading ? "Đang tải" : "Refresh"}
                    </button>
                </div>
            </div>

            {error && <div className="tb-api-message" role="alert">{error}</div>}
            {message && <div className={`alert alert-${message.type}`} role="alert">{message.text}</div>}

            <div className="tb-stats-grid">
                <div className="tb-stat-card tb-stat-total">
                    <div className="tb-stat-value">{tables.length}</div>
                    <div className="tb-stat-label">Tổng bàn</div>
                </div>
                <div className="tb-stat-card tb-stat-empty">
                    <div className="tb-stat-value">{groupedTables.empty.length}</div>
                    <div className="tb-stat-label">Bàn trống</div>
                </div>
                <div className="tb-stat-card tb-stat-using">
                    <div className="tb-stat-value">{groupedTables.using.length}</div>
                    <div className="tb-stat-label">Đang sử dụng</div>
                </div>
                <div className="tb-stat-card tb-stat-maint">
                    <div className="tb-stat-value">{groupedTables.maintenance.length}</div>
                    <div className="tb-stat-label">Bảo trì</div>
                </div>
            </div>

            <section className="tb-manage-section">
                <div className="tb-manage-section-header">
                    <h2>Bàn trống</h2>
                    <span>{groupedTables.empty.length} bàn</span>
                </div>
                <div className="tb-manage-grid">
                    {loading ? renderEmptyState("Đang tải bàn trống...") : groupedTables.empty.length === 0 ? renderEmptyState("Không có bàn trống") : groupedTables.empty.map(renderEmptyTable)}
                </div>
            </section>

            <section className="tb-manage-section">
                <div className="tb-manage-section-header">
                    <h2>Đang sử dụng</h2>
                    <span>{groupedTables.using.length} bàn</span>
                </div>
                <div className="tb-manage-grid">
                    {loading ? renderEmptyState("Đang tải bàn đang sử dụng...") : groupedTables.using.length === 0 ? renderEmptyState("Không có bàn đang sử dụng") : groupedTables.using.map(renderUsingTable)}
                </div>
            </section>

            <section className="tb-manage-section">
                <div className="tb-manage-section-header">
                    <h2>Bảo trì</h2>
                    <span>{groupedTables.maintenance.length} bàn</span>
                </div>
                <div className="tb-manage-grid">
                    {loading ? renderEmptyState("Đang tải bàn bảo trì...") : groupedTables.maintenance.length === 0 ? renderEmptyState("Không có bàn bảo trì") : groupedTables.maintenance.map(renderMaintenanceTable)}
                </div>
            </section>

            {invoice.open && (
                <div className="modal-overlay" role="presentation" onMouseDown={closeInvoice}>
                    <div className="entity-modal invoice-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
                        <div className="entity-modal-header">
                            <div>
                                <h2>Chi tiết hóa đơn</h2>
                                <p>Chỉ xem hóa đơn đã thanh toán gần nhất của bàn.</p>
                            </div>
                            <button type="button" className="modal-close-btn" onClick={closeInvoice} aria-label="Đóng">
                                ×
                            </button>
                        </div>

                        <div className="invoice-body">
                            {invoice.loading ? (
                                <div className="empty-state">Đang tải hóa đơn...</div>
                            ) : invoice.error ? (
                                <div className="tb-api-message">{invoice.error}</div>
                            ) : (
                                <>
                                    <div className="invoice-summary">
                                        <div><span>Mã đơn</span><strong>#{invoice.data.id}</strong></div>
                                        <div><span>Bàn</span><strong>{invoice.data.table_name}</strong></div>
                                        <div><span>Thu ngân</span><strong>{invoice.data.cashier_name || "Không rõ"}</strong></div>
                                        <div><span>Thanh toán</span><strong>{formatDateTime(invoice.data.paid_at)}</strong></div>
                                    </div>

                                    <table className="data-table invoice-table">
                                        <thead>
                                            <tr>
                                                <th>Món</th>
                                                <th>Số lượng</th>
                                                <th>Đơn giá</th>
                                                <th>Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(invoice.data.items || []).map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.product_name || `Món #${item.product_id}`}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{formatMoney(item.price)}</td>
                                                    <td>{formatMoney(item.subtotal)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div className="invoice-total">
                                        <span>Tổng tiền</span>
                                        <strong>{formatMoney(invoice.data.total_amount)}</strong>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TablePage;
