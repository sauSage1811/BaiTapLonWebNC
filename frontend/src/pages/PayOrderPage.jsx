import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function PayOrderPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("cash");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem("token");
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                
                const res = await api.get(`/orders/${orderId}`, config);
                setOrder(res.data.data || res.data);
            } catch (err) {
                console.error("Lỗi lấy chi tiết đơn hàng:", err);
                alert("Không thể tải thông tin hóa đơn này!");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const handleConfirmPayment = async () => {
        if (!window.confirm(`Xác nhận thanh toán Hóa đơn #${orderId}?`)) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            await api.post("/orders/pay", {
                order_id: Number(orderId),
                table_id: order?.table_id,
                payment_method: paymentMethod
            }, config);

            alert("🎉 Thanh toán thành công!");
            navigate("/"); 
        } catch (err) {
            console.error("Lỗi thanh toán:", err);
            alert(err.response?.data?.message || "Thanh toán thất bại, vui lòng thử lại!");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div style={{ padding: "40px", textAlign: "center" }}>Đang tải hóa đơn...</div>;
    }

    if (!order) {
        return <div style={{ padding: "40px", textAlign: "center", color: "red" }}>Không tìm thấy thông tin đơn hàng!</div>;
    }

    return (
        <div style={{ padding: "30px", maxWidth: "600px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, color: "#4A3B32" }}>Thanh Toán Hóa Đơn #{orderId}</h2>
                <button 
                    onClick={() => navigate(-1)}
                    style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}
                >
                    ⬅ Quay lại
                </button>
            </div>

            <div style={{ background: "#fff", padding: "25px", borderRadius: "12px", border: "1px solid #eee", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #f5f5f5", paddingBottom: "15px", marginBottom: "15px" }}>
                    <span style={{ fontWeight: "bold", fontSize: "16px" }}>Vị trí:</span>
                    <span style={{ fontSize: "16px", color: "#8B5A2B", fontWeight: "bold" }}>
                         {order.table_name || `Bàn #${order.table_id}`}
                    </span>
                </div>

                <h4 style={{ margin: "0 0 10px 0", color: "#555" }}>Chi tiết món ăn:</h4>
                <div style={{ maxHeight: "250px", overflowY: "auto", marginBottom: "15px", paddingRight: "5px" }}>
                    {order.items && order.items.length > 0 ? (
                        order.items.map((item, index) => (
                            <div key={index} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #eee", fontSize: "14px" }}>
                                <div>
                                    <span style={{ fontWeight: "600" }}>{item.product_name}</span>
                                    <span style={{ color: "#888", marginLeft: "8px" }}>x{item.quantity}</span>
                                </div>
                                <div>
                                    {(Number(item.price || 0) * item.quantity).toLocaleString()} đ
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ color: "#888", fontSize: "14px", fontStyle: "italic" }}>Chưa có chi tiết danh sách món</div>
                    )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #f5f5f5", paddingTop: "15px", marginBottom: "20px" }}>
                    <span style={{ fontSize: "18px", fontWeight: "bold" }}>Tổng cần thanh toán:</span>
                    <span style={{ fontSize: "22px", fontWeight: "bold", color: "#28a745" }}>
                        {Number(order.total_amount || 0).toLocaleString()} đ
                    </span>
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px", fontSize: "14px" }}>
                        Hình thức thanh toán:
                    </label>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod("cash")}
                            style={{
                                flex: 1,
                                padding: "10px",
                                borderRadius: "8px",
                                border: paymentMethod === "cash" ? "2px solid #8B5A2B" : "1px solid #ddd",
                                backgroundColor: paymentMethod === "cash" ? "#fdf8f3" : "#fff",
                                color: paymentMethod === "cash" ? "#8B5A2B" : "#333",
                                fontWeight: "bold",
                                cursor: "pointer"
                            }}
                        >
                            Tiền mặt
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod("qr")}
                            style={{
                                flex: 1,
                                padding: "10px",
                                borderRadius: "8px",
                                border: paymentMethod === "qr" ? "2px solid #8B5A2B" : "1px solid #ddd",
                                backgroundColor: paymentMethod === "qr" ? "#fdf8f3" : "#fff",
                                color: paymentMethod === "qr" ? "#8B5A2B" : "#333",
                                fontWeight: "bold",
                                cursor: "pointer"
                            }}
                        >
                            Chuyển khoản / QR
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleConfirmPayment}
                    disabled={submitting}
                    style={{
                        width: "100%",
                        padding: "14px",
                        backgroundColor: "#28a745",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        cursor: submitting ? "not-allowed" : "pointer"
                    }}
                >
                    {submitting ? " Đang xử lý..." : " Xác Nhận Thanh Toán"}
                </button>

                <button
                    type="button"   
                    onClick={() => navigate("/")}
                    style={{
                        width: "100%",
                        marginTop: "10px",
                        padding: "12px",
                        backgroundColor: "#6c757d",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "15px",
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                >
                    Thanh toán sau
                </button>

            </div>
        </div>
    );
}

export default PayOrderPage;