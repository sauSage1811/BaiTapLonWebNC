import { useCallback, useEffect, useState } from "react";
import editIcon from "../assets/icons/edit.svg";
import deleteIcon from "../assets/icons/delete.svg";
import api from "../services/api";

const emptyCategoryForm = {
    name: "",
    description: ""
};

function normalizeName(name) {
    return name.trim().toLowerCase();
}

function CategoryPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [formError, setFormError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form, setForm] = useState(emptyCategoryForm);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await api.get("/categories");
            setCategories(res.data.data || []);
        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Không tải được danh sách danh mục"
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        Promise.resolve().then(fetchCategories);
    }, [fetchCategories]);

    const openCreateModal = () => {
        setEditingCategory(null);
        setForm(emptyCategoryForm);
        setFormError("");
        setModalOpen(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setForm({
            name: category.name || "",
            description: category.description || ""
        });
        setFormError("");
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;
        setModalOpen(false);
        setEditingCategory(null);
        setForm(emptyCategoryForm);
        setFormError("");
    };

    const updateForm = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setFormError("");
    };

    const validateForm = () => {
        const categoryName = form.name.trim();

        if (!categoryName) {
            return "Tên danh mục không được để trống";
        }

        const normalizedInput = normalizeName(categoryName);
        const duplicate = categories.some((category) => {
            if (editingCategory && category.id === editingCategory.id) {
                return false;
            }

            return normalizeName(category.name || "") === normalizedInput;
        });

        if (duplicate) {
            return "Tên danh mục đã tồn tại";
        }

        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        setSaving(true);
        setFormError("");
        setMessage({ type: "", text: "" });

        try {
            const payload = {
                name: form.name.trim(),
                description: form.description.trim() || null
            };

            const response = editingCategory
                ? await api.put(`/categories/${editingCategory.id}`, payload)
                : await api.post("/categories", payload);

            await fetchCategories();
            setModalOpen(false);
            setEditingCategory(null);
            setForm(emptyCategoryForm);
            setFormError("");
            setMessage({
                type: "success",
                text: response.data.message || (editingCategory ? "Cập nhật danh mục thành công" : "Thêm danh mục thành công")
            });
        } catch (err) {
            setFormError(err.response?.data?.message || "Không lưu được danh mục");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCategory = async (category) => {
        const confirmed = window.confirm(`Xóa danh mục "${category.name}"?`);
        if (!confirmed) return;

        setDeletingId(category.id);
        setMessage({ type: "", text: "" });

        try {
            const response = await api.delete(`/categories/${category.id}`);
            await fetchCategories();
            setMessage({
                type: "success",
                text: response.data.message || "Xóa danh mục thành công"
            });
        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Không xóa được danh mục"
            });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-header-text">
                    <h1>Quản lý danh mục</h1>
                    <p>Quản lý danh mục đồ uống và món bán trong hệ thống.</p>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal} disabled={loading}>
                    <span className="btn-plus-icon">+</span> Thêm danh mục
                </button>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type === "success" ? "success" : "error"}`} role="alert">
                    {message.text}
                </div>
            )}

            <div className="card animate-in">
                <div className="card-header">
                    <h2>Danh sách danh mục ({categories.length})</h2>
                </div>
                <div className="card-body">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="col-stt">STT</th>
                                <th>Tên danh mục</th>
                                <th>Mô tả</th>
                                <th className="col-actions">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4}>
                                        <div className="empty-state">
                                            <div className="empty-state-text">Đang tải danh mục...</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4}>
                                        <div className="empty-state">
                                            <div className="empty-state-text">Chưa có danh mục nào</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category, index) => (
                                    <tr key={category.id}>
                                        <td className="col-stt">{index + 1}</td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: "#3f2a1d" }}>
                                                {category.name}
                                            </span>
                                        </td>
                                        <td>{category.description || "Không có mô tả"}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    className="btn btn-sm btn-edit"
                                                    onClick={() => openEditModal(category)}
                                                    disabled={deletingId === category.id}
                                                >
                                                    <img src={editIcon} alt="" className="btn-icon" aria-hidden="true" />
                                                    Sửa
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-delete"
                                                    onClick={() => handleDeleteCategory(category)}
                                                    disabled={deletingId === category.id}
                                                >
                                                    <img src={deleteIcon} alt="" className="btn-icon" aria-hidden="true" />
                                                    {deletingId === category.id ? "Đang xóa..." : "Xóa"}
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
                    <div className="entity-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
                        <div className="entity-modal-header">
                            <div>
                                <h2>{editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}</h2>
                                <p>{editingCategory ? "Cập nhật tên và mô tả danh mục." : "Tạo danh mục mới để phân loại menu."}</p>
                            </div>
                            <button type="button" className="modal-close-btn" onClick={closeModal} aria-label="Đóng">
                                x
                            </button>
                        </div>

                        <form className="entity-form" onSubmit={handleSubmit}>
                            {formError && (
                                <div className="alert alert-error" role="alert">
                                    {formError}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="category-name">Tên danh mục</label>
                                <input
                                    id="category-name"
                                    value={form.name}
                                    onChange={(event) => updateForm("name", event.target.value)}
                                    placeholder="Ví dụ: Cafe"
                                    autoFocus
                                    disabled={saving}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="category-description">Mô tả</label>
                                <textarea
                                    id="category-description"
                                    value={form.description}
                                    onChange={(event) => updateForm("description", event.target.value)}
                                    placeholder="Mô tả ngắn về danh mục"
                                    rows={4}
                                    disabled={saving}
                                />
                            </div>

                            <div className="entity-modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={saving}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? "Đang lưu..." : editingCategory ? "Lưu thay đổi" : "Thêm danh mục"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CategoryPage;
