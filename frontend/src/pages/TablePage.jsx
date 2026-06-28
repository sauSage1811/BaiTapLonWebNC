import { useState, useMemo } from "react";
import editIcon from "../assets/icons/edit.svg";
import deleteIcon from "../assets/icons/delete.svg";

function TablePage() {
    const [tables] = useState([
        { id: 1, tableNumber: "T01", capacity: "2-4", status: "empty", floor: "Tầng 1", area: "Khu trong nhà" },
        { id: 2, tableNumber: "T02", capacity: "2-4", status: "using", floor: "Tầng 1", area: "Khu trong nhà", useTime: "00:45:12" },
        { id: 3, tableNumber: "T03", capacity: "4-6", status: "empty", floor: "Tầng 1", area: "Khu trong nhà" },
        { id: 4, tableNumber: "T04", capacity: "2-4", status: "maintenance", floor: "Tầng 1", area: "Khu trong nhà" },
        { id: 5, tableNumber: "T05", capacity: "4-6", status: "empty", floor: "Tầng 1", area: "Khu trong nhà" },
        { id: 6, tableNumber: "T06", capacity: "2-4", status: "using", floor: "Tầng 1", area: "Khu trong nhà", useTime: "01:12:08" },
        { id: 7, tableNumber: "T07", capacity: "6-8", status: "empty", floor: "Tầng 1", area: "Khu trong nhà" },
        { id: 8, tableNumber: "T08", capacity: "2-4", status: "maintenance", floor: "Tầng 1", area: "Khu trong nhà" },
        { id: 9, tableNumber: "T09", capacity: "2-4", status: "empty", floor: "Tầng 2", area: "Khu ban công" },
        { id: 10, tableNumber: "T10", capacity: "4-6", status: "empty", floor: "Tầng 2", area: "Khu ban công" },
        { id: 11, tableNumber: "T11", capacity: "2-4", status: "using", floor: "Tầng 2", area: "Khu ban công", useTime: "00:22:35" },
    ]);

    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 8;

    // Calculate stats from data
    const stats = useMemo(() => {
        const total = tables.length;
        const empty = tables.filter((t) => t.status === "empty").length;
        const using = tables.filter((t) => t.status === "using").length;
        const maintenance = tables.filter((t) => t.status === "maintenance").length;
        return { total, empty, using, maintenance };
    }, [tables]);

    // Pagination
    const totalPages = Math.ceil(tables.length / perPage);
    const paginatedTables = tables.slice((currentPage - 1) * perPage, currentPage * perPage);
    const tableSlots = Array.from({ length: perPage }, (_, index) => paginatedTables[index] || null);

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
            {/* Header */}
            <div className="page-header">
                <div className="page-header-text">
                    <h1>Quản lý bàn</h1>
                    <p>Theo dõi và quản lý trạng thái bàn trong quán</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary btn-with-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.5 2v6h-6" /><path d="M2.5 22v-6h6" /><path d="M2 11.5a10 10 0 0 1 18.8-4.3" /><path d="M22 12.5a10 10 0 0 1-18.8 4.2" />
                        </svg>
                        Refresh
                    </button>
                    <button className="btn btn-primary">
                        <span className="btn-plus-icon">+</span> Thêm bàn
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
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

            {/* Table Cards Grid */}
            <div className="tb-card-grid">
                {tableSlots.map((table, index) => (
                    table ? (
                    <div key={table.id} className={`tb-card ${getStatusClass(table.status)}`}>
                        {/* Card header: icon + name + badge */}
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

                        {/* Card body: location, capacity, time */}
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

                        {/* Card footer: actions */}
                        <div className="tb-card-footer">
                            <button className="btn btn-sm btn-edit">
                                <img src={editIcon} alt="" className="btn-icon" aria-hidden="true" />
                                Sửa
                            </button>
                            <button className="btn btn-sm btn-delete">
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="tb-pagination">
                    <span className="tb-pagination-info">
                        Hiển thị {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, tables.length)} trong tổng số {tables.length} bàn
                    </span>
                    <div className="tb-pagination-controls">
                        <button
                            className="tb-page-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            aria-label="Trang trước"
                        >
                            ‹
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                className={`tb-page-btn${currentPage === page ? " tb-page-active" : ""}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            className="tb-page-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            aria-label="Trang sau"
                        >
                            ›
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TablePage;
