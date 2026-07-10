import { useState, useEffect } from "react";
import api from "../services/api"; // File kết nối axios của anh em mình

function CreateOrderPage() {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // 1. Lấy danh sách bàn trống từ Backend về để chọn
    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await api.get("/tables");
                // Lọc những bàn đang trống (hoặc hiển thị hết )
                const availableTables = response.data.data.filter(t => t.status === "empty" || t.status === "active");
                setTables(availableTables);
            } catch (err) {
                console.error("Lỗi lấy danh sách bàn:", err);
            }
        };
        fetchTables();
    }, []);

    // 2. Xử lý bấm nút Tạo Đơn Hàng
    const handleCreateOrder = async (e) => {
        e.preventDefault();
        if (!selectedTable) {
            setMessage({ type: "error", text: "Vui lòng chọn bàn trước khi tạo đơn!" });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const response = await api.post("/orders", {
                table_id: selectedTable,
                note: note
            });

            if (response.data.success) {
                setMessage({ type: "success", text: `Tạo đơn hàng thành công cho Bàn ${selectedTable}!` });
                setNote("");
                setSelectedTable("");
                // Sau khi tạo xong đơn, thường sẽ chuyển hướng sang trang thêm món (AddItemPage)
                // navigate(`/orders/${response.data.orderId}/add-item`);
            }
        } catch (err) {
            setMessage({ 
                type: "error", 
                text: err.response?.data?.message || "Không thể tạo đơn hàng. Vui lòng thử lại!" 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-order-page" style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
            <h2>🛒 Tạo Đơn Hàng Mới</h2>
            <p style={{ color: "#666" }}>Chọn bàn và khởi tạo hóa đơn để bắt đầu gọi món.</p>

            {message.text && (
                <div style={{ 
                    padding: "10px", 
                    marginBottom: "15px", 
                    borderRadius: "4px",
                    backgroundColor: message.type === "success" ? "#e6f4ea" : "#fce8e6",
                    color: message.type === "success" ? "#137333" : "#c5221f"
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleCreateOrder}>
                {/* Chọn bàn */}
                <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Chọn Bàn Phục Vụ:</label>
                    <select 
                        value={selectedTable} 
                        onChange={(e) => setSelectedTable(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
                    >
                        <option value="">-- Chọn bàn đang trống --</option>
                        {tables.map((table) => (
                            <option key={table.id} value={table.id}>
                                Bàn {table.name || table.id} ({table.floor || "Tầng 1"} - {table.area || "Khu vực chung"})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Ghi chú */}
                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Ghi Chú Đơn Hàng (Nếu có):</label>
                    <textarea 
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Ví dụ: Ít đường, không đá, ngồi đợi bạn..."
                        rows="3"
                        style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", resize: "none" }}
                    />
                </div>

                {/* Nút bấm */}
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        width: "100%", 
                        padding: "12px", 
                        backgroundColor: "#8B5A2B", 
                        color: "#fff", 
                        border: "none", 
                        borderRadius: "4px", 
                        fontWeight: "bold",
                        cursor: loading ? "not-allowed" : "pointer" 
                    }}
                >
                    {loading ? "Đang xử lý..." : " Khởi Tạo Hóa Đơn & Mở Bàn"}
                </button>
            </form>
        </div>
    );
}

export default CreateOrderPage;