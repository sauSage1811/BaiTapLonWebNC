import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import QuickActions from "../components/dashboard/QuickActions";
import RecentOrders from "../components/dashboard/RecentOrders";
import RevenueChart from "../components/dashboard/RevenueChart";
import StatCard from "../components/dashboard/StatCard";
import TopProducts from "../components/dashboard/TopProducts";
import productIcon from "../assets/icons/product.svg";
import orderIcon from "../assets/icons/order.svg";
import revenueIcon from "../assets/icons/revenue.svg";
import tableIcon from "../assets/icons/table.svg";

const DEFAULT_OVERVIEW = {
    todayRevenue: 0,
    todayOrders: 0,
    occupiedTables: 0,
    totalTables: 0,
    activeProducts: 0
};

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

function getStatusLabel(status) {
    if (status === "paid") return "Đã thanh toán";
    if (status === "cancelled") return "Đã hủy";
    return "Chờ xử lý";
}

function getTableLabel(order) {
    const tableName = order?.table_name || order?.tableName || "";

    if (tableName.toLowerCase().includes("mang")) {
        return "Mang về";
    }

    return tableName || (order?.table_id || order?.tableId ? `Bàn #${order.table_id || order.tableId}` : "Mang về");
}

function Dashboard() {
    const { user } = useAuth();
    const [overviewState, setOverviewState] = useState({
        data: DEFAULT_OVERVIEW,
        loading: true,
        error: ""
    });
    const [revenueRange, setRevenueRange] = useState("7d");
    const [revenueState, setRevenueState] = useState({ data: [], loading: true, error: "" });
    const [topProductsState, setTopProductsState] = useState({ data: [], loading: true, error: "" });
    const [recentOrdersState, setRecentOrdersState] = useState({ data: [], loading: true, error: "" });
    const [detailState, setDetailState] = useState({ order: null, loading: false, error: "" });

    useEffect(() => {
        let ignore = false;

        async function fetchOverview() {
            setOverviewState((current) => ({ ...current, loading: true, error: "" }));

            try {
                const res = await api.get("/dashboard/overview");
                if (ignore) return;
                setOverviewState({
                    data: { ...DEFAULT_OVERVIEW, ...(res.data?.data || {}) },
                    loading: false,
                    error: ""
                });
            } catch (error) {
                if (ignore) return;
                setOverviewState({
                    data: DEFAULT_OVERVIEW,
                    loading: false,
                    error: error.response?.data?.message || "Không thể tải số liệu tổng quan"
                });
            }
        }

        async function fetchTopProducts() {
            setTopProductsState((current) => ({ ...current, loading: true, error: "" }));

            try {
                const res = await api.get("/dashboard/top-products?limit=5");
                if (ignore) return;
                setTopProductsState({
                    data: Array.isArray(res.data?.data) ? res.data.data : [],
                    loading: false,
                    error: ""
                });
            } catch (error) {
                if (ignore) return;
                setTopProductsState({
                    data: [],
                    loading: false,
                    error: error.response?.data?.message || "Không thể tải sản phẩm bán chạy"
                });
            }
        }

        async function fetchRecentOrders() {
            setRecentOrdersState((current) => ({ ...current, loading: true, error: "" }));

            try {
                const res = await api.get("/dashboard/recent-orders?limit=8");
                if (ignore) return;
                setRecentOrdersState({
                    data: Array.isArray(res.data?.data) ? res.data.data : [],
                    loading: false,
                    error: ""
                });
            } catch (error) {
                if (ignore) return;
                setRecentOrdersState({
                    data: [],
                    loading: false,
                    error: error.response?.data?.message || "Không thể tải đơn hàng gần đây"
                });
            }
        }

        fetchOverview();
        fetchTopProducts();
        fetchRecentOrders();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        let ignore = false;

        async function fetchRevenue() {
            setRevenueState((current) => ({ ...current, loading: true, error: "" }));

            try {
                const res = await api.get(`/dashboard/revenue?range=${revenueRange}`);
                if (ignore) return;
                setRevenueState({
                    data: Array.isArray(res.data?.data) ? res.data.data : [],
                    loading: false,
                    error: ""
                });
            } catch (error) {
                if (ignore) return;
                setRevenueState({
                    data: [],
                    loading: false,
                    error: error.response?.data?.message || "Không thể tải biểu đồ doanh thu"
                });
            }
        }

        fetchRevenue();

        return () => {
            ignore = true;
        };
    }, [revenueRange]);

    async function handleViewOrderDetail(orderId) {
        setDetailState({ order: null, loading: true, error: "" });

        try {
            const res = await api.get(`/orders/${orderId}`);
            setDetailState({ order: res.data?.data || null, loading: false, error: "" });
        } catch (error) {
            setDetailState({
                order: null,
                loading: false,
                error: error.response?.data?.message || "Không thể tải chi tiết đơn hàng"
            });
        }
    }

    const overview = overviewState.data;

    const stats = [
        {
            label: "Tổng doanh thu hôm nay",
            value: formatMoney(overview.todayRevenue),
            detail: "Từ đơn đã thanh toán",
            icon: revenueIcon
        },
        {
            label: "Tổng đơn hàng hôm nay",
            value: Number(overview.todayOrders || 0).toLocaleString("vi-VN"),
            detail: "Bao gồm mọi trạng thái",
            icon: orderIcon
        },
        {
            label: "Bàn đang sử dụng",
            value: `${Number(overview.occupiedTables || 0).toLocaleString("vi-VN")}/${Number(overview.totalTables || 0).toLocaleString("vi-VN")}`,
            detail: "Theo trạng thái bàn hiện tại",
            icon: tableIcon
        },
        {
            label: "Sản phẩm đang bán",
            value: Number(overview.activeProducts || 0).toLocaleString("vi-VN"),
            detail: "Sản phẩm ở trạng thái active",
            icon: productIcon
        }
    ];

    return (
        <div className="dashboard-page">
            <div className="dashboard-topbar">
                <div>
                    <p className="dashboard-kicker">Tổng quan</p>
                    <h1>Hoạt động kinh doanh</h1>
                </div>
                <QuickActions role={user?.role} />
            </div>

            {overviewState.loading ? (
                <DashboardSkeleton />
            ) : (
                <div className="dashboard-stats-grid">
                    {stats.map((stat) => (
                        <StatCard
                            key={stat.label}
                            icon={stat.icon}
                            label={stat.label}
                            value={stat.value}
                            detail={overviewState.error || stat.detail}
                            loading={overviewState.loading}
                            error={overviewState.error}
                        />
                    ))}
                </div>
            )}

            <div className="dashboard-main-grid">
                <RevenueChart
                    data={revenueState.data}
                    range={revenueRange}
                    onRangeChange={setRevenueRange}
                    loading={revenueState.loading}
                    error={revenueState.error}
                />
                <TopProducts
                    products={topProductsState.data}
                    loading={topProductsState.loading}
                    error={topProductsState.error}
                />
            </div>

            <RecentOrders
                orders={recentOrdersState.data}
                loading={recentOrdersState.loading}
                error={recentOrdersState.error}
                onViewDetail={handleViewOrderDetail}
            />

            {(detailState.loading || detailState.order || detailState.error) && (
                <div className="dash-modal-overlay" role="dialog" aria-modal="true" aria-label="Chi tiết đơn hàng">
                    <div className="dash-order-modal">
                        <div className="dash-modal-header">
                            <div>
                                <h2>Chi tiết đơn hàng</h2>
                                <p>{detailState.order ? `Mã đơn #${detailState.order.id}` : "Đang tải dữ liệu"}</p>
                            </div>
                            <button
                                type="button"
                                className="dash-modal-close"
                                onClick={() => setDetailState({ order: null, loading: false, error: "" })}
                                aria-label="Đóng"
                            >
                                ×
                            </button>
                        </div>

                        {detailState.loading ? (
                            <div className="dash-card-state">Đang tải chi tiết đơn hàng...</div>
                        ) : detailState.error ? (
                            <div className="dash-card-state error">{detailState.error}</div>
                        ) : detailState.order ? (
                            <>
                                <div className="dash-order-summary">
                                    <div>
                                        <span>Bàn</span>
                                        <strong>{getTableLabel(detailState.order)}</strong>
                                    </div>
                                    <div>
                                        <span>Trạng thái</span>
                                        <strong>{getStatusLabel(detailState.order.status)}</strong>
                                    </div>
                                    <div>
                                        <span>Thời gian</span>
                                        <strong>{formatDateTime(detailState.order.created_at)}</strong>
                                    </div>
                                </div>

                                <div className="dash-order-items">
                                    {(detailState.order.items || []).length === 0 ? (
                                        <div className="dash-card-state">Đơn hàng chưa có món</div>
                                    ) : (
                                        detailState.order.items.map((item) => (
                                            <div className="dash-order-item" key={item.id}>
                                                <div>
                                                    <strong>{item.product_name || "Sản phẩm"}</strong>
                                                    <span>x{Number(item.quantity || 0).toLocaleString("vi-VN")}</span>
                                                </div>
                                                <span>{formatMoney(item.subtotal || Number(item.price || 0) * Number(item.quantity || 0))}</span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="dash-order-total">
                                    <span>Tổng tiền</span>
                                    <strong>{formatMoney(detailState.order.total_amount)}</strong>
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
