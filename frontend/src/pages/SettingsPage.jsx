import { useEffect, useMemo, useState } from "react";
import { changePasswordApi, getMeApi, updateMeApi } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";

const emptyStoreForm = {
    store_name: "",
    phone: "",
    address: "",
    contact_email: "",
    opening_time: "",
    closing_time: ""
};

const emptyPasswordForm = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
};

function getInitials(name) {
    if (!name) return "U";
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

function SettingsPage() {
    const { user, setCurrentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [storeSaving, setStoreSaving] = useState(false);
    const [profileForm, setProfileForm] = useState({ full_name: "", username: "", role: "" });
    const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
    const [storeForm, setStoreForm] = useState(emptyStoreForm);
    const [profileErrors, setProfileErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});
    const [storeErrors, setStoreErrors] = useState({});
    const [notice, setNotice] = useState(null);
    const [theme, setTheme] = useState(() => localStorage.getItem("themeMode") || "light");

    const isAdmin = user?.role === "admin";

    const roleLabel = useMemo(() => {
        if (profileForm.role === "admin") return "Admin";
        if (profileForm.role === "staff") return "Staff";
        return profileForm.role || "";
    }, [profileForm.role]);

    useEffect(() => {
        let ignore = false;

        async function loadSettings() {
            setLoading(true);
            setNotice(null);

            try {
                const [meRes, storeRes] = await Promise.all([
                    getMeApi(),
                    api.get("/store-settings")
                ]);

                if (ignore) return;

                const nextUser = meRes.data?.data || null;
                const nextStore = storeRes.data?.data || emptyStoreForm;

                if (nextUser) {
                    setCurrentUser(nextUser);
                    setProfileForm({
                        full_name: nextUser.full_name || "",
                        username: nextUser.username || "",
                        role: nextUser.role || ""
                    });
                }

                setStoreForm({
                    store_name: nextStore.store_name || "",
                    phone: nextStore.phone || "",
                    address: nextStore.address || "",
                    contact_email: nextStore.contact_email || "",
                    opening_time: nextStore.opening_time || "",
                    closing_time: nextStore.closing_time || ""
                });
            } catch (error) {
                if (!ignore) {
                    setNotice({
                        type: "error",
                        message: error.response?.data?.message || "Không tải được dữ liệu cài đặt"
                    });
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        loadSettings();

        return () => {
            ignore = true;
        };
    }, [setCurrentUser]);

    useEffect(() => {
        localStorage.setItem("themeMode", theme);
        document.body.classList.toggle("dark-theme", theme === "dark");
    }, [theme]);

    const showNotice = (type, message) => {
        setNotice({ type, message });
    };

    const updateProfileField = (field, value) => {
        setProfileForm((prev) => ({ ...prev, [field]: value }));
        setProfileErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const updatePasswordField = (field, value) => {
        setPasswordForm((prev) => ({ ...prev, [field]: value }));
        setPasswordErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const updateStoreField = (field, value) => {
        setStoreForm((prev) => ({ ...prev, [field]: value }));
        setStoreErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const validateProfile = () => {
        const errors = {};

        if (!profileForm.full_name.trim()) {
            errors.full_name = "Họ và tên không được để trống";
        }

        if (!profileForm.username.trim()) {
            errors.username = "Tên đăng nhập hoặc email không được để trống";
        }

        return errors;
    };

    const validatePassword = () => {
        const errors = {};

        if (!passwordForm.currentPassword) {
            errors.currentPassword = "Mật khẩu hiện tại không được để trống";
        }

        if (!passwordForm.newPassword) {
            errors.newPassword = "Mật khẩu mới không được để trống";
        } else if (passwordForm.newPassword.length < 6) {
            errors.newPassword = "Mật khẩu mới tối thiểu 6 ký tự";
        }

        if (!passwordForm.confirmPassword) {
            errors.confirmPassword = "Xác nhận mật khẩu mới không được để trống";
        } else if (passwordForm.confirmPassword !== passwordForm.newPassword) {
            errors.confirmPassword = "Xác nhận mật khẩu phải trùng với mật khẩu mới";
        }

        return errors;
    };

    const validateStore = () => {
        const errors = {};
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!storeForm.store_name.trim()) {
            errors.store_name = "Tên cửa hàng không được để trống";
        }

        if (storeForm.contact_email.trim() && !emailPattern.test(storeForm.contact_email.trim())) {
            errors.contact_email = "Email liên hệ không hợp lệ";
        }

        return errors;
    };

    const handleProfileSubmit = async (event) => {
        event.preventDefault();
        const errors = validateProfile();

        if (Object.keys(errors).length > 0) {
            setProfileErrors(errors);
            return;
        }

        setProfileSaving(true);
        setProfileErrors({});

        try {
            const res = await updateMeApi({
                full_name: profileForm.full_name.trim(),
                username: profileForm.username.trim()
            });
            const nextUser = res.data?.data;

            if (nextUser) {
                setCurrentUser(nextUser);
                setProfileForm({
                    full_name: nextUser.full_name || "",
                    username: nextUser.username || "",
                    role: nextUser.role || ""
                });
            }

            showNotice("success", res.data?.message || "Cập nhật thông tin cá nhân thành công");
        } catch (error) {
            setProfileErrors(error.response?.data?.errors || {});
            showNotice("error", error.response?.data?.message || "Không cập nhật được thông tin cá nhân");
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
        const errors = validatePassword();

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }

        setPasswordSaving(true);
        setPasswordErrors({});

        try {
            const res = await changePasswordApi(passwordForm);
            setPasswordForm(emptyPasswordForm);
            showNotice("success", res.data?.message || "Đổi mật khẩu thành công");
        } catch (error) {
            setPasswordErrors(error.response?.data?.errors || {});
            showNotice("error", error.response?.data?.message || "Không đổi được mật khẩu");
        } finally {
            setPasswordSaving(false);
        }
    };

    const handleStoreSubmit = async (event) => {
        event.preventDefault();

        if (!isAdmin) {
            return;
        }

        const errors = validateStore();

        if (Object.keys(errors).length > 0) {
            setStoreErrors(errors);
            return;
        }

        setStoreSaving(true);
        setStoreErrors({});

        try {
            const payload = Object.fromEntries(
                Object.entries(storeForm).map(([key, value]) => [key, value.trim()])
            );
            const res = await api.put("/store-settings", payload);
            const nextStore = res.data?.data || payload;

            setStoreForm({
                store_name: nextStore.store_name || "",
                phone: nextStore.phone || "",
                address: nextStore.address || "",
                contact_email: nextStore.contact_email || "",
                opening_time: nextStore.opening_time || "",
                closing_time: nextStore.closing_time || ""
            });
            showNotice("success", res.data?.message || "Cập nhật thông tin cửa hàng thành công");
        } catch (error) {
            setStoreErrors(error.response?.data?.errors || {});
            showNotice("error", error.response?.data?.message || "Không cập nhật được thông tin cửa hàng");
        } finally {
            setStoreSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="settings-page">
                <div className="page-header">
                    <div className="page-header-text">
                        <h1>Cài đặt</h1>
                        <p>Đang tải thông tin tài khoản và cấu hình hệ thống.</p>
                    </div>
                </div>
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-text">Đang tải dữ liệu cài đặt...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="settings-page">
            <div className="page-header">
                <div className="page-header-text">
                    <h1>Cài đặt</h1>
                    <p>Quản lý thông tin tài khoản, bảo mật và tuỳ chọn hiển thị.</p>
                </div>
            </div>

            {notice && (
                <div className={`alert alert-${notice.type}`} role="alert">
                    {notice.message}
                </div>
            )}

            <div className="settings-grid">
                <section className="card settings-card animate-in">
                    <div className="card-header">
                        <h2>Thông tin cá nhân</h2>
                    </div>
                    <form className="settings-form" onSubmit={handleProfileSubmit}>
                        <div className="settings-profile-summary">
                            <div className="settings-avatar">{getInitials(profileForm.full_name)}</div>
                            <div>
                                <strong>{profileForm.full_name || "Người dùng"}</strong>
                                <span>{profileForm.username}</span>
                            </div>
                        </div>

                        <div className="form-grid two-cols">
                            <div className="form-group">
                                <label htmlFor="settings-full-name">Họ và tên</label>
                                <input
                                    id="settings-full-name"
                                    value={profileForm.full_name}
                                    onChange={(event) => updateProfileField("full_name", event.target.value)}
                                    disabled={profileSaving}
                                />
                                {profileErrors.full_name && <div className="field-error">{profileErrors.full_name}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="settings-username">Tên đăng nhập hoặc email</label>
                                <input
                                    id="settings-username"
                                    value={profileForm.username}
                                    onChange={(event) => updateProfileField("username", event.target.value)}
                                    disabled={profileSaving}
                                />
                                {profileErrors.username && <div className="field-error">{profileErrors.username}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="settings-role">Vai trò hiện tại</label>
                                <input id="settings-role" value={roleLabel} disabled readOnly />
                            </div>
                        </div>

                        <div className="settings-actions">
                            <button type="submit" className="btn btn-primary" disabled={profileSaving}>
                                {profileSaving ? "Đang lưu..." : "Lưu thông tin"}
                            </button>
                        </div>
                    </form>
                </section>

                <section className="card settings-card animate-in">
                    <div className="card-header">
                        <h2>Đổi mật khẩu</h2>
                    </div>
                    <form className="settings-form" onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                            <label htmlFor="settings-current-password">Mật khẩu hiện tại</label>
                            <input
                                id="settings-current-password"
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(event) => updatePasswordField("currentPassword", event.target.value)}
                                disabled={passwordSaving}
                            />
                            {passwordErrors.currentPassword && <div className="field-error">{passwordErrors.currentPassword}</div>}
                        </div>

                        <div className="form-grid two-cols">
                            <div className="form-group">
                                <label htmlFor="settings-new-password">Mật khẩu mới</label>
                                <input
                                    id="settings-new-password"
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(event) => updatePasswordField("newPassword", event.target.value)}
                                    disabled={passwordSaving}
                                />
                                {passwordErrors.newPassword && <div className="field-error">{passwordErrors.newPassword}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="settings-confirm-password">Xác nhận mật khẩu mới</label>
                                <input
                                    id="settings-confirm-password"
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(event) => updatePasswordField("confirmPassword", event.target.value)}
                                    disabled={passwordSaving}
                                />
                                {passwordErrors.confirmPassword && <div className="field-error">{passwordErrors.confirmPassword}</div>}
                            </div>
                        </div>

                        <div className="settings-actions">
                            <button type="submit" className="btn btn-primary" disabled={passwordSaving}>
                                {passwordSaving ? "Đang đổi..." : "Đổi mật khẩu"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>

            <section className="card settings-card animate-in">
                <div className="card-header">
                    <h2>Thông tin cửa hàng</h2>
                    {!isAdmin && <span className="settings-readonly-badge">Chỉ xem</span>}
                </div>
                <form className="settings-form" onSubmit={handleStoreSubmit}>
                    <div className="form-grid two-cols">
                        <div className="form-group">
                            <label htmlFor="settings-store-name">Tên cửa hàng</label>
                            <input
                                id="settings-store-name"
                                value={storeForm.store_name}
                                onChange={(event) => updateStoreField("store_name", event.target.value)}
                                disabled={!isAdmin || storeSaving}
                            />
                            {storeErrors.store_name && <div className="field-error">{storeErrors.store_name}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="settings-store-phone">Số điện thoại</label>
                            <input
                                id="settings-store-phone"
                                value={storeForm.phone}
                                onChange={(event) => updateStoreField("phone", event.target.value)}
                                disabled={!isAdmin || storeSaving}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="settings-store-email">Email liên hệ</label>
                            <input
                                id="settings-store-email"
                                value={storeForm.contact_email}
                                onChange={(event) => updateStoreField("contact_email", event.target.value)}
                                disabled={!isAdmin || storeSaving}
                            />
                            {storeErrors.contact_email && <div className="field-error">{storeErrors.contact_email}</div>}
                        </div>

                        <div className="settings-time-row">
                            <div className="form-group">
                                <label htmlFor="settings-opening-time">Giờ mở cửa</label>
                                <input
                                    id="settings-opening-time"
                                    type="time"
                                    value={storeForm.opening_time}
                                    onChange={(event) => updateStoreField("opening_time", event.target.value)}
                                    disabled={!isAdmin || storeSaving}
                                />
                                {storeErrors.opening_time && <div className="field-error">{storeErrors.opening_time}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="settings-closing-time">Giờ đóng cửa</label>
                                <input
                                    id="settings-closing-time"
                                    type="time"
                                    value={storeForm.closing_time}
                                    onChange={(event) => updateStoreField("closing_time", event.target.value)}
                                    disabled={!isAdmin || storeSaving}
                                />
                                {storeErrors.closing_time && <div className="field-error">{storeErrors.closing_time}</div>}
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="settings-store-address">Địa chỉ</label>
                        <input
                            id="settings-store-address"
                            value={storeForm.address}
                            onChange={(event) => updateStoreField("address", event.target.value)}
                            disabled={!isAdmin || storeSaving}
                        />
                    </div>

                    {isAdmin && (
                        <div className="settings-actions">
                            <button type="submit" className="btn btn-primary" disabled={storeSaving}>
                                {storeSaving ? "Đang lưu..." : "Lưu thông tin cửa hàng"}
                            </button>
                        </div>
                    )}
                </form>
            </section>

            <section className="card settings-card animate-in">
                <div className="card-header">
                    <h2>Tuỳ chọn giao diện</h2>
                </div>
                <div className="settings-form">
                    <div className="settings-option-row">
                        <div>
                            <strong>Chế độ hiển thị</strong>
                            <span>Lưu trên trình duyệt hiện tại.</span>
                        </div>
                        <div className="settings-segmented" role="group" aria-label="Chế độ hiển thị">
                            <button
                                type="button"
                                className={theme === "light" ? "active" : ""}
                                onClick={() => setTheme("light")}
                            >
                                Sáng
                            </button>
                            <button
                                type="button"
                                className={theme === "dark" ? "active" : ""}
                                onClick={() => setTheme("dark")}
                            >
                                Tối
                            </button>
                        </div>
                    </div>

                    <div className="settings-option-row">
                        <div>
                            <strong>Ngôn ngữ</strong>
                            <span>Project hiện dùng tiếng Việt.</span>
                        </div>
                        <select value="vi" disabled aria-label="Ngôn ngữ">
                            <option value="vi">Tiếng Việt</option>
                        </select>
                    </div>

                </div>
            </section>
        </div>
    );
}

export default SettingsPage;
