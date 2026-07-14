import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPasswordApi, resetPasswordApi } from "../services/authService";

function ForgotPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: nhập username, 2: nhập câu trả lời + mật khẩu mới
    const [username, setUsername] = useState("");
    const [securityQuestion, setSecurityQuestion] = useState("");
    const [formData, setFormData] = useState({
        security_answer: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Bước 1: Nhập username
    const handleSubmitStep1 = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!username.trim()) {
            setError("Vui lòng nhập tên tài khoản");
            setLoading(false);
            return;
        }

        try {
            const response = await forgotPasswordApi({ username });

            if (response.data.success) {
                setSecurityQuestion(response.data.data.security_question);
                setStep(2);
            } else {
                setError(response.data.message || "Tài khoản không tồn tại");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi khi kiểm tra tài khoản");
        } finally {
            setLoading(false);
        }
    };

    // Bước 2: Reset mật khẩu
    const handleSubmitStep2 = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!formData.security_answer.trim() || !formData.newPassword || !formData.confirmPassword) {
            setError("Vui lòng điền đầy đủ thông tin");
            setLoading(false);
            return;
        }

        if (!/[A-Za-z]/.test(formData.newPassword) || !/\d/.test(formData.newPassword) || formData.newPassword.length < 8) {
            setError("Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ cái và chữ số");
            setLoading(false);
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Mật khẩu mới không trùng khớp");
            setLoading(false);
            return;
        }

        try {
            const response = await resetPasswordApi({
                username,
                security_answer: formData.security_answer,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword
            });

            if (response.data.success) {
                alert("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
                navigate("/login");
            } else {
                setError(response.data.message || "Đặt lại mật khẩu thất bại");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi khi đặt lại mật khẩu");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError("");
    };

    const handleBackToStep1 = () => {
        setStep(1);
        setFormData({
            security_answer: "",
            newPassword: "",
            confirmPassword: ""
        });
        setError("");
    };

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-container">
                <div className="forgot-password-header">
                    <h1>☕ Khôi Phục Mật Khẩu</h1>
                    <p>Coffee Management System</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                {step === 1 ? (
                    // Bước 1: Nhập username
                    <form onSubmit={handleSubmitStep1} className="forgot-password-form">
                        <p className="step-label">Bước 1: Xác Minh Tài Khoản</p>

                        <div className="form-group">
                            <label htmlFor="username">Tên Tài Khoản *</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setError("");
                                }}
                                placeholder="Nhập tên tài khoản"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : "Tiếp Tục"}
                        </button>
                    </form>
                ) : (
                    // Bước 2: Reset mật khẩu
                    <form onSubmit={handleSubmitStep2} className="forgot-password-form">
                        <p className="step-label">Bước 2: Đặt Lại Mật Khẩu</p>

                        <div className="form-group">
                            <label>Câu Hỏi Bảo Mật</label>
                            <div className="security-question-display">
                                {securityQuestion}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="security_answer">Câu Trả Lời Bảo Mật *</label>
                            <input
                                type="text"
                                id="security_answer"
                                name="security_answer"
                                value={formData.security_answer}
                                onChange={handleInputChange}
                                placeholder="Nhập câu trả lời bảo mật"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">Mật Khẩu Mới *</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự, có chữ và số)"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Xác Nhận Mật Khẩu Mới *</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Nhập lại mật khẩu mới"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
                        </button>

                        <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={handleBackToStep1}
                        >
                            Quay Lại
                        </button>
                    </form>
                )}

                {/* Links */}
                <div className="forgot-password-links">
                    <p>
                        <Link to="/login">← Quay lại Đăng Nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
