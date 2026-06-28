import { useCallback, useEffect, useMemo, useState } from "react";
import editIcon from "../assets/icons/edit.svg";
import deleteIcon from "../assets/icons/delete.svg";
import api from "../services/api";

const TABLE_STATUSES = ["empty", "using", "maintenance"];
const TABLE_STATUS_OPTIONS = [
    { value: "empty", label: "Trống" },
    { value: "using", label: "Đang sử dụng" },
    { value: "maintenance", label: "Bảo trì" }
];

const emptyTableForm = {
    name: "",
    capacity: "2-4",
    floor: "Tầng 1",
    area: "Khu trong nhà",
    status: "empty",
    useTime: ""
};

function normalizeTable(table) {
    const rawTableNumber = table.tableNumber || table.name || "";

    return {
        ...table,
        tableNumber: rawTableNumber.replace(/^Bàn\s*/i, ""),
        useTime: table.useTime || table.use_time || null
    };
}

function TablePage() {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState(null);
    const [form, setForm] = useState(emptyTableForm);
    const [saving, setSaving] = useState(false);
    const perPage = 8;

    const fetchTables = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const res = await api.get("/tables");
            setTables((res.data.data || []).map(normalizeTable));
        } catch (err) {
            setError(err.response?.data?.message || "Không tải được danh sách bàn");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let ignore = false;

        api.get("/tables")
            .then((res) => {
                if (ignore) return;
                setTables((res.data.data || []).map(normalizeTable));
            })
            .catch((err) => {
                if (ignore) return;
                setError(err.response?.data?.message || "Không tải được danh sách bàn");
            })
            .finally(() => {
                if (ignore) return;
                setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, []);

    const stats = useMemo(() => {
        const total = tables.length;
        const empty = tables.filter((table) => table.status === "empty").length;
        const using = tables.filter((table) => table.status === "using").length;
        const maintenance = tables.filter((table) => table.status === "maintenance").length;
        return { total, empty, using, maintenance };
    }, [tables]);

    const totalPages = Math.max(1, Math.ceil(tables.length / perPage));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedTables = tables.slice((safeCurrentPage - 1) * perPage, safeCurrentPage * perPage);
    const tableSlots = Array.from({ length: perPage }, (_, index) => paginatedTables[index] || null);

    const openCreateModal = () => {
        setEditingTable(null);
        setForm(emptyTableForm);
        setModalOpen(true);
    };

    const openEditModal = (table) => {
        setEditingTable(table);
        setForm({
            name: table.name || `Bàn ${table.tableNumber || ""}`,
            capacity: table.capacity || "2-4",
            floor: table.floor || "Tầng 1",
            area: table.area || "Khu trong nhà",
            status: table.status || "empty",
            useTime: table.useTime || ""
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;
        setModalOpen(false);
        setEditingTable(null);
        setForm(emptyTableForm);
    };

    const updateForm = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        if (!form.name.trim()) {
            return "Tên bàn không được để trống";
        }

        if (!TABLE_STATUSES.includes(form.status)) {
            return "Trạng thái bàn không hợp lệ";
        }

        return "";
    };

    const buildPayload = () => ({
        name: form.name.trim(),
        capacity: form.capacity.trim() || "2-4",
        floor: form.floor.trim() || "Tầng 1",
        area: form.area.trim() || "Khu trong nhà",
        status: form.status,
        useTime: form.status === "using" ? form.useTime.trim() || null : null
    });

    const handleSubmitTable = async (event) => {
        event.preventDefault();
        const validationError = validateForm();

        if (validationError) {
            window.alert(validationError);
            return;
        }

        setSaving(true);

        try {
            const payload = buildPayload();

            if (editingTable) {
                await api.put(`/tables/${editingTable.id}`, payload);
            } else {
                await api.post("/tables", payload);
            }

            await fetchTables();
            closeModal();
        } catch (err) {
            window.alert(err.response?.data?.message || "Không lưu được bàn");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTable = async (table) => {
        const confirmed = window.confirm(`Xóa ${table.name || `Bàn ${table.tableNumber}`}?`);
        if (!confirmed) return;

        try {
            await api.delete(`/tables/${table.id}`);
            await fetchTables();
        } catch (err) {
            window.alert(err.response?.data?.message || "Không xóa được bàn");
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "empty": return "Trống";
            case "using": return "Đang dùng";
            case "maintenance": return "Bảo trì";
            default: return "Không xác định";
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "empty": return "tb-status-empty";
            case "using": return "tb-status-using";
            case "maintenance": return "tb-status-maintenance";
            default: return "";
        }
    };

    return (
        <div className="table-page">
            <div className="page-header">
                <div className="page-header-text">
                    <h1>Quản lý bàn</h1>
                    <p>Theo dõi và quản lý trạng thái bàn trong quán</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary btn-with-icon" onClick={fetchTables} disabled={loading}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.5 2v6h-6" /><path d="M2.5 22v-6h6" /><path d="M2 11.5a10 10 0 0 1 18.8-4.3" /><path d="M22 12.5a10 10 0 0 1-18.8 4.2" />
                        </svg>
                        {loading ? "Đang tải" : "Refresh"}
                    </button>
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        <span className="btn-plus-icon">+</span> Thêm bàn
                    </button>
                </div>
            </div>

            {error && (
                <div className="tb-api-message" role="alert">
                    {error}
                </div>
            )}

            <div className="tb-stats-grid">
                <div className="tb-stat-card tb-stat-total">
                    <div className="tb-stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" />
                        </svg>
                    </div>
                    <div className="tb-stat-value">{stats.total}</div>
                    <div className="tb-stat-label">Tổng bàn</div>
                </div>
                <div className="tb-stat-card tb-stat-empty">
                    <div className="tb-stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <div className="tb-stat-value">{stats.empty}</div>
                    <div className="tb-stat-label">Bàn trống</div>
                </div>
                <div className="tb-stat-card tb-stat-using">
                    <div className="tb-stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <div className="tb-stat-value">{stats.using}</div>
                    <div className="tb-stat-label">Đang sử dụng</div>
                </div>
                <div className="tb-stat-card tb-stat-maint">
                    <div className="tb-stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                        </svg>
                    </div>
                    <div className="tb-stat-value">{stats.maintenance}</div>
                    <div className="tb-stat-label">Bảo trì</div>
                </div>
            </div>

            <div className="tb-card-grid">
                {tableSlots.map((table, index) => (
                    table ? (
                        <div key={table.id} className={`tb-card ${getStatusClass(table.status)}`}>
                            <div className="tb-card-header">
                                <div className="tb-card-title">
                                    <span className="tb-card-table-icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="7" width="20" height="3" rx="1" /><path d="M4 10v8a2 2 0 0 0 2 2h0" /><path d="M20 10v8a2 2 0 0 1-2 2h0" /><path d="M6 20h0" /><path d="M18 20h0" />
                                        </svg>
                                    </span>
                                    <span className="tb-card-name">Bàn {table.tableNumber}</span>
                                </div>
                                <span className={`tb-badge ${getStatusClass(table.status)}`}>
                                    {getStatusLabel(table.status)}
                                </span>
                            </div>

                            <div className="tb-card-body">
                                <div className="tb-card-info-row">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                    </svg>
                                    <span>{table.floor} - {table.area}</span>
                                </div>
                                <div className="tb-card-info-row">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    <span>{table.capacity} khách</span>
                                </div>
                                {table.status === "using" && table.useTime && (
                                    <div className="tb-card-info-row tb-card-time">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        <span>{table.useTime}</span>
                                    </div>
                                )}
                            </div>

                            <div className="tb-card-footer">
                                <button className="btn btn-sm btn-edit" onClick={() => openEditModal(table)}>
                                    <img src={editIcon} alt="" className="btn-icon" aria-hidden="true" />
                                    Sửa
                                </button>
                                <button className="btn btn-sm btn-delete" onClick={() => handleDeleteTable(table)}>
                                    <img src={deleteIcon} alt="" className="btn-icon" aria-hidden="true" />
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            key={`table-placeholder-${index}`}
                            className="tb-card tb-card-placeholder"
                            aria-hidden="true"
                        />
                    )
                ))}
            </div>

            {tables.length > perPage && (
                <div className="tb-pagination">
                    <span className="tb-pagination-info">
                        Hiển thị {(safeCurrentPage - 1) * perPage + 1} - {Math.min(safeCurrentPage * perPage, tables.length)} trong tổng số {tables.length} bàn
                    </span>
                    <div className="tb-pagination-controls">
                        <button
                            className="tb-page-btn"
                            disabled={safeCurrentPage === 1}
                            onClick={() => setCurrentPage((page) => page - 1)}
                            aria-label="Trang trước"
                        >
                            ‹
                        </button>
                        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                            <button
                                key={page}
                                className={`tb-page-btn${safeCurrentPage === page ? " tb-page-active" : ""}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            className="tb-page-btn"
                            disabled={safeCurrentPage === totalPages}
                            onClick={() => setCurrentPage((page) => page + 1)}
                            aria-label="Trang sau"
                        >
                            ›
                        </button>
                    </div>
                </div>
            )}

            {modalOpen && (
                <div className="modal-overlay" role="presentation" onMouseDown={closeModal}>
                    <div className="entity-modal table-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
                        <div className="entity-modal-header">
                            <div>
                                <h2>{editingTable ? "Sửa bàn" : "Thêm bàn mới"}</h2>
                                <p>{editingTable ? "Cập nhật khu vực, sức chứa và trạng thái bàn." : "Tạo bàn mới để đưa vào sơ đồ phục vụ."}</p>
                            </div>
                            <button type="button" className="modal-close-btn" onClick={closeModal} aria-label="Đóng">
                                ×
                            </button>
                        </div>

                        <form className="entity-form" onSubmit={handleSubmitTable}>
                            <div className="table-form-summary">
                                <div className={`table-form-status-dot ${getStatusClass(form.status)}`}></div>
                                <div>
                                    <strong>{form.name.trim() || "Tên bàn"}</strong>
                                    <small>{form.floor || "Tầng 1"} - {form.area || "Khu trong nhà"}</small>
                                </div>
                            </div>

                            <div className="form-grid two-cols">
                                <div className="form-group">
                                    <label htmlFor="table-name">Tên bàn</label>
                                    <input
                                        id="table-name"
                                        value={form.name}
                                        onChange={(event) => updateForm("name", event.target.value)}
                                        placeholder="Ví dụ: Bàn 01"
                                        autoFocus
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="table-capacity">Sức chứa</label>
                                    <input
                                        id="table-capacity"
                                        value={form.capacity}
                                        onChange={(event) => updateForm("capacity", event.target.value)}
                                        placeholder="2-4"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="table-floor">Tầng</label>
                                    <input
                                        id="table-floor"
                                        value={form.floor}
                                        onChange={(event) => updateForm("floor", event.target.value)}
                                        placeholder="Tầng 1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="table-area">Khu vực</label>
                                    <input
                                        id="table-area"
                                        value={form.area}
                                        onChange={(event) => updateForm("area", event.target.value)}
                                        placeholder="Khu trong nhà"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="table-status">Trạng thái</label>
                                    <select
                                        id="table-status"
                                        value={form.status}
                                        onChange={(event) => updateForm("status", event.target.value)}
                                    >
                                        {TABLE_STATUS_OPTIONS.map((status) => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="table-use-time">Thời gian sử dụng</label>
                                    <input
                                        id="table-use-time"
                                        value={form.useTime}
                                        onChange={(event) => updateForm("useTime", event.target.value)}
                                        placeholder="Ví dụ: 35 phút"
                                        disabled={form.status !== "using"}
                                    />
                                </div>
                            </div>

                            <div className="entity-modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={saving}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? "Đang lưu..." : editingTable ? "Lưu thay đổi" : "Thêm bàn"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TablePage;
