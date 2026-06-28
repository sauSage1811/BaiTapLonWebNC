import { useCallback, useEffect, useMemo, useState } from "react";
import editIcon from "../assets/icons/edit.svg";
import deleteIcon from "../assets/icons/delete.svg";
import searchIcon from "../assets/icons/search.svg";
import logoImg from "../assets/logo.png";
import api from "../services/api";

const ALL_CATEGORIES = "Tất cả";
const PRODUCT_STATUSES = [
    { value: "active", label: "Đang bán" },
    { value: "inactive", label: "Tạm ẩn" }
];

const emptyProductForm = {
    name: "",
    price: "",
    categoryId: "",
    image: "",
    status: "active"
};

function normalizeProduct(product) {
    return {
        id: product.id,
        name: product.name || "",
        price: Number(product.price || 0),
        categoryId: product.category_id || "",
        categoryName: product.category_name || "Chưa phân loại",
        image: product.image || "",
        status: product.status || "active"
    };
}

function ProductPage() {
    const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form, setForm] = useState(emptyProductForm);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [productRes, categoryRes] = await Promise.all([
                api.get("/products"),
                api.get("/categories")
            ]);

            setProducts((productRes.data.data || []).map(normalizeProduct));
            setCategories(categoryRes.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Không tải được dữ liệu menu");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let ignore = false;

        Promise.all([
            api.get("/products"),
            api.get("/categories")
        ])
            .then(([productRes, categoryRes]) => {
                if (ignore) return;
                setProducts((productRes.data.data || []).map(normalizeProduct));
                setCategories(categoryRes.data.data || []);
            })
            .catch((err) => {
                if (ignore) return;
                setError(err.response?.data?.message || "Không tải được dữ liệu menu");
            })
            .finally(() => {
                if (ignore) return;
                setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, []);

    const categoryTabs = useMemo(() => {
        const names = categories.map((category) => category.name).filter(Boolean);
        return [ALL_CATEGORIES, ...names];
    }, [categories]);

    const filteredProducts = useMemo(() => {
        const searchText = searchQuery.trim().toLowerCase();

        return products.filter((product) => {
            const matchCategory = activeCategory === ALL_CATEGORIES || product.categoryName === activeCategory;
            const matchSearch =
                !searchText ||
                product.name.toLowerCase().includes(searchText) ||
                product.categoryName.toLowerCase().includes(searchText);

            return matchCategory && matchSearch;
        });
    }, [activeCategory, products, searchQuery]);

    const formatPrice = (price) => `${new Intl.NumberFormat("vi-VN").format(price)} VNĐ`;

    const openCreateModal = () => {
        setEditingProduct(null);
        setForm({
            ...emptyProductForm,
            categoryId: categories[0]?.id ? String(categories[0].id) : ""
        });
        setModalOpen(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setForm({
            name: product.name,
            price: String(product.price),
            categoryId: product.categoryId ? String(product.categoryId) : "",
            image: product.image || "",
            status: product.status
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;
        setModalOpen(false);
        setEditingProduct(null);
        setForm(emptyProductForm);
    };

    const updateForm = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const buildPayload = (nextForm = form) => ({
        name: nextForm.name.trim(),
        price: Number(nextForm.price),
        category_id: Number(nextForm.categoryId),
        image: nextForm.image.trim() || null,
        status: nextForm.status
    });

    const validateForm = () => {
        if (!form.name.trim()) {
            return "Tên món không được để trống";
        }

        if (!form.categoryId) {
            return "Vui lòng chọn danh mục";
        }

        if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
            return "Giá bán phải lớn hơn 0";
        }

        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const validationError = validateForm();

        if (validationError) {
            window.alert(validationError);
            return;
        }

        setSaving(true);

        try {
            const payload = buildPayload();

            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, payload);
            } else {
                await api.post("/products", payload);
            }

            await fetchProducts();
            closeModal();
        } catch (err) {
            window.alert(err.response?.data?.message || "Không lưu được món");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (product) => {
        const nextStatus = product.status === "active" ? "inactive" : "active";

        try {
            await api.put(`/products/${product.id}`, {
                name: product.name,
                price: product.price,
                category_id: product.categoryId,
                image: product.image || null,
                status: nextStatus
            });
            setProducts((prev) =>
                prev.map((item) => (item.id === product.id ? { ...item, status: nextStatus } : item))
            );
        } catch (err) {
            window.alert(err.response?.data?.message || "Không cập nhật được trạng thái món");
        }
    };

    const handleDeleteProduct = async (product) => {
        const confirmed = window.confirm(`Xóa món "${product.name}"?`);
        if (!confirmed) return;

        try {
            await api.delete(`/products/${product.id}`);
            await fetchProducts();
        } catch (err) {
            window.alert(err.response?.data?.message || "Không xóa được món");
        }
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-header-text">
                    <h1>Menu</h1>
                    <p>Quản lý món trong menu, giá bán, danh mục và trạng thái kinh doanh.</p>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    <span className="btn-plus-icon">+</span> Thêm món
                </button>
            </div>

            {error && (
                <div className="tb-api-message" role="alert">
                    {error}
                </div>
            )}

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
                    {categoryTabs.map((category) => (
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
                    <h2>Danh sách món trong menu ({filteredProducts.length})</h2>
                </div>
                <div className="card-body">
                    <table className="data-table menu-table">
                        <thead>
                            <tr>
                                <th className="menu-col-item">Tên món</th>
                                <th>Danh mục</th>
                                <th>Giá bán</th>
                                <th>Trạng thái</th>
                                <th className="col-actions">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="empty-state">
                                            <div className="empty-state-text">Đang tải menu...</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
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
                                                    <img src={product.image || logoImg} alt={product.name} />
                                                </div>
                                                <div className="menu-item-info">
                                                    <span className="menu-item-name">{product.name}</span>
                                                    <span className="menu-item-desc">
                                                        {product.status === "active" ? "Đang hiển thị trên menu" : "Đang tạm ẩn"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="menu-category-badge">
                                                <span className="menu-cat-dot"></span>
                                                {product.categoryName}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="price">{formatPrice(product.price)}</span>
                                        </td>
                                        <td>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={product.status === "active"}
                                                    onChange={() => handleToggleActive(product)}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn btn-sm btn-edit" title="Sửa" onClick={() => openEditModal(product)}>
                                                    <img src={editIcon} alt="" className="btn-icon" aria-hidden="true" />
                                                    Sửa
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-icon-only btn-delete-icon"
                                                    title="Xóa"
                                                    onClick={() => handleDeleteProduct(product)}
                                                >
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

            {modalOpen && (
                <div className="modal-overlay" role="presentation" onMouseDown={closeModal}>
                    <div className="entity-modal product-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
                        <div className="entity-modal-header">
                            <div>
                                <h2>{editingProduct ? "Sửa món" : "Thêm món mới"}</h2>
                                <p>{editingProduct ? "Cập nhật thông tin bán hàng của món." : "Nhập thông tin món để đưa vào menu."}</p>
                            </div>
                            <button type="button" className="modal-close-btn" onClick={closeModal} aria-label="Đóng">
                                ×
                            </button>
                        </div>

                        <form className="entity-form" onSubmit={handleSubmit}>
                            <div className="product-form-preview">
                                <div className="product-form-image">
                                    <img src={form.image.trim() || logoImg} alt="" />
                                </div>
                                <div>
                                    <span className="product-form-kicker">Xem trước món</span>
                                    <strong>{form.name.trim() || "Tên món"}</strong>
                                    <small>{form.price ? formatPrice(Number(form.price) || 0) : "Chưa nhập giá"}</small>
                                </div>
                            </div>

                            <div className="form-grid two-cols">
                                <div className="form-group">
                                    <label htmlFor="product-name">Tên món</label>
                                    <input
                                        id="product-name"
                                        value={form.name}
                                        onChange={(event) => updateForm("name", event.target.value)}
                                        placeholder="Ví dụ: Cà phê sữa đá"
                                        autoFocus
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="product-category">Danh mục</label>
                                    <select
                                        id="product-category"
                                        value={form.categoryId}
                                        onChange={(event) => updateForm("categoryId", event.target.value)}
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="product-price">Giá bán</label>
                                    <input
                                        id="product-price"
                                        type="number"
                                        min="0"
                                        step="1000"
                                        value={form.price}
                                        onChange={(event) => updateForm("price", event.target.value)}
                                        placeholder="29000"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="product-status">Trạng thái</label>
                                    <select
                                        id="product-status"
                                        value={form.status}
                                        onChange={(event) => updateForm("status", event.target.value)}
                                    >
                                        {PRODUCT_STATUSES.map((status) => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="product-image">Link hình ảnh</label>
                                <input
                                    id="product-image"
                                    value={form.image}
                                    onChange={(event) => updateForm("image", event.target.value)}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="entity-modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={saving}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? "Đang lưu..." : editingProduct ? "Lưu thay đổi" : "Thêm món"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductPage;
