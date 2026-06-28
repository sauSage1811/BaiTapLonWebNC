import editIcon from "../assets/icons/edit.svg";
import deleteIcon from "../assets/icons/delete.svg";

function CategoryPage() {
    const sampleCategories = [
        { id: 1, name: "Cà phê", description: "Các loại cà phê truyền thống và hiện đại" },
        { id: 2, name: "Trà", description: "Trà nóng, trà đá, trà sữa các loại" },
        { id: 3, name: "Nước ép", description: "Nước ép trái cây tươi nguyên chất" },
        { id: 4, name: "Sinh tố", description: "Sinh tố trái cây, sinh tố rau củ" },
        { id: 5, name: "Đá xay", description: "Đá xay các vị thơm ngon" },
        { id: 6, name: "Topping", description: "Topping thêm cho đồ uống" },
    ];

    return (
        <div>
            <div className="page-header">
                <div className="page-header-text">
                    <h1>📋 Quản lý danh mục</h1>
                    <p>Quản lý danh mục đồ uống: cafe, trà, nước ép...</p>
                </div>
                <button className="btn btn-primary">
                    ➕ Thêm danh mục
                </button>
            </div>

            <div className="card animate-in">
                <div className="card-header">
                    <h2>Danh sách danh mục ({sampleCategories.length})</h2>
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
                            {sampleCategories.map((cat, index) => (
                                <tr key={cat.id}>
                                    <td className="col-stt">{index + 1}</td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: "#3f2a1d" }}>
                                            {cat.name}
                                        </span>
                                    </td>
                                    <td>{cat.description}</td>
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

export default CategoryPage;
