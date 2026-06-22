import { useAuth } from "../hooks/useAuth";

function Header() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        window.location.href = "/login";
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.charAt(0).toUpperCase();
    };

    return (
        <header className="header">
            <div className="header-left">
                <h2>Coffee Management</h2>
            </div>

            <div className="header-user">
                <div className="header-user-info">
                    <div className="header-user-avatar">
                        {getInitials(user?.full_name)}
                    </div>
                    <span className="header-user-name">{user?.full_name}</span>
                    <span className="role">{user?.role}</span>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                    🚪 Đăng xuất
                </button>
            </div>
        </header>
    );
}

export default Header;