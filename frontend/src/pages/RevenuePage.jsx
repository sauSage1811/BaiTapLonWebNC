import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function RevenuePage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // State bộ lọc
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [activePreset, setActivePreset] = useState("all"); // "today", "yesterday", "last7", "thisMonth", "all"

    async function fetchRevenueData() {
        try {
            setLoading(true);
            const res = await api.get("/orders/history");
            const rawOrders = res.data.data;
            
            // Chỉ lấy các đơn đã thanh toán
            const paidOrders = rawOrders.filter(order => {
                const status = (order.status || "").toLowerCase();
                return status === "paid";
            });

            setOrders(paidOrders);
        } catch (err) {
            console.error("Lỗi tải dữ liệu doanh thu:", err);
            alert("Không thể tải dữ liệu doanh thu!");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        Promise.resolve().then(fetchRevenueData);
    }, []);

    // Hàm chuyển đổi Date thành định dạng YYYY-MM-DD theo giờ địa phương (local timezone)
    const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // --- CÁC NÚT BỘ LỌC NHANH ---
    const handleQuickFilter = (type) => {
        setActivePreset(type);
        const now = new Date();

        if (type === "today") {
            const todayStr = formatLocalDate(now);
            setStartDate(todayStr);
            setEndDate(todayStr);
        } else if (type === "yesterday") {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const yestStr = formatLocalDate(yesterday);
            setStartDate(yestStr);
            setEndDate(yestStr);
        } else if (type === "last7") {
            const past7 = new Date(now);
            past7.setDate(now.getDate() - 6);
            setStartDate(formatLocalDate(past7));
            setEndDate(formatLocalDate(now));
        } else if (type === "thisMonth") {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            setStartDate(formatLocalDate(firstDay));
            setEndDate(formatLocalDate(now));
        } else if (type === "all") {
            setStartDate("");
            setEndDate("");
        }
    };

    // --- LOGIC LỌC ĐƠN HÀNG CHUẨN ---
    const filteredOrders = orders.filter(order => {
        if (!order.created_at) return true;

        const orderTime = new Date(order.created_at).getTime();

        // Kiểm tra Ngày bắt đầu (Tính từ 00:00:00)
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (orderTime < start.getTime()) return false;
        }

        // Kiểm tra Ngày kết thúc (Tính đến 23:59:59.999)
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (orderTime > end.getTime()) return false;
        }

        // Lọc theo từ khóa (Mã đơn hoặc Tên bàn)
        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            const orderIdMatch = String(order.id).toLowerCase().includes(term);
            const tableNameStr = String(order.table_name || order.table_id || "").toLowerCase();
            const tableNameMatch = tableNameStr.includes(term);

            if (!orderIdMatch && !tableNameMatch) return false;
        }

        return true;
    });

    // Tính tổng doanh thu từ danh sách đã lọc
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

    if (loading) {
        return <div style={{ padding: "40px", textAlign: "center", fontSize: "16px" }}>⏳ Đang tải dữ liệu doanh thu...</div>;
    }

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
            
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                    <h2 style={{ margin: "0 0 5px 0", color: "#4A3B32" }}>Quản Lý Doanh Thu</h2>
                    <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>Thống kê tổng quan các đơn hàng đã thanh toán thành công.</p>
                </div>
                <button 
                    onClick={() => navigate("/tables")}
                    style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontWeight: "bold" }}
                >
                    ← Sơ đồ bàn
                </button>
            </div>

            {/* THANH BỘ LỌC CẢI TIẾN */}
            <div style={{ background: "#fff", padding: "18px 20px", borderRadius: "12px", border: "1px solid #eee", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
                
                {/* Hàng 1: Nút lọc nhanh + Ô tìm kiếm */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    
                    {/* Các nút chọn khoảng thời gian nhanh */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {[
                            { id: "all", label: "Tất cả" },
                            { id: "today", label: "Hôm nay" },
                            { id: "yesterday", label: "Hôm qua" },
                            { id: "last7", label: "7 ngày qua" },
                            { id: "thisMonth", label: "Tháng này" }
                        ].map(preset => (
                            <button
                                key={preset.id}
                                onClick={() => handleQuickFilter(preset.id)}
                                style={{
                                    padding: "6px 14px",
                                    borderRadius: "20px",
                                    border: "none",
                                    fontSize: "13px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    backgroundColor: activePreset === preset.id ? "#8B5A2B" : "#e9ecef",
                                    color: activePreset === preset.id ? "#fff" : "#495057",
                                    transition: "all 0.2s"
                                }}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {/* Ô tìm kiếm đơn hàng/bàn */}
                    <div>
                        <input 
                            type="text"
                            placeholder=" Tìm mã đơn, tên bàn..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: "7px 12px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px", width: "200px" }}
                        />
                    </div>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid #f1f1f1", margin: 0 }} />

                {/* Hàng 2: Chọn từ ngày - đến ngày tùy chỉnh */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", alignItems: "center" }}>
                    <div style={{ fontWeight: "bold", color: "#4A3B32", fontSize: "13px" }}>Tùy chỉnh ngày:</div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "13px", color: "#666" }}>Từ:</span>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setActivePreset("custom");
                            }}
                            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
                        />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "13px", color: "#666" }}>Đến:</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setActivePreset("custom");
                            }}
                            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
                        />
                    </div>

                    {(startDate || endDate || searchTerm) && (
                        <button 
                            onClick={() => {
                                setStartDate("");
                                setEndDate("");
                                setSearchTerm("");
                                setActivePreset("all");
                            }}
                            style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #ff4d4f", background: "#fff", color: "#ff4d4f", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                        >
                            Reset bộ lọc
                        </button>
                    )}
                </div>
            </div>

            {/* Thẻ thống kê tổng quan */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eee", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                    <div style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>Tổng doanh thu</div>
                    <div style={{ fontSize: "28px", fontWeight: "bold", color: "#28a745" }}>
                        {totalRevenue.toLocaleString('vi-VN')} đ
                    </div>
                </div>
                <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eee", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                    <div style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>Tổng hóa đơn thanh toán</div>
                    <div style={{ fontSize: "28px", fontWeight: "bold", color: "#4A3B32" }}>
                        {filteredOrders.length}
                    </div>
                </div>
            </div>

            {/* Bảng danh sách hóa đơn */}
            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", padding: "20px", overflowX: "auto" }}>
                <h3 style={{ margin: "0 0 15px 0", color: "#4A3B32" }}>Danh sách hóa đơn đã thanh toán</h3>
                
                {filteredOrders.length > 0 ? (
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "600px" }}>
                        <thead>
                            <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #dee2e6", color: "#495057", fontSize: "14px" }}>
                                <th style={{ padding: "12px" }}>Mã Hóa Đơn</th>
                                <th style={{ padding: "12px" }}>Bàn</th>
                                <th style={{ padding: "12px" }}>Thời gian thanh toán</th>
                                <th style={{ padding: "12px", textAlign: "right" }}>Tổng tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((item) => (
                                <tr key={item.id} style={{ borderBottom: "1px solid #f1f3f5", fontSize: "14px" }}>
                                    <td style={{ padding: "12px", fontWeight: "bold" }}>#{item.id}</td>
                                    <td style={{ padding: "12px" }}>{item.table_name || `Bàn #${item.table_id}`}</td>
                                    <td style={{ padding: "12px", color: "#555" }}>
                                        {item.created_at ? new Date(item.created_at).toLocaleString("vi-VN") : "---"}
                                    </td>
                                    <td style={{ padding: "12px", textAlign: "right", fontWeight: "bold", color: "#28a745" }}>
                                        {Number(item.total_amount || 0).toLocaleString('vi-VN')} đ
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>
                        Không tìm thấy hóa đơn nào phù hợp với bộ lọc.
                    </div>
                )}
            </div>
        </div>
    );
}

export default RevenuePage;
