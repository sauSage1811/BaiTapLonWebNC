const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
const ADMIN_INVITE_CODE = process.env.ADMIN_INVITE_CODE || "WEBNANGCAO";

function normalizeUsername(value) {
    return typeof value === "string" ? value.trim() : "";
}

function normalizeSecurityAnswer(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isLegacyPasswordMatch(candidatePassword, storedPassword) {
    const candidate = Buffer.from(String(candidatePassword));
    const stored = Buffer.from(String(storedPassword));

    if (candidate.length !== stored.length) {
        return false;
    }

    return crypto.timingSafeEqual(candidate, stored);
}

function sanitizeUser(user) {
    if (!user) {
        return null;
    }

    return {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        role: user.role,
        status: user.status
    };
}

function validatePassword(password) {
    return typeof password === "string"
        && password.length >= 8
        && /[A-Za-z]/.test(password)
        && /\d/.test(password);
}

function isBcryptHash(value) {
    return typeof value === "string" && /^\$2[aby]\$/.test(value);
}

async function verifyPassword(candidatePassword, storedPassword) {
    if (!candidatePassword || !storedPassword) {
        return false;
    }

    if (isBcryptHash(storedPassword)) {
        return bcrypt.compare(candidatePassword, storedPassword);
    }

    return isLegacyPasswordMatch(candidatePassword, storedPassword);
}

async function verifySecurityAnswer(candidateAnswer, storedAnswer) {
    if (!candidateAnswer || !storedAnswer) {
        return false;
    }

    if (isBcryptHash(storedAnswer)) {
        return bcrypt.compare(candidateAnswer, storedAnswer);
    }

    return isLegacyPasswordMatch(candidateAnswer, storedAnswer);
}

async function login(req, res) {
    const { username, password } = req.body;
    const normalizedUsername = normalizeUsername(username);

    if (!normalizedUsername || !password) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng nhập đầy đủ thông tin đăng nhập"
        });
    }

    try {
        const user = await userModel.findUserByUsername(normalizedUsername);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Thông tin đăng nhập không chính xác"
            });
        }

        if (user.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Tài khoản đã bị khóa"
            });
        }

        const passwordValid = await verifyPassword(String(password), user.password);

        if (!passwordValid) {
            return res.status(401).json({
                success: false,
                message: "Thông tin đăng nhập không chính xác"
            });
        }

        if (!isBcryptHash(user.password)) {
            const hashedPassword = await bcrypt.hash(String(password), SALT_ROUNDS);
            await userModel.updatePassword(normalizedUsername, hashedPassword);
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: JWT_EXPIRES_IN
            }
        );

        res.json({
            success: true,
            message: "Đăng nhập thành công",
            token,
            user: sanitizeUser(user)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Không thể xử lý đăng nhập lúc này"
        });
    }
}

async function me(req, res) {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập"
        });
    }

    try {
        const user = await userModel.findUserById(userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Tài khoản không còn tồn tại"
            });
        }

        res.json({
            success: true,
            data: sanitizeUser(user)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Không thể tải thông tin người dùng"
        });
    }
}

function logout(req, res) {
    res.json({
        success: true,
        message: "Đăng xuất thành công"
    });
}

async function register(req, res) {
    const { full_name, username, password, confirmPassword, role, adminInviteCode, security_question, security_answer } = req.body;
    const normalizedUsername = normalizeUsername(username);
    const normalizedFullName = typeof full_name === "string" ? full_name.trim() : "";
    const normalizedSecurityQuestion = typeof security_question === "string" ? security_question.trim() : "";
    const normalizedSecurityAnswer = normalizeSecurityAnswer(security_answer);

    if (!normalizedFullName || !normalizedUsername || !password || !confirmPassword || !normalizedSecurityQuestion || !normalizedSecurityAnswer) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng điền đầy đủ thông tin bắt buộc"
        });
    }

    if (!validatePassword(String(password))) {
        return res.status(400).json({
            success: false,
            message: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái và chữ số"
        });
    }

    if (String(password) !== String(confirmPassword)) {
        return res.status(400).json({
            success: false,
            message: "Mật khẩu không trùng khớp"
        });
    }

    const requestedRole = typeof role === "string" ? role.trim().toLowerCase() : "staff";
    if (requestedRole !== "staff" && requestedRole !== "admin") {
        return res.status(400).json({
            success: false,
            message: "Vai trò không hợp lệ"
        });
    }

    try {
        const existingUser = await userModel.findUserByUsername(normalizedUsername);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Tên tài khoản đã tồn tại"
            });
        }

        let userRole = "staff";
        if (requestedRole === "admin") {
            if (!ADMIN_INVITE_CODE || String(adminInviteCode) !== String(ADMIN_INVITE_CODE)) {
                return res.status(400).json({
                    success: false,
                    message: "Mã mời Admin không hợp lệ"
                });
            }

            userRole = "admin";
        }

        const hashedPassword = await bcrypt.hash(String(password), SALT_ROUNDS);
        const hashedSecurityAnswer = await bcrypt.hash(normalizedSecurityAnswer, SALT_ROUNDS);

        await userModel.createUser({
            full_name: normalizedFullName,
            username: normalizedUsername,
            password: hashedPassword,
            role: userRole,
            status: "active",
            security_question: normalizedSecurityQuestion,
            security_answer: hashedSecurityAnswer
        });

        res.status(201).json({
            success: true,
            message: "Đăng ký tài khoản thành công"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Không thể tạo tài khoản lúc này"
        });
    }
}

async function forgotPassword(req, res) {
    const normalizedUsername = normalizeUsername(req.body.username);

    if (!normalizedUsername) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng nhập tên tài khoản"
        });
    }

    try {
        const user = await userModel.findUserByUsername(normalizedUsername);

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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Không thể xử lý yêu cầu lúc này"
        });
    }
}

async function resetPassword(req, res) {
    const { username, security_answer, newPassword, confirmPassword } = req.body;
    const normalizedUsername = normalizeUsername(username);
    const normalizedSecurityAnswer = normalizeSecurityAnswer(security_answer);

    if (!normalizedUsername || !normalizedSecurityAnswer || !newPassword || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng điền đầy đủ thông tin"
        });
    }

    if (!validatePassword(String(newPassword))) {
        return res.status(400).json({
            success: false,
            message: "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ cái và chữ số"
        });
    }

    if (String(newPassword) !== String(confirmPassword)) {
        return res.status(400).json({
            success: false,
            message: "Mật khẩu mới không trùng khớp"
        });
    }

    try {
        const user = await userModel.findUserByUsername(normalizedUsername);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Tài khoản không tồn tại"
            });
        }

        const answerValid = await verifySecurityAnswer(normalizedSecurityAnswer, user.security_answer);

        if (!answerValid) {
            return res.status(400).json({
                success: false,
                message: "Câu trả lời bảo mật không chính xác"
            });
        }

        const hashedPassword = await bcrypt.hash(String(newPassword), SALT_ROUNDS);
        await userModel.updatePassword(normalizedUsername, hashedPassword);

        if (!isBcryptHash(user.security_answer)) {
            const hashedSecurityAnswer = await bcrypt.hash(normalizedSecurityAnswer, SALT_ROUNDS);
            await userModel.updateSecurityAnswer(normalizedUsername, hashedSecurityAnswer);
        }

        res.json({
            success: true,
            message: "Đặt lại mật khẩu thành công"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Không thể đặt lại mật khẩu lúc này"
        });
    }
}

module.exports = {
    login,
    me,
    logout,
    register,
    forgotPassword,
    resetPassword
};