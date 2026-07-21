import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";

function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        products: null,
        categories: null,
        tables: null
    });
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState("");

    const today = new Date().toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    useEffect(() => {
        let ignore = false;
        const requests = [
            ["products", "/products"],
            ["categories", "/categories"],
            ["tables", "/tables"]
        ];

        setStatsLoading(true);
        setStatsError("");

        Promise.allSettled(requests.map(([, url]) => api.get(url)))
            .then((results) => {
                if (ignore) return;

                let hasError = false;
                const nextStats = {};

                results.forEach((result, index) => {
                    const key = requests[index][0];

                    if (result.status === "fulfilled") {
                        const data = result.value.data?.data;
                        nextStats[key] = Array.isArray(data) ? data.length : 0;
                    } else {
                        hasError = true;
                        nextStats[key] = 0;
                    }
                });

                setStats(nextStats);
                setStatsError(hasError ? "Không tải được đầy đủ số liệu dashboard" : "");
            })
            .finally(() => {
                if (!ignore) {
                    setStatsLoading(false);
                }
            });

        return () => {
            ignore = true;
        };
    }, []);

    const formatStat = (value) => {
        if (statsLoading && value === null) {
            return "...";
        }

        return value ?? 0;
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-welcome animate-in">
                <h1>👋 Xin chào, {user?.full_name || "Admin"}!</h1>
                <p>Chào mừng bạn quay lại hệ thống quản lý Coffee Management.</p>
                <div className="welcome-date">📅 {today}</div>
            </div>

            {statsError && <div className="error-message">{statsError}</div>}

            <div className="dashboard-stats">
                <div className="stat-card animate-in">
                    <div className="stat-card-header">
                        <div className="stat-card-icon">☕</div>
                    </div>
                    <div className="stat-card-value">{formatStat(stats.products)}</div>
                    <div className="stat-card-label">Tổng món</div>
                </div>

                <div className="stat-card animate-in">
                    <div className="stat-card-header">
                        <div className="stat-card-icon">📋</div>
                    </div>
                    <div className="stat-card-value">{formatStat(stats.categories)}</div>
                    <div className="stat-card-label">Tổng danh mục</div>
                </div>

                <div className="stat-card animate-in">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"></div>
                    </div>
                    <div className="stat-card-value">{formatStat(stats.tables)}</div>
                    <div className="stat-card-label">Tổng số bàn</div>
                </div>

                <div className="stat-card animate-in">
                    <div className="stat-card-header">
                        <div className="stat-card-icon">✅</div>
                    </div>
                    <div className="stat-card-value">{statsError ? "Offline" : "Online"}</div>
                    <div className="stat-card-label">Trạng thái hệ thống</div>
                </div>
            </div>

            {user?.role === "admin" && (
                <div className="dashboard-section animate-in">
                    <div className="dashboard-section-title">⚡ Thao tác nhanh</div>
                    <div className="quick-actions">
                        <Link to="/categories" className="quick-action-card">
                            <div className="quick-action-icon">📋</div>
                            <div>
                                <div className="quick-action-text">Quản lý danh mục</div>
                                <div className="quick-action-desc">Thêm, sửa, xóa danh mục</div>
                            </div>
                        </Link>
                        <Link to="/products" className="quick-action-card">
                            <div className="quick-action-icon">☕</div>
                            <div>
                                <div className="quick-action-text">Quản lý menu</div>
                                <div className="quick-action-desc">Xem và cập nhật món</div>
                            </div>
                        </Link>
                        <Link to="/tables" className="quick-action-card">
                            <div className="quick-action-icon"></div>
                            <div>
                                <div className="quick-action-text">Quản lý bàn</div>
                                <div className="quick-action-desc">Trạng thái bàn trong quán</div>
                            </div>
                        </Link>
                    </div>
                </div>
            )}

            <div className="dashboard-section animate-in">
                <div className="dashboard-section-title">👤 Thông tin tài khoản</div>
                <div className="user-card">
                    <p>🏷️ Họ tên: {user?.full_name}</p>
                    <p>🔑 Tài khoản: {user?.username}</p>
                    <p>🛡️ Vai trò: {user?.role}</p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
