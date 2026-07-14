import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerApi } from "../services/authService";

function Register() {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        full_name: "",
        username: "",
        password: "",
        confirmPassword: "",
        role: "staff",
        adminInviteCode: "",
        security_question: "",
        security_answer: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const securityQuestions = [
        "Tên quán cafe của bạn là gì?",
        "Thành phố bạn sống là gì?",
        "Sở thích yêu thích nhất của bạn là gì?",
        "Tên thú cưng của bạn là gì?",
        "Năm sinh của bạn là gì?"
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Kiểm tra các trường bắt buộc
        if (!formData.full_name || !formData.username || !formData.password || 
            !formData.confirmPassword || !formData.security_question || !formData.security_answer) {
            setError("Vui lòng điền đầy đủ thông tin bắt buộc");
            setLoading(false);
            return;
        }

        if (!/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password) || formData.password.length < 8) {
            setError("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái và chữ số");
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu không trùng khớp");
            setLoading(false);
            return;
        }

        try {
            const response = await registerApi({
                full_name: formData.full_name,
                username: formData.username,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                role: formData.role,
                adminInviteCode: formData.adminInviteCode,
                security_question: formData.security_question,
                security_answer: formData.security_answer
            });

            if (response.data.success) {
                alert("Đăng ký thành công! Vui lòng đăng nhập.");
                navigate("/login");
            } else {
                setError(response.data.message || "Đăng ký thất bại");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi khi đăng ký tài khoản");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-header">
                    <h1>☕ Đăng Ký Tài Khoản</h1>
                    <p>Coffee Management System</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="register-form">
                    {/* Họ và Tên */}
                    <div className="form-group">
                        <label htmlFor="full_name">Họ và Tên *</label>
                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="Nhập họ và tên"
                            required
                        />
                    </div>

                    {/* Username */}
                    <div className="form-group">
                        <label htmlFor="username">Tên Tài Khoản *</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Nhập tên tài khoản"
                            required
                        />
                    </div>

                    {/* Mật khẩu */}
                    <div className="form-group">
                        <label htmlFor="password">Mật Khẩu *</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Nhập mật khẩu (tối thiểu 8 ký tự, có chữ và số)"
                            required
                        />
                    </div>

                    {/* Xác nhận Mật khẩu */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Xác Nhận Mật Khẩu *</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Nhập lại mật khẩu"
                            required
                        />
                    </div>

                    {/* Vai trò */}
                    <div className="form-group">
                        <label htmlFor="role">Vai Trò *</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="staff">Nhân Viên (Staff)</option>
                            <option value="admin">Quản Trị Viên (Admin)</option>
                        </select>
                    </div>

                    {/* Mã mời Admin - chỉ hiển thị khi chọn admin */}
                    {formData.role === "admin" && (
                        <div className="form-group">
                            <label htmlFor="adminInviteCode">Mã Mời Admin *</label>
                            <input
                                type="password"
                                id="adminInviteCode"
                                name="adminInviteCode"
                                value={formData.adminInviteCode}
                                onChange={handleChange}
                                placeholder="Nhập mã mời Admin"
                                required
                            />
                            <small className="form-help">Bạn sẽ cần mã mời để tạo tài khoản Admin</small>
                        </div>
                    )}

                    {/* Câu hỏi bảo mật */}
                    <div className="form-group">
                        <label htmlFor="security_question">Câu Hỏi Bảo Mật *</label>
                        <select
                            id="security_question"
                            name="security_question"
                            value={formData.security_question}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Chọn câu hỏi bảo mật --</option>
                            {securityQuestions.map((question, index) => (
                                <option key={index} value={question}>{question}</option>
                            ))}
                        </select>
                    </div>

                    {/* Câu trả lời bảo mật */}
                    <div className="form-group">
                        <label htmlFor="security_answer">Câu Trả Lời Bảo Mật *</label>
                        <input
                            type="text"
                            id="security_answer"
                            name="security_answer"
                            value={formData.security_answer}
                            onChange={handleChange}
                            placeholder="Nhập câu trả lời bảo mật"
                            required
                        />
                        <small className="form-help">Câu trả lời này sẽ dùng để khôi phục mật khẩu</small>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? "Đang xử lý..." : "Đăng Ký"}
                    </button>
                </form>

                {/* Links */}
                <div className="register-links">
                    <p>Đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Register;
