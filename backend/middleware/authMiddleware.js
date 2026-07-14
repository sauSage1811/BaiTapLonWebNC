const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET;

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập"
        });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            success: false,
            message: "Token không hợp lệ"
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await userModel.findUserById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Tài khoản không còn tồn tại"
            });
        }

        if (user.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Tài khoản đã bị khóa"
            });
        }

        req.user = {
            id: user.id,
            username: user.username,
            role: user.role
        };
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.name === "TokenExpiredError" ? "Token đã hết hạn" : "Token không hợp lệ"
        });
    }
}

module.exports = authMiddleware;