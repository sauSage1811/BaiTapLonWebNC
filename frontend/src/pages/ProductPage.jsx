import { useState } from "react";
import editIcon from "../assets/icons/edit.svg";
import deleteIcon from "../assets/icons/delete.svg";
import searchIcon from "../assets/icons/search.svg";
import logoImg from "../assets/logo.png";

const CATEGORIES = ["Tất cả", "Cà phê", "Trà", "Nước ép", "Sinh tố", "Đá xay", "Topping"];

const sampleProducts = [
    { id: 1, name: "Cà phê sữa đá", desc: "Cà phê phin đậm vị với sữa đặc", price: 29000, category: "Cà phê", stock: 50, active: true },
    { id: 2, name: "Cà phê đen", desc: "Cà phê phin truyền thống", price: 25000, category: "Cà phê", stock: 50, active: true },
    { id: 3, name: "Bạc xỉu", desc: "Sữa thơm béo hòa cùng cà phê", price: 32000, category: "Cà phê", stock: 45, active: true },
    { id: 4, name: "Trà đào cam sả", desc: "Trà trái cây tươi mát", price: 45000, category: "Trà", stock: 40, active: true },
    { id: 5, name: "Trà sữa trân châu", desc: "Trà sữa béo nhẹ với trân châu", price: 39000, category: "Trà", stock: 35, active: false },
    { id: 6, name: "Nước ép cam", desc: "Cam tươi ép nguyên chất", price: 35000, category: "Nước ép", stock: 30, active: true },
    { id: 7, name: "Sinh tố bơ", desc: "Bơ xay mịn cùng sữa", price: 42000, category: "Sinh tố", stock: 25, active: true },
    { id: 8, name: "Matcha đá xay", desc: "Matcha xay mát lạnh", price: 49000, category: "Đá xay", stock: 20, active: true },
    { id: 9, name: "Topping trân châu", desc: "Topping thêm cho đồ uống", price: 10000, category: "Topping", stock: 60, active: true },
];

function ProductPage() {
    const [activeCategory, setActiveCategory] = useState("Tất cả");
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState(sampleProducts);

    const filteredProducts = products.filter((product) => {
        const matchCategory = activeCategory === "Tất cả" || product.category === activeCategory;
        const searchText = searchQuery.toLowerCase();
        const matchSearch =
            product.name.toLowerCase().includes(searchText) ||
            product.desc.toLowerCase().includes(searchText);

        return matchCategory && matchSearch;
    });

    const handleToggleActive = (id) => {
        setProducts((prev) =>
            prev.map((product) => (product.id === id ? { ...product, active: !product.active } : product))
        );
    };

    const formatPrice = (price) => {
        return `${new Intl.NumberFormat("vi-VN").format(price)} VNĐ`;
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-header-text">
                    <h1>Menu</h1>
                    <p>Quản lý món trong menu, giá bán, danh mục và trạng thái kinh doanh.</p>
                </div>
                <button className="btn btn-primary">
                    <span className="btn-plus-icon">+</span> Thêm món
                </button>
            </div>

            <div className="menu-toolbar">
                <div className="search-bar menu-search">
                    <img src={searchIcon} alt="" className="search-bar-icon" aria-hidden="true" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm món..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                </div>
                <div className="menu-category-tabs" aria-label="Lọc theo danh mục">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            type="button"
                            className={`menu-tab${activeCategory === category ? " menu-tab-active" : ""}`}
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card animate-in menu-card">
                <div className="card-header">
                    <h2>Danh sách món trong menu</h2>
                </div>
                <div className="card-body">
                    <table className="data-table menu-table">
                        <thead>
                            <tr>
                                <th className="menu-col-item">Tên món</th>
                                <th>Danh mục</th>
                                <th>Giá bán</th>
                                <th>Số lượng</th>
                                <th>Trang thái</th>
                                <th className="col-actions">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="empty-state">
                                            <div className="empty-state-icon">☕</div>
                                            <div className="empty-state-text">Không tìm thấy món nào</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            <div className="menu-item-cell">
                                                <div className="menu-item-thumb">
                                                    <img src={logoImg} alt={product.name} />
                                                </div>
                                                <div className="menu-item-info">
                                                    <span className="menu-item-name">{product.name}</span>
                                                    <span className="menu-item-desc">{product.desc}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="menu-category-badge">
                                                <span className="menu-cat-dot"></span>
                                                {product.category}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="price">{formatPrice(product.price)}</span>
                                        </td>
                                        <td>
                                            <span className="menu-stock">{product.stock}</span>
                                        </td>
                                        <td>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={product.active}
                                                    onChange={() => handleToggleActive(product.id)}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn btn-sm btn-edit" title="Sửa">
                                                    <img src={editIcon} alt="" className="btn-icon" aria-hidden="true" />
                                                    Sửa
                                                </button>
                                                <button className="btn btn-sm btn-icon-only btn-delete-icon" title="Xóa">
                                                    <img src={deleteIcon} alt="" className="btn-icon" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ProductPage;
