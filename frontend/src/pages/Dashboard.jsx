import { useAuth } from "../hooks/useAuth";

function Dashboard() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        window.location.href = "/login";
    };

    return (
        <div className="dashboard-page">
            <h1>Dashboard</h1>

            <div className="user-card">
                <p>Xin chào: {user?.full_name}</p>
                <p>Tài khoản: {user?.username}</p>
                <p>Vai trò: {user?.role}</p>
            </div>

            <button onClick={handleLogout}>Đăng xuất</button>
        </div>
    );
}

export default Dashboard;