import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CreateOrderPage() {
    const navigate = useNavigate();
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Hàm tiện ích để tự động cấu hình Header chứa Token gửi lên Backend
    const getConfigWithToken = () => {
        const token = localStorage.getItem("token");
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };

    // 1. Lấy danh sách bàn từ Backend
    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await api.get("/tables", getConfigWithToken());
                const data = response.data.data || response.data;
                setTables(data);
            } catch (err) {
                console.error("Lỗi lấy danh sách bàn từ Backend:", err);
                setMessage({ type: "error", text: "Không thể kết nối với máy chủ để lấy sơ đồ bàn. Bạn đã đăng nhập chưa?" });
            }
        };
        fetchTables();
    }, []);

    // 2. Xử lý tạo Đơn Hàng Tại Bàn
    const handleCreateOrder = async (e) => {
        e.preventDefault();
        if (!selectedTable) {
            setMessage({ type: "error", text: "Vui lòng chọn một bàn trên sơ đồ trước!" });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const response = await api.post("/orders/create", {
                table_id: selectedTable,
                note: note
            }, getConfigWithToken());

            if (response.data.success || response.status === 200 || response.status === 201) {
                setMessage({ type: "success", text: " Khởi tạo đơn hàng thành công!" });
                
                // ĐÃ SỬA: Lấy chính xác response.data.order_id từ Backend trả về
                const orderId = response.data.order_id || response.data.data?.id;

                if (orderId) {
                    setTimeout(() => {
                        navigate(`/orders/${orderId}/add-item`);
                    }, 1000);
                } else {
                    setMessage({ type: "error", text: "Backend không trả về ID đơn hàng hợp lệ!" });
                }
            }
        } catch (err) {
            console.error("Lỗi API Backend:", err.response?.data);
            setMessage({ 
                type: "error", 
                text: err.response?.data?.message || "Không thể tạo đơn hàng. Hãy kiểm tra quyền Admin/Staff hoặc trạng thái bàn!" 
            });
        } finally {
            setLoading(false);
        }
    };

    // 3. Xử lý Bán Mang Về
    const handleTakeawayOrder = async () => {
        setLoading(true);
        setMessage({ type: "", text: "" });

        const takeawayTable = tables.find(t => t.name?.toLowerCase().includes("mang về"));

        if (!takeawayTable) {
            setMessage({ 
                type: "error", 
                text: "Không tìm thấy cấu hình 'Bàn Mang về' trong hệ thống để gán đơn!" 
            });
            setLoading(false);
            return;
        }

        try {
            const response = await api.post("/orders/create", {
                table_id: takeawayTable.id,
                note: note
            }, getConfigWithToken());

            if (response.data.success || response.status === 200 || response.status === 201) {
                setMessage({ type: "success", text: " Khởi tạo đơn hàng mang về thành công!" });
                
                // ĐÃ SỬA: Lấy chính xác response.data.order_id từ Backend trả về
                const orderId = response.data.order_id || response.data.data?.id;
                
                if (orderId) {
                    setTimeout(() => {
                        navigate(`/orders/${orderId}/add-item`);
                    }, 1000);
                } else {
                    setMessage({ type: "error", text: "Backend không trả về ID đơn hàng hợp lệ!" });
                }
            }
        } catch (err) {
            console.error("Lỗi khi tạo đơn mang về:", err.response?.data);
            setMessage({ 
                type: "error", 
                text: err.response?.data?.message || "Không thể kết nối Backend để tạo đơn mang về!" 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "30px", maxWidth: "1000px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", borderBottom: "2px solid #f0f0f0", paddingBottom: "15px" }}>
                <div>
                    <h2 style={{ margin: 0, color: "#4A3B32", display: "flex", alignItems: "center", gap: "10px" }}>
                        ☕ Sơ Đồ Gọi Món Tại Bàn
                    </h2>
                    <p style={{ margin: "5px 0 0 0", color: "#888", fontSize: "14px" }}>Chọn bàn trống trực quan bên dưới để khởi tạo hóa đơn thực tế.</p>
                </div>
            </div>

            {/* Thông báo trạng thái */}
            {message.text && (
                <div style={{ 
                    padding: "12px 20px", 
                    marginBottom: "20px", 
                    borderRadius: "8px",
                    fontWeight: "500",
                    backgroundColor: message.type === "success" ? "#e6f4ea" : "#fce8e6",
                    color: message.type === "success" ? "#137333" : "#c5221f",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}>
                    {message.text}
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px" }}>
                
                {/* BÊN TRÁI: Sơ đồ phòng bàn */}
                <div>
                    <h3 style={{ marginTop: 0, marginBottom: "15px", color: "#666", fontSize: "16px" }}>Giao diện sơ đồ phòng bàn:</h3>
                    
                    <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", 
                        gap: "15px" 
                    }}>
                        {tables
                            .filter(t => !t.name?.toLowerCase().includes("mang về"))
                            .map((table) => {
                                const isSelected = selectedTable === table.id;
                                const isUsing = table.status === "using";
                                const isMaintenance = table.status === "maintenance";
                                const isDisable = isUsing || isMaintenance || table.is_active === false;

                                return (
                                    <div 
                                        key={table.id}
                                        onClick={() => !isDisable && setSelectedTable(table.id)}
                                        style={{
                                            padding: "20px 10px",
                                            borderRadius: "12px",
                                            textAlign: "center",
                                            cursor: isDisable ? "not-allowed" : "pointer",
                                            position: "relative",
                                            transition: "all 0.2s ease",
                                            border: isSelected ? "2px solid #8B5A2B" : "1px solid #e0e0e0",
                                            backgroundColor: isMaintenance ? "#f9fafb" : isUsing ? "#fdf2f2" : isSelected ? "#FDF5E6" : "#ffffff",
                                            boxShadow: isSelected ? "0 4px 12px rgba(139, 90, 43, 0.2)" : "0 2px 5px rgba(0,0,0,0.05)",
                                            transform: isSelected ? "scale(1.03)" : "none",
                                            opacity: isMaintenance ? 0.6 : 1
                                        }}
                                    >
                                        <span style={{
                                            position: "absolute",
                                            top: "8px",
                                            right: "8px",
                                            width: "10px",
                                            height: "10px",
                                            borderRadius: "50%",
                                            backgroundColor: isUsing ? "#e02424" : isMaintenance ? "#f59e0b" : "#10b981"
                                        }} />

                                        <div style={{ fontSize: "28px", marginBottom: "8px" }}></div>
                                        <div style={{ fontWeight: "bold", color: "#333", fontSize: "15px" }}>
                                            {table.name?.toLowerCase().includes("bàn") ? table.name : `Bàn ${table.name || table.id}`}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                                            {table.floor || "Tầng 1"}
                                        </div>
                                        <div style={{ 
                                            fontSize: "11px", 
                                            marginTop: "8px", 
                                            fontWeight: "600",
                                            color: isUsing ? "#e02424" : isMaintenance ? "#f59e0b" : "#10b981"
                                        }}>
                                            {isUsing ? "Có khách" : isMaintenance ? "Bảo trì" : "Sẵn sàng"}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* BÊN PHẢI: Form Xác Nhận Thông Tin */}
                <div style={{ 
                    background: "#ffffff", 
                    padding: "25px", 
                    borderRadius: "16px", 
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    border: "1px solid #f0f0f0",
                    height: "fit-content"
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#4A3B32" }}>Thông Tin Đơn Hàng</h3>
                    
                    <form onSubmit={handleCreateOrder}>
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", marginBottom: "8px", color: "#555", fontWeight: "600" }}>Bàn đang chọn:</label>
                            <div style={{ 
                                padding: "12px", 
                                backgroundColor: "#f9f9f9", 
                                borderRadius: "8px", 
                                fontWeight: "bold",
                                color: selectedTable ? "#8B5A2B" : "#999",
                                border: "1px dashed #ccc",
                                fontSize: "16px"
                            }}>
                                {selectedTable 
                                    ? (() => {
                                        const currentTable = tables.find(t => t.id === selectedTable);
                                        return ` Đang chọn: ${currentTable?.name?.toLowerCase().includes("bàn") ? currentTable.name : `Bàn ${currentTable?.name || selectedTable}`}`;
                                      })()
                                    : "Chưa chọn bàn nào"
                                }
                            </div>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", marginBottom: "8px", color: "#555", fontWeight: "600" }}>Ghi chú:</label>
                            <textarea 
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Ghi chú dịch vụ..."
                                rows="3"
                                style={{ 
                                    width: "100%", 
                                    padding: "12px", 
                                    borderRadius: "8px", 
                                    border: "1px solid #ddd", 
                                    resize: "none",
                                    fontFamily: "inherit",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || !selectedTable}
                            style={{ 
                                width: "100%", 
                                padding: "14px", 
                                backgroundColor: selectedTable ? "#8B5A2B" : "#ccc", 
                                color: "#fff", 
                                border: "none", 
                                borderRadius: "8px", 
                                fontWeight: "bold",
                                fontSize: "15px",
                                cursor: (loading || !selectedTable) ? "not-allowed" : "pointer",
                                transition: "all 0.2s",
                                marginBottom: "12px"
                            }}
                        >
                            {loading ? " Đang kết nối..." : "  Gọi Món"}
                        </button>

                        <button 
                            type="button"
                            onClick={handleTakeawayOrder}
                            disabled={loading}
                            style={{ 
                                width: "100%", 
                                padding: "12px", 
                                backgroundColor: "#ffffff", 
                                color: "#8B5A2B", 
                                border: "2px solid #8B5A2B", 
                                borderRadius: "8px", 
                                fontWeight: "bold",
                                fontSize: "15px",
                                cursor: loading ? "not-allowed" : "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                             Đơn Mang Về (Không Bàn)
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}

export default CreateOrderPage;