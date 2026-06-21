function roleMiddleware(...roles) {
    return function (req, res, next) {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Bạn chưa đăng nhập"
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền truy cập"
            });
        }

        next();
    };
}

module.exports = roleMiddleware;