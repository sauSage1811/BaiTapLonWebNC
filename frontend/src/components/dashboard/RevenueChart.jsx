import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

const RANGE_OPTIONS = [
    { value: "7d", label: "7 ngày" },
    { value: "30d", label: "30 ngày" },
    { value: "month", label: "Tháng này" }
];

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function formatChartDate(value) {
    if (!value) return "";
    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit"
    });
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="dash-chart-tooltip">
            <div>{formatChartDate(label)}</div>
            <strong>{formatMoney(payload[0]?.value)}</strong>
        </div>
    );
}

function RevenueChart({ data, range, onRangeChange, loading, error }) {
    const rows = Array.isArray(data) ? data : [];

    return (
        <section className="dash-card dash-revenue-card">
            <div className="dash-card-header">
                <div>
                    <h2>Phân tích doanh thu</h2>
                    <p>Doanh thu từ các đơn đã thanh toán</p>
                </div>
                <div className="dash-segmented" aria-label="Chọn khoảng thời gian doanh thu">
                    {RANGE_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={range === option.value ? "active" : ""}
                            onClick={() => onRangeChange(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="dash-chart-body">
                {loading ? (
                    <div className="dash-chart-loading">
                        <span className="dash-skeleton-line chart-line" />
                        <span className="dash-skeleton-line chart-line wide" />
                        <span className="dash-skeleton-line chart-line" />
                    </div>
                ) : error ? (
                    <div className="dash-card-state error">{error}</div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={rows} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5e34" stopOpacity={0.24} />
                                    <stop offset="95%" stopColor="#8b5e34" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#ede5d5" strokeDasharray="4 4" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatChartDate}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#78716c", fontSize: 12 }}
                                minTickGap={18}
                            />
                            <YAxis
                                tickFormatter={(value) => `${Math.round(Number(value || 0) / 1000)}k`}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#78716c", fontSize: 12 }}
                                width={44}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#8b5e34"
                                strokeWidth={3}
                                fill="url(#revenueFill)"
                                dot={{ r: 3, fill: "#8b5e34", stroke: "#ffffff", strokeWidth: 2 }}
                                activeDot={{ r: 5, fill: "#523828", stroke: "#ffffff", strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </section>
    );
}

export default RevenueChart;
