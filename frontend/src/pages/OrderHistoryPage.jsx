    import { useState, useEffect } from "react";
    import api from "../services/api";

    function OrderHistoryPage() {
        const [orders, setOrders] = useState([]);
        const [loading, setLoading] = useState(true);
        const [filterStatus, setFilterStatus] = useState("all");

        // State cho bộ lọc ngày tháng năm
        const [startDate, setStartDate] = useState("");
        const [endDate, setEndDate] = useState("");

        // State lưu chi tiết đơn hàng đang chọn
        const [selectedOrder, setSelectedOrder] = useState(null);
        const [loadingDetail, setLoadingDetail] = useState(false);

        useEffect(() => {
            fetchHistory();
        }, []);

        // 1. Gọi API Lấy Danh Sách Lịch Sử (/api/orders/history)
        async function fetchHistory() {
            try {
                setLoading(true);
                const res = await api.get("/orders/history");
                setOrders(res.data.data);
            } catch (err) {
                console.error("Lỗi tải lịch sử đơn hàng:", err);
                alert("Không thể tải danh sách lịch sử đơn hàng!");
            } finally {
                setLoading(false);
            }
        }

        // 2. Gọi API Lấy Chi Tiết Đơn Hàng (/api/orders/:orderId)
        const handleViewDetail = async (orderId) => {
            try {
                setLoadingDetail(true);
                const res = await api.get(`/orders/${orderId}`);
                setSelectedOrder(res.data.data);
            } catch (err) {
                console.error("Lỗi lấy chi tiết đơn hàng:", err);
                alert("Không thể tải chi tiết hóa đơn này!");
            } finally {
                setLoadingDetail(false);
            }
        };

        // 3. Gọi API Xóa Đơn Hàng (/api/orders/:orderId)
        const handleDeleteOrder = async (orderId) => {
            if (!window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${orderId} này không?`)) {
                return;
            }

            try {
                await api.delete(`/orders/${orderId}`);
                
                // Cập nhật lại state trực tiếp để giao diện tự mất đơn vừa xóa mà không cần fetch lại từ đầu
                setOrders(orders.filter(order => order.id !== orderId));
                
                // Nếu đang mở modal chi tiết của đúng đơn hàng bị xóa thì đóng modal lại
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder(null);
                }

                alert("Đã xóa đơn hàng thành công!");
            } catch (err) {
                console.error("Lỗi xóa đơn hàng:", err);
                alert(err.response?.data?.message || "Không thể xóa đơn hàng này!");
            }
        };

        // Lọc theo trạng thái và ngày tháng năm
        const filteredOrders = orders.filter(order => {
            // Lọc theo trạng thái
            if (filterStatus !== "all" && order.status !== filterStatus) {
                return false;
            }

            // Lọc theo ngày tháng năm
            if (startDate || endDate) {
                if (!order.created_at) return false;
                
                const orderDateStr = new Date(order.created_at).toISOString().split('T')[0];

                if (startDate && orderDateStr < startDate) {
                    return false;
                }
                if (endDate && orderDateStr > endDate) {
                    return false;
                }
            }

            return true;
        });

        // Helper format ngày giờ
        const formatDate = (dateString) => {
            if (!dateString) return "---";
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? dateString : date.toLocaleString("vi-VN");
        };

        if (loading) {
            return <div style={{ padding: "40px", textAlign: "center", fontSize: "16px" }}>⏳ Đang tải lịch sử đơn hàng...</div>;
        }

        return (
            <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
                
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ margin: 0, color: "#4A3B32" }}> Lịch Sử Hóa Đơn</h2>
                    <button 
                        onClick={fetchHistory}
                        style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontWeight: "bold" }}
                    >
                        Làm mới
                    </button>
                </div>

                {/* Khu vực bộ lọc */}
                <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "10px", marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "15px", alignItems: "center", justifyContent: "space-between" }}>
                    
                    {/* Tab lọc trạng thái */}
                    <div style={{ display: "flex", gap: "8px" }}>
                        {[
                            { key: "all", label: "Tất cả" },
                            { key: "paid", label: " Đã thanh toán" },
                            { key: "pending", label: " Chờ thanh toán" }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilterStatus(tab.key)}
                                style={{
                                    padding: "8px 14px",
                                    borderRadius: "20px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    fontSize: "13px",
                                    backgroundColor: filterStatus === tab.key ? "#8B5A2B" : "#e9ecef",
                                    color: filterStatus === tab.key ? "#fff" : "#495057",
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Bộ lọc theo ngày tháng năm */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", fontWeight: "500" }}>
                            <span>Từ:</span>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{ padding: "6px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", fontWeight: "500" }}>
                            <span>Đến:</span>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{ padding: "6px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
                            />
                        </div>
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(""); setEndDate(""); }}
                                style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #dc3545", background: "#fff", color: "#dc3545", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                            >
                                Xóa ngày lọc
                            </button>
                        )}
                    </div>
                </div>

                {/* BẢNG DANH SÁCH LỊCH SỬ */}
                <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "800px" }}>
                        <thead>
                            <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #dee2e6", color: "#495057" }}>
                                <th style={{ padding: "14px" }}>Mã Hóa Đơn</th>
                                <th style={{ padding: "14px" }}>Vị Trí / Bàn</th>
                                <th style={{ padding: "14px" }}>Thời Gian</th>
                                <th style={{ padding: "14px" }}>Tổng Tiền</th>
                                <th style={{ padding: "14px" }}>Trạng Thái</th>
                                <th style={{ padding: "14px", textAlign: "center" }}>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: "1px solid #f1f3f5" }}>
                                        <td style={{ padding: "14px", fontWeight: "bold" }}>#{item.id}</td>
                                        <td style={{ padding: "14px" }}>{item.table_name || `Bàn #${item.table_id}`}</td>
                                        <td style={{ padding: "14px", fontSize: "13px", color: "#555" }}>
                                            {formatDate(item.created_at)}
                                        </td>
                                        <td style={{ padding: "14px", fontWeight: "bold", color: "#28a745" }}>
                                            {Number(item.total_amount || 0).toLocaleString('vi-VN')} đ
                                        </td>
                                        <td style={{ padding: "14px" }}>
                                            <span style={{
                                                padding: "5px 12px",
                                                borderRadius: "15px",
                                                fontSize: "12px",
                                                fontWeight: "bold",
                                                backgroundColor: item.status === "paid" ? "#d4edda" : "#fff3cd",
                                                color: item.status === "paid" ? "#155724" : "#856404"
                                            }}>
                                                {item.status === "paid" ? "Đã thanh toán" : "Chờ thanh toán"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px", textAlign: "center" }}>
                                            <button
                                                onClick={() => handleViewDetail(item.id)}
                                                style={{
                                                    padding: "6px 12px",
                                                    borderRadius: "6px",
                                                    border: "none",
                                                    backgroundColor: "#17a2b8",
                                                    color: "#fff",
                                                    fontWeight: "bold",
                                                    cursor: "pointer",
                                                    fontSize: "13px",
                                                    marginRight: "6px"
                                                }}
                                            >
                                                Xem chi tiết
                                            </button>
                                            <button
                                                onClick={() => handleDeleteOrder(item.id)}
                                                style={{
                                                    padding: "6px 12px",
                                                    borderRadius: "6px",
                                                    border: "none",
                                                    backgroundColor: "#dc3545",
                                                    color: "#fff",
                                                    fontWeight: "bold",
                                                    cursor: "pointer",
                                                    fontSize: "13px"
                                                }}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: "30px", textAlign: "center", color: "#888" }}>
                                        Không tìm thấy hóa đơn phù hợp với bộ lọc.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* POPUP MODAL XEM CHI TIẾT */}
                {(selectedOrder || loadingDetail) && (
                    <div style={{
                        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                        backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center",
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: "#fff", width: "90%", maxWidth: "550px", borderRadius: "12px",
                            padding: "24px", boxShadow: "0 5px 20px rgba(0,0,0,0.2)", position: "relative"
                        }}>
                            
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                style={{
                                    position: "absolute", top: "15px", right: "15px", border: "none",
                                    background: "#f1f1f1", width: "30px", height: "30px", borderRadius: "50%",
                                    cursor: "pointer", fontWeight: "bold", fontSize: "16px"
                                }}
                            >
                                ✕
                            </button>

                            {loadingDetail ? (
                                <div style={{ padding: "30px", textAlign: "center" }}>⏳ Đang tải chi tiết hóa đơn...</div>
                            ) : (
                                selectedOrder && (
                                    <>
                                        <h3 style={{ margin: "0 0 15px 0", color: "#4A3B32" }}>
                                            🧾 Chi Tiết Hóa Đơn #{selectedOrder.id}
                                        </h3>

                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "15px", fontSize: "14px", background: "#f8f9fa", padding: "10px", borderRadius: "8px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span><strong>Vị trí:</strong> {selectedOrder.table_name || `Bàn #${selectedOrder.table_id}`}</span>
                                                <span style={{
                                                    fontWeight: "bold",
                                                    color: selectedOrder.status === "paid" ? "#155724" : "#856404"
                                                }}>
                                                    {selectedOrder.status === "paid" ? "✅ Đã thanh toán" : "⏳ Chờ thanh toán"}
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", color: "#555" }}>
                                                <span><strong>Thời gian:</strong> {formatDate(selectedOrder.created_at)}</span>
                                            </div>
                                        </div>

                                        <div style={{ maxHeight: "250px", overflowY: "auto", borderTop: "1px solid #eee", borderBottom: "1px solid #eee", padding: "10px 0" }}>
                                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                                                <thead>
                                                    <tr style={{ textTransform: "uppercase", fontSize: "12px", color: "#777" }}>
                                                        <th style={{ textAlign: "left", paddingBottom: "8px" }}>Tên món</th>
                                                        <th style={{ textAlign: "center", paddingBottom: "8px" }}>SL</th>
                                                        <th style={{ textAlign: "right", paddingBottom: "8px" }}>Thành tiền</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                                        selectedOrder.items.map((item, idx) => (
                                                            <tr key={idx} style={{ borderTop: "1px dashed #f0f0f0" }}>
                                                                <td style={{ padding: "8px 0", fontWeight: "500" }}>{item.product_name}</td>
                                                                <td style={{ textAlign: "center", color: "#666" }}>x{item.quantity}</td>
                                                                <td style={{ textAlign: "right", fontWeight: "bold" }}>
                                                                    {(Number(item.price || 0) * item.quantity).toLocaleString('vi-VN')} đ
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="3" style={{ textAlign: "center", padding: "10px", color: "#888" }}>
                                                                Chưa có chi tiết món ăn.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
                                            <span style={{ fontSize: "16px", fontWeight: "bold" }}>Tổng cộng:</span>
                                            <span style={{ fontSize: "20px", fontWeight: "bold", color: "#28a745" }}>
                                                {Number(selectedOrder.total_amount || 0).toLocaleString('vi-VN')} đ
                                            </span>
                                        </div>

                                        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                                            <button 
                                                onClick={() => handleDeleteOrder(selectedOrder.id)}
                                                style={{
                                                    flex: 1, padding: "10px", borderRadius: "8px",
                                                    border: "none", background: "#dc3545", color: "#fff", fontWeight: "bold", cursor: "pointer"
                                                }}
                                            >
                                                Xóa đơn này
                                            </button>
                                            <button 
                                                onClick={() => setSelectedOrder(null)}
                                                style={{
                                                    flex: 1, padding: "10px", borderRadius: "8px",
                                                    border: "none", background: "#6c757d", color: "#fff", fontWeight: "bold", cursor: "pointer"
                                                }}
                                            >
                                                Đóng lại
                                            </button>
                                        </div>
                                    </>
                                )
                            )}
                        </div>
                    </div>
                )}

            </div>
        );
    }

    export default OrderHistoryPage;
