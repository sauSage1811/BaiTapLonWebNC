function formatMoney(value) {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function getInitial(name) {
    return (name || "?").trim().charAt(0).toUpperCase() || "?";
}

function TopProducts({ products, loading, error }) {
    const rows = Array.isArray(products) ? products : [];

    return (
        <section className="dash-card dash-top-products-card">
            <div className="dash-card-header">
                <div>
                    <h2>Sản phẩm bán chạy</h2>
                    <p>Top sản phẩm theo số lượng bán</p>
                </div>
            </div>

            <div className="dash-list-body">
                {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                        <div className="dash-product-row loading" key={index}>
                            <span className="dash-skeleton-avatar" />
                            <span className="dash-skeleton-line" />
                        </div>
                    ))
                ) : error ? (
                    <div className="dash-card-state error">{error}</div>
                ) : rows.length === 0 ? (
                    <div className="dash-card-state">Chưa có dữ liệu sản phẩm bán chạy</div>
                ) : (
                    rows.map((product, index) => (
                        <div className="dash-product-row" key={product.id || product.name}>
                            <div className="dash-product-rank">{index + 1}</div>
                            <div className="dash-product-thumb">
                                {product.image ? <img src={product.image} alt={product.name || "Sản phẩm"} /> : getInitial(product.name)}
                            </div>
                            <div className="dash-product-main">
                                <div className="dash-product-name">{product.name || "Sản phẩm"}</div>
                                <div className="dash-product-category">{product.categoryName || "Chưa phân loại"}</div>
                            </div>
                            <div className="dash-product-metrics">
                                <strong>{Number(product.quantitySold || 0).toLocaleString("vi-VN")}</strong>
                                <span>{formatMoney(product.totalRevenue)}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

export default TopProducts;
