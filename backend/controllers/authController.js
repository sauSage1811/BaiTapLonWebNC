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

module.exports = {
    login,
    me,
    logout
};