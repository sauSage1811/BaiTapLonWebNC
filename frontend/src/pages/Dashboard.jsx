import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

function Dashboard() {
    const { user } = useAuth();

    const today = new Date().toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="dashboard-page">
            <div className="dashboard-welcome animate-in">
                <h1>👋 Xin chào, {user?.full_name || "Admin"}!</h1>
                <p>Chào mừng bạn quay lại hệ thống quản lý Coffee Management.</p>
                <div className="welcome-date">📅 {today}</div>
            </div>

            <div className="dashboard-stats">
                <div className="stat-card animate-in">
                    <div className="stat-card-header">
                        <div className="stat-card-icon">☕</div>
                    </div>
                    <div className="stat-card-value">24</div>
                    <div className="stat-card-label">Tổng sản phẩm</div>
                </div>

                <div className="stat-card animate-in">
                    <div className="stat-card-header">
                        <div className="stat-card-icon">📋</div>
                    </div>
                    <div className="stat-card-value">6</div>
                    <div className="stat-card-label">Tổng danh mục</div>
                </div>

                <div className="stat-card animate-in">
                    <div className="stat-card-header">
                        <div className="stat-card-icon">🪑</div>
                    </div>
                    <div className="stat-card-value">12</div>
                    <div className="stat-card-label">Tổng số bàn</div>
                </div>

                <div className="stat-card animate-in">
                    <div className="stat-card-header">
                        <div className="stat-card-icon">✅</div>
                    </div>
                    <div className="stat-card-value">Online</div>
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
                                <div className="quick-action-text">Quản lý sản phẩm</div>
                                <div className="quick-action-desc">Xem và cập nhật sản phẩm</div>
                            </div>
                        </Link>
                        <Link to="/tables" className="quick-action-card">
                            <div className="quick-action-icon">🪑</div>
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
