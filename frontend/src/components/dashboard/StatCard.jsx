function StatCard({ icon, label, value, detail, loading, error }) {
    return (
        <section className="dash-stat-card">
            <div className="dash-stat-top">
                <span className="dash-stat-icon" aria-hidden="true">
                    <img src={icon} alt="" />
                </span>
                {error ? <span className="dash-stat-pill dash-stat-pill-error">Lỗi</span> : null}
            </div>

            <div className="dash-stat-label">{label}</div>
            <div className="dash-stat-value">{loading ? <span className="dash-skeleton-line short" /> : value}</div>
            <div className="dash-stat-detail">{loading ? <span className="dash-skeleton-line" /> : detail}</div>
        </section>
    );
}

export default StatCard;
