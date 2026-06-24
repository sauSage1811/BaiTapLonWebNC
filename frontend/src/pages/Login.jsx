import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("123456");
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
            <div className="login-box">
                <div className="login-logo">
                    <div className="login-logo-icon">☕</div>
                    <h2>Coffee Management</h2>
                    <p className="login-subtitle">Hệ thống quản lý bán cafe</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tên đăng nhập</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nhập username"
                        />
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập password"
                        />
                    </div>

                    <button type="submit">Đăng nhập</button>
                </form>

                <div className="login-links">
                    <Link to="/forgot-password" className="link-forgot-password">
                        Quên mật khẩu?
                    </Link>
                    <span className="link-separator">|</span>
                    <Link to="/register" className="link-register">
                        Tạo tài khoản
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;