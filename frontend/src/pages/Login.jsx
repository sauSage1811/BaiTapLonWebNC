import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logoImg from "../assets/logo.png";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await login(username, password);
            navigate("/dashboard");
        } catch (err) {
            setError(
                err.response?.data?.message || "Đăng nhập thất bại"
            );
        }
    };

    return (
        <div className="login-page">
            {/* ===== LEFT PANEL ===== */}
            <div className="login-left">
                {/* Decorative bokeh circles */}
                <div className="login-bokeh login-bokeh-1"></div>
                <div className="login-bokeh login-bokeh-2"></div>
                <div className="login-bokeh login-bokeh-3"></div>

                <div className="login-left-content">
                    {/* Brand */}
                    <div className="login-brand">
                        <img src={logoImg} alt="Coffee Management Logo" className="login-brand-logo" />
                        <div className="login-brand-text">
                            <span className="login-brand-name">Coffee Management</span>
                            <span className="login-brand-sub">System</span>
                        </div>
                    </div>

                    {/* Welcome text */}
                    <div className="login-welcome">
                        <h1 className="login-welcome-title">
                            Chào mừng đến với<br />
                            hệ thống quản lý cafe
                        </h1>
                        <p className="login-welcome-desc">
                            Quản lý menu, bàn, đơn hàng và doanh thu
                            một cách hiệu quả – nhanh chóng – chính xác.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="login-stats">
                        <div className="login-stat">
                            <div className="login-stat-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" x2="6" y1="2" y2="4" /><line x1="10" x2="10" y1="2" y2="4" /><line x1="14" x2="14" y1="2" y2="4" />
                                </svg>
                            </div>
                            <span className="login-stat-value">80+</span>
                            <span className="login-stat-label">Món uống</span>
                        </div>
                        <div className="login-stat">
                            <div className="login-stat-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" />
                                </svg>
                            </div>
                            <span className="login-stat-value">&lt;1s</span>
                            <span className="login-stat-label">Xử lý nhanh</span>
                        </div>
                        <div className="login-stat">
                            <div className="login-stat-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" />
                                </svg>
                            </div>
                            <span className="login-stat-value">99%</span>
                            <span className="login-stat-label">Độ chính xác</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="login-left-footer">
                    © 2026 Coffee Management System. All rights reserved.
                </div>
            </div>

            {/* ===== RIGHT PANEL ===== */}
            <div className="login-right">
                <div className="login-right-content">
                    <div className="login-form-header">
                        <h2>Đăng nhập <span className="login-header-icon"></span></h2>
                        <p>Đăng nhập để tiếp tục sử dụng hệ thống</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Tên đăng nhập / Email</label>
                            <div className="input-wrapper">
                                <span className="input-icon input-icon-left">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Nhập tên đăng nhập"
                                    className="input-with-icon"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <div className="input-wrapper">
                                <span className="input-icon input-icon-left">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu"
                                    className="input-with-icon input-with-toggle"
                                />
                                <button
                                    type="button"
                                    className="input-icon input-icon-right password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" x2="23" y1="1" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <label className="login-remember">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span className="remember-checkmark"></span>
                            <span>Ghi nhớ đăng nhập</span>
                        </label>

                        <button type="submit" className="btn-login-submit">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" />
                            </svg>
                            Đăng nhập
                        </button>
                    </form>

                    <div className="login-divider">
                        <span>Hoặc</span>
                    </div>

                    <div className="login-links">
                        <Link to="/forgot-password" className="link-forgot-password">
                            Quên mật khẩu?
                        </Link>
                        <span className="link-separator">|</span>
                        <Link to="/register" className="link-register">
                            Tạo tài khoản
                        </Link>
                    </div>

                    <div className="login-security-note">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                        </svg>
                        <span>Bảo mật thông tin của bạn luôn được đảm bảo</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;