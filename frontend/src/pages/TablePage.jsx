import editIcon from "../assets/icons/edit.svg";
import deleteIcon from "../assets/icons/delete.svg";
import searchIcon from "../assets/icons/search.svg";

function TablePage() {
    const sampleTables = [
        { id: 1, tableNumber: "01", capacity: 2, status: "available", floor: "Tầng 1" },
        { id: 2, tableNumber: "02", capacity: 2, status: "occupied", floor: "Tầng 1" },
        { id: 3, tableNumber: "03", capacity: 4, status: "available", floor: "Tầng 1" },
        { id: 4, tableNumber: "04", capacity: 4, status: "occupied", floor: "Tầng 1" },
        { id: 5, tableNumber: "05", capacity: 6, status: "available", floor: "Tầng 2" },
        { id: 6, tableNumber: "06", capacity: 6, status: "available", floor: "Tầng 2" },
        { id: 7, tableNumber: "07", capacity: 8, status: "maintenance", floor: "Tầng 2" },
        { id: 8, tableNumber: "08", capacity: 2, status: "available", floor: "Tầng 1" },
    ];

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "available":
                return "badge-success";
            case "occupied":
                return "badge-warning";
            case "maintenance":
                return "badge-danger";
            default:
                return "badge-default";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "available":
                return "Trống";
            case "occupied":
                return "Đang sử dụng";
            case "maintenance":
                return "Bảo trì";
            default:
                return "Không xác định";
        }
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-header-text">
                    <h1>🪑 Quản lý bàn</h1>
                    <p>Quản lý các bàn, sức chứa, tầng và trạng thái bàn.</p>
                </div>
                <button className="btn btn-primary">
                    ➕ Thêm bàn
                </button>
            </div>

            <div className="page-toolbar">
                <div className="page-toolbar-left">
                    <div className="search-bar">
                        <img src={searchIcon} alt="" className="search-bar-icon" aria-hidden="true" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bàn..."
                        />
                    </div>
                </div>
                <div className="page-toolbar-right">
                    <span style={{ fontSize: 13, color: "#78716c", fontWeight: 500 }}>
                        Tổng: {sampleTables.length} bàn
                    </span>
                </div>
            </div>

            <div className="card animate-in">
                <div className="card-body">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="col-stt">STT</th>
                                <th>Số bàn</th>
                                <th>Sức chứa</th>
                                <th>Tầng</th>
                                <th>Trạng thái</th>
                                <th className="col-actions">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sampleTables.map((table, index) => (
                                <tr key={table.id}>
                                    <td className="col-stt">{index + 1}</td>
                                    <td>
                                        <span className="table-number">Bàn {table.tableNumber}</span>
                                    </td>
                                    <td>
                                        <span className="table-capacity">{table.capacity} chỗ</span>
                                    </td>
                                    <td>
                                        <span className="table-floor">{table.floor}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(table.status)}`}>
                                            {getStatusLabel(table.status)}
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

export default TablePage;
