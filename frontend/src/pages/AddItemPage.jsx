import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function AddItemPage() {
    const { orderId } = useParams(); 
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [cart, setCart] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // 1. Lấy danh mục và sản phẩm từ Backend (Đã thêm lọc status === 'active')
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, prodRes] = await Promise.all([
                    api.get("/categories"),
                    api.get("/products")
                ]);
                setCategories(catRes.data.data || catRes.data || []);
                
                const rawProducts = prodRes.data.data || prodRes.data || [];
                // Chỉ lấy những sản phẩm đang bật (active)
                const activeProducts = rawProducts.filter(p => p.status === "active");
                setProducts(activeProducts);

            } catch (err) {
                console.error("Lỗi lấy dữ liệu menu:", err);
                setMessage({ type: "error", text: "Không thể lấy danh sách menu món ăn." });
            }
        };
        fetchData();
    }, []);

    // 2. Lọc sản phẩm theo danh mục
    const filteredProducts = selectedCategory === "all" 
        ? products 
        : products.filter(p => Number(p.category_id) === Number(selectedCategory) || Number(p.category?.id) === Number(selectedCategory));

    // 3. Thêm món vào giỏ hàng tạm thời
    const addToCart = (product) => {
        const exist = cart.find(item => item.id === product.id);
        if (exist) {
            setCart(cart.map(item => item.id === product.id ? { ...exist, quantity: exist.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    // 4. Tăng / Giảm số lượng trong giỏ
    const updateQuantity = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
        }).filter(Boolean));
    };

    // 5. Gửi danh sách món lên Backend
    const handleSaveOrderItems = async () => {
        if (cart.length === 0) {
            setMessage({ type: "error", text: "Vui lòng chọn ít nhất một món trước khi xác nhận!" });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const token = localStorage.getItem("token");
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            // Gửi tuần tự tránh SQLite bị lock DB
            for (const item of cart) {
                await api.post("/orders/add-item", {
                    order_id: Number(orderId),    
                    product_id: Number(item.id),   
                    quantity: Number(item.quantity)
                }, config);
            }

            setMessage({ type: "success", text: " Thêm các món thành công! Đang chuyển sang trang thanh toán..." });
            
            // Nhảy sang màn tính tiền chốt hạ sau 1.2s
            setTimeout(() => {
                navigate(`/orders/${orderId}/pay`);
            }, 1200);

        } catch (err) {
            console.error("Lỗi chi tiết gửi món:", err.response);
            const errMsg = err.response?.data?.message || "Lỗi khi thêm món vào hệ thống. Kiểm tra lại đường dẫn API hoặc Đăng nhập!";
            setMessage({ type: "error", text: errMsg });
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = cart.reduce((sum, item) => sum + (Number(item.price || 0) * item.quantity), 0);

    return (
        <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
            
            {/* Tiêu đề trang */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", borderBottom: "2px solid #f0f0f0", paddingBottom: "15px" }}>
                <div>
                    <h2 style={{ margin: 0, color: "#4A3B32" }}>📋 Thực Đơn Gọi Món - Hóa Đơn #{orderId}</h2>
                    <p style={{ margin: "5px 0 0 0", color: "#888", fontSize: "14px" }}>Chọn món ăn, đồ uống bên dưới để gom vào giỏ.</p>
                </div>
                <button 
                    onClick={() => navigate("/")} 
                    style={{ padding: "8px 16px", backgroundColor: "#f3f4f6", color: "#4b5563", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                >
                    ↩ Sơ đồ bàn
                </button>
            </div>
            
            {/* Thông báo trạng thái */}
            {message.text && (
                <div style={{ padding: "12px 20px", marginBottom: "20px", borderRadius: "8px", fontWeight: "500", backgroundColor: message.type === "success" ? "#e6f4ea" : "#fce8e6", color: message.type === "success" ? "#137333" : "#c5221f" }}>
                    {message.text}
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr", gap: "30px" }}>
                
                {/* BÊN TRÁI: THỰC ĐƠN */}
                <div>
                    {/* Bộ lọc danh mục */}
                    <div style={{ display: "flex", gap: "10px", marginBottom: "25px", overflowX: "auto", paddingBottom: "8px" }}>
                        <button 
                            onClick={() => setSelectedCategory("all")} 
                            style={{ padding: "8px 18px", borderRadius: "20px", border: "1px solid #e0e0e0", backgroundColor: selectedCategory === "all" ? "#8B5A2B" : "#fff", color: selectedCategory === "all" ? "#fff" : "#444", cursor: "pointer", fontWeight: "600" }}
                        >
                            Tất cả
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat.id} 
                                onClick={() => setSelectedCategory(cat.id)} 
                                style={{ padding: "8px 18px", borderRadius: "20px", border: "1px solid #e0e0e0", backgroundColor: selectedCategory === cat.id ? "#8B5A2B" : "#fff", color: selectedCategory === cat.id ? "#fff" : "#444", cursor: "pointer", fontWeight: "600" }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Danh sách món ăn */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "20px" }}>
                        {filteredProducts.map(prod => (
                            <div 
                                key={prod.id} 
                                onClick={() => addToCart(prod)} 
                                style={{ border: "1px solid #f0f0f0", borderRadius: "12px", padding: "15px", textAlign: "center", cursor: "pointer", background: "#fff", boxShadow: "0 4px 10px rgba(0,0,0,0.03)" }}
                            >
                                <div style={{ fontSize: "45px", marginBottom: "8px" }}>☕</div>
                                <div style={{ fontWeight: "bold", fontSize: "14px", height: "38px", color: "#333", overflow: "hidden" }}>{prod.name}</div>
                                <div style={{ color: "#8B5A2B", fontWeight: "700", marginTop: "8px" }}>{Number(prod.price).toLocaleString()}đ</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* BÊN PHẢI: GIỎ HÀNG TẠM TÍNH */}
                <div style={{ background: "#fff", padding: "25px", borderRadius: "16px", border: "1px solid #f0f0f0", height: "fit-content", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                    <h3 style={{ marginTop: 0, borderBottom: "2px solid #f5f5f5", paddingBottom: "12px", color: "#4A3B32" }}>🛒 Món đã chọn</h3>
                    
                    {cart.length === 0 ? (
                        <div style={{ color: "#aaa", textAlign: "center", padding: "40px 0" }}>
                            <p style={{ fontSize: "14px" }}>Chưa chọn món nào</p>
                        </div>
                    ) : (
                        <div>
                            <div style={{ maxHeight: "350px", overflowY: "auto", marginBottom: "15px" }}>
                                {cart.map(item => (
                                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #fafafa" }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: "600", fontSize: "14px" }}>{item.name}</div>
                                            <div style={{ fontSize: "12px", color: "#777" }}>{Number(item.price).toLocaleString()}đ</div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <button onClick={() => updateQuantity(item.id, -1)} style={{ width: "26px", height: "26px", borderRadius: "50%", border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>-</button>
                                            <span style={{ fontWeight: "bold" }}>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} style={{ width: "26px", height: "26px", borderRadius: "50%", border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "17px", borderTop: "2px solid #f5f5f5", paddingTop: "15px", marginBottom: "20px" }}>
                                <span>Tổng cộng:</span>
                                <span style={{ color: "#8B5A2B" }}>{totalAmount.toLocaleString()}đ</span>
                            </div>

                            <button 
                                onClick={handleSaveOrderItems} 
                                disabled={loading} 
                                style={{ width: "100%", padding: "14px", backgroundColor: "#8B5A2B", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}
                            >
                                {loading ? " Đang gửi đơn..." : "  Xác Nhận Gọi Món"}
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default AddItemPage;