import editIcon from "../assets/icons/edit.svg";
import deleteIcon from "../assets/icons/delete.svg";
import searchIcon from "../assets/icons/search.svg";

function ProductPage() {
    const sampleProducts = [
        { id: 1, name: "Cà phê sữa đá", price: 29000, category: "Cà phê", active: true },
        { id: 2, name: "Cà phê đen", price: 25000, category: "Cà phê", active: true },
        { id: 3, name: "Bạc xỉu", price: 32000, category: "Cà phê", active: true },
        { id: 4, name: "Trà đào cam sả", price: 45000, category: "Trà", active: true },
        { id: 5, name: "Trà sữa trân châu", price: 39000, category: "Trà", active: false },
        { id: 6, name: "Nước ép cam", price: 35000, category: "Nước ép", active: true },
        { id: 7, name: "Sinh tố bơ", price: 42000, category: "Sinh tố", active: true },
        { id: 8, name: "Matcha đá xay", price: 49000, category: "Đá xay", active: false },
    ];

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-header-text">
                    <h1>☕ Quản lý sản phẩm</h1>
                    <p>Quản lý đồ uống, giá bán, danh mục và trạng thái sản phẩm.</p>
                </div>
                <button className="btn btn-primary">
                    ➕ Thêm sản phẩm
                </button>
            </div>

            <div className="page-toolbar">
                <div className="page-toolbar-left">
                    <div className="search-bar">
                        <img src={searchIcon} alt="" className="search-bar-icon" aria-hidden="true" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                        />
                    </div>
                </div>
                <div className="page-toolbar-right">
                    <span style={{ fontSize: 13, color: "#78716c", fontWeight: 500 }}>
                        Tổng: {sampleProducts.length} sản phẩm
                    </span>
                </div>
            </div>

            <div className="card animate-in">
                <div className="card-body">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="col-stt">STT</th>
                                <th>Tên sản phẩm</th>
                                <th>Giá</th>
                                <th>Danh mục</th>
                                <th>Trạng thái</th>
                                <th className="col-actions">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sampleProducts.map((product, index) => (
                                <tr key={product.id}>
                                    <td className="col-stt">{index + 1}</td>
                                    <td>
                                        <span className="product-name">{product.name}</span>
                                    </td>
                                    <td>
                                        <span className="price">{formatPrice(product.price)}</span>
                                    </td>
                                    <td>
                                        <span className="product-category">{product.category}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${product.active ? "badge-active" : "badge-inactive"}`}>
                                            {product.active ? "✓ Active" : "✕ Inactive"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="btn btn-sm btn-edit">
                                                <img src={editIcon} alt="" className="btn-icon" aria-hidden="true" />
                                                Sửa
                                            </button>
                                            <button className="btn btn-sm btn-delete">
                                                <img src={deleteIcon} alt="" className="btn-icon" aria-hidden="true" />
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ProductPage;
