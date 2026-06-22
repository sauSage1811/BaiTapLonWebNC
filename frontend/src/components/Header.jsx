import { useAuth } from "../hooks/useAuth";

function Header() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        window.location.href = "/login";
    };

    return (
        <header className="header">
            <div>
                <h2>Quản lý bán cafe</h2>
            </div>

            <div className="header-user">
                <span>{user?.full_name}</span>
                <span className="role">{user?.role}</span>
                <button onClick={handleLogout}>Đăng xuất</button>
            </div>
        </header>
    );
}

export default Header;