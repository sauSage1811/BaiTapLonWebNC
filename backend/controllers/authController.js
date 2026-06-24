const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const JWT_SECRET = "coffee_secret_key";

function login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng nhập username và password"
        });
    }

    userModel.findUserByUsername(username, (err, user) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Tài khoản không tồn tại"
            });
        }

        if (user.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Tài khoản đã bị khóa"
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Mật khẩu không đúng"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            success: true,
            message: "Đăng nhập thành công",
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                username: user.username,
                role: user.role,
                status: user.status
            }
        });
    });
}

function me(req, res) {
    const userId = req.user.id;

    userModel.findUserById(userId, (err, user) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        res.json({
            success: true,
            data: user
        });
    });
}

function logout(req, res) {
    res.json({
        success: true,
        message: "Đăng xuất thành công"
    });
}

function register(req, res) {
    const { full_name, username, password, confirmPassword, role, adminInviteCode, security_question, security_answer } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!full_name || !username || !password || !confirmPassword || !security_question || !security_answer) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng điền đầy đủ thông tin bắt buộc"
        });
    }

    // Kiểm tra password và confirmPassword giống nhau
    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Mật khẩu không trùng khớp"
        });
    }

    // Kiểm tra username đã tồn tại chưa
    userModel.findUserByUsername(username, (err, existingUser) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Tên tài khoản đã tồn tại"
            });
        }

        // Xác thực mã mời Admin
        let userRole = role || 'staff';
        if (userRole === 'admin') {
            if (!adminInviteCode) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng nhập mã mời Admin"
                });
            }

            if (adminInviteCode !== "WEBNANGCAO") {
                return res.status(400).json({
                    success: false,
                    message: "Mã mời Admin không hợp lệ"
                });
            }
        }

        // Tạo user mới
        const userData = {
            full_name,
            username,
            password,
            role: userRole,
            status: 'active',
            security_question,
            security_answer
        };

        userModel.createUser(userData, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Đăng ký tài khoản thành công"
            });
        });
    });
}

function forgotPassword(req, res) {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng nhập tên tài khoản"
        });
    }

    userModel.findUserByUsername(username, (err, user) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Tài khoản không tồn tại"
            });
        }

        res.json({
            success: true,
            data: {
                security_question: user.security_question
            }
        });
    });
}

function resetPassword(req, res) {
    const { username, security_answer, newPassword, confirmPassword } = req.body;

    if (!username || !security_answer || !newPassword || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng điền đầy đủ thông tin"
        });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Mật khẩu mới không trùng khớp"
        });
    }

    userModel.findUserByUsername(username, (err, user) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Tài khoản không tồn tại"
            });
        }

        // Kiểm tra câu trả lời bảo mật (không phân biệt hoa thường)
        if (user.security_answer.toLowerCase() !== security_answer.toLowerCase()) {
            return res.status(400).json({
                success: false,
                message: "Câu trả lời bảo mật không chính xác"
            });
        }

        // Cập nhật mật khẩu mới
        userModel.updatePassword(username, newPassword, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                message: "Đặt lại mật khẩu thành công"
            });
        });
    });
}

module.exports = {
    login,
    me,
    logout,
    register,
    forgotPassword,
    resetPassword
};