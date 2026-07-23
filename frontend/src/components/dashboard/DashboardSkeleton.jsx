function DashboardSkeleton() {
    return (
        <div className="dashboard-grid-skeleton" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, index) => (
                <section className="dash-stat-card" key={index}>
                    <div className="dash-stat-top">
                        <span className="dash-skeleton-avatar" />
                    </div>
                    <span className="dash-skeleton-line" />
                    <span className="dash-skeleton-line short" />
                    <span className="dash-skeleton-line" />
                </section>
            ))}
        </div>
    );
}

export default DashboardSkeleton;
