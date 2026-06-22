function TablePage() {
    // Dữ liệu mẫu cho UI
    const sampleTables = [
        { id: 1, name: "Bàn 01", status: "empty" },
        { id: 2, name: "Bàn 02", status: "using" },
        { id: 3, name: "Bàn 03", status: "empty" },
        { id: 4, name: "Bàn 04", status: "using" },
        { id: 5, name: "Bàn 05", status: "empty" },
        { id: 6, name: "Bàn 06", status: "empty" },
        { id: 7, name: "Bàn 07", status: "using" },
        { id: 8, name: "Bàn 08", status: "empty" },
        { id: 9, name: "Bàn 09", status: "empty" },
        { id: 10, name: "Bàn 10", status: "using" },
        { id: 11, name: "Bàn 11", status: "empty" },
        { id: 12, name: "Bàn 12", status: "empty" },
    ];

    const statusLabel = {
        empty: "Bàn trống",
        using: "Đang sử dụng",
    };

    const emptyCount = sampleTables.filter(t => t.status === "empty").length;
    const usingCount = sampleTables.filter(t => t.status === "using").length;

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-text">
                    <h1>🪑 Quản lý bàn</h1>
                    <p>Quản lý trạng thái bàn trống và bàn đang sử dụng trong quán.</p>
                </div>
                <button className="btn btn-primary">
                    ➕ Thêm bàn
                </button>
            </div>

            {/* Summary badges */}
            <div className="page-toolbar" style={{ marginBottom: 24 }}>
                <div className="page-toolbar-left">
                    <span className="badge badge-empty">🟢 Trống: {emptyCount}</span>
                    <span className="badge badge-using">🟠 Đang dùng: {usingCount}</span>
                    <span className="badge badge-info">📊 Tổng: {sampleTables.length}</span>
                </div>
            </div>

            {/* Table Grid */}
            <div className="table-grid">
                {sampleTables.map((table) => (
                    <div
                        key={table.id}
                        className={`table-card animate-in status-${table.status}`}
                    >
                        <div className="table-card-icon">
                            {table.status === "empty" ? "🪑" : "☕"}
                        </div>
                        <div className="table-card-name">{table.name}</div>
                        <div className="table-card-status">
                            <span className={`badge badge-${table.status}`}>
                                {table.status === "empty" ? "🟢" : "🟠"} {statusLabel[table.status]}
                            </span>
                        </div>
                        <div className="table-card-actions">
                            <button className="btn btn-sm btn-edit">✏️ Sửa</button>
                            <button className="btn btn-sm btn-delete">🗑️ Xóa</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TablePage;