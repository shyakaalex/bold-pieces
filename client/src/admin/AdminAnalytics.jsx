import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { adminClient } from "../lib/api";
import { formatRwf } from "../utils/format";
import "../styles/admin-orders.css";
import "../styles/admin-analytics.css";

const CHANNEL_COLORS = {
  "Online Store": "#1b4332",
  Instagram: "#c9a84c",
  WhatsApp: "#5c7a6a",
  Other: "#d4cfc4",
};

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 6);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

function TrendLine({ change }) {
  if (change === undefined || change === null) return <span className="orders-kpi__trend">—</span>;
  const up = change >= 0;
  return (
    <span className={`orders-kpi__trend ${up ? "orders-kpi__trend--up" : "orders-kpi__trend--down"}`}>
      {up ? "↑" : "↓"} {Math.abs(change).toFixed(1)}% vs previous period
    </span>
  );
}

function KpiIcon({ children }) {
  return <span className="orders-kpi__icon">{children}</span>;
}

function LineChart({ series, valueKey, maxValue, peakLabel }) {
  if (!series?.length) {
    return <p className="analytics-empty">No data for this period.</p>;
  }

  const max = maxValue || Math.max(...series.map((d) => d[valueKey]), 1);
  const coords = series.map((d, i) => {
    const x = series.length === 1 ? 50 : (i / (series.length - 1)) * 100;
    const y = 100 - (d[valueKey] / max) * 88 - 6;
    return { x, y, ...d };
  });

  const linePoints = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const areaPoints = `0,100 ${linePoints} 100,100`;
  const peak = coords.reduce((best, c) => (c[valueKey] > (best?.[valueKey] || 0) ? c : best), coords[0]);

  return (
    <div className="analytics-line-wrap">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="analytics-line-chart" aria-hidden="true">
        <defs>
          <linearGradient id="analyticsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1b4332" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1b4332" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon fill="url(#analyticsFill)" points={areaPoints} />
        <polyline fill="none" stroke="#1b4332" strokeWidth="1.2" vectorEffect="non-scaling-stroke" points={linePoints} />
        {coords.map((c) => (
          <circle key={c.date} cx={c.x} cy={c.y} r="1.8" fill="#1b4332" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="analytics-line-labels">
        {series.map((d) => (
          <span key={d.date}>{d.label}</span>
        ))}
      </div>
      {peak && peak[valueKey] > 0 ? (
        <p className="analytics-line-peak">
          Peak on <strong>{peak.label}</strong>
          {peakLabel === "revenue" ? `: ${formatRwf(peak.revenue)}` : `: ${peak.orders} orders`}
        </p>
      ) : null}
    </div>
  );
}

function DonutChart({ segments, centerLabel, centerValue, formatSegmentValue }) {
  if (!segments?.length) {
    return <p className="analytics-empty">No channel data yet.</p>;
  }

  const formatVal = formatSegmentValue || ((v) => formatRwf(v));

  let cursor = 0;
  const gradientParts = segments.map((seg) => {
    const start = cursor;
    cursor += seg.percent;
    const color = CHANNEL_COLORS[seg.name] || "#d4cfc4";
    return `${color} ${start}% ${cursor}%`;
  });

  return (
    <div className="analytics-donut-wrap">
      <div
        className="analytics-donut"
        style={{ background: `conic-gradient(${gradientParts.join(", ")})` }}
        role="img"
        aria-label="Sales by channel chart"
      >
        <div className="analytics-donut__hole">
          <strong>{centerValue}</strong>
          {centerLabel}
        </div>
      </div>
      <ul className="analytics-legend">
        {segments.map((seg) => (
          <li key={seg.name}>
            <span className="analytics-legend__label">
              <span className="analytics-legend__dot" style={{ background: CHANNEL_COLORS[seg.name] || "#d4cfc4" }} />
              {seg.name}
            </span>
            <span className="analytics-legend__meta">
              {seg.percent.toFixed(1)}%
              <br />
              {formatVal(seg.revenue ?? seg.count ?? 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminAnalytics() {
  const token = localStorage.getItem("bp_admin_token");
  const client = useMemo(() => adminClient(token), [token]);
  const [range, setRange] = useState(defaultRange);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(() => {
    setLoading(true);
    client
      .get(`/analytics/report?from=${range.from}&to=${range.to}`)
      .then((r) => setReport(r.data))
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [client, range.from, range.to]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const maxCategoryRevenue = useMemo(
    () => Math.max(...(report?.revenueByCategory?.map((c) => c.revenue) || [1]), 1),
    [report]
  );

  const customerSegments = useMemo(() => {
    if (!report?.customers) return [];
    const { total, returning, new: newCount } = report.customers;
    const denom = Math.max(returning + newCount, 1);
    return [
      { name: "Returning", count: returning, percent: (returning / denom) * 100, color: "#1b4332" },
      { name: "New", count: newCount, percent: (newCount / denom) * 100, color: "#c9a84c" },
    ];
  }, [report]);

  const exportReport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bold-pieces-analytics-${range.from}-${range.to}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-page--orders">
      <header className="analytics-page-header">
        <div className="orders-page-header__title">
          <h1>Analytics</h1>
          <p className="orders-breadcrumb">
            <Link to="/admin">Dashboard</Link> &gt; <span>Analytics</span>
          </p>
        </div>
        <div className="analytics-page-header__actions">
          <div className="analytics-date-range">
            <input
              type="date"
              value={range.from}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
              aria-label="From date"
            />
            <span>–</span>
            <input
              type="date"
              value={range.to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
              aria-label="To date"
            />
          </div>
          <button type="button" className="btn-outline" onClick={exportReport} disabled={!report}>
            Export Report
          </button>
        </div>
      </header>

      {loading ? (
        <p className="analytics-empty">Loading analytics…</p>
      ) : !report ? (
        <p className="analytics-empty">Could not load analytics. Check your connection and try again.</p>
      ) : (
        <>
          <section className="analytics-kpi-grid" aria-label="Key metrics">
            <article className="orders-kpi">
              <p className="orders-kpi__label">Total Revenue</p>
              <p className="orders-kpi__value">{formatRwf(report.kpis.revenue.value)}</p>
              <KpiIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </KpiIcon>
              <TrendLine change={report.kpis.revenue.change} />
            </article>
            <article className="orders-kpi">
              <p className="orders-kpi__label">Total Orders</p>
              <p className="orders-kpi__value">{report.kpis.orders.value}</p>
              <KpiIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6h15l-1.5 9h-12L6 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </KpiIcon>
              <TrendLine change={report.kpis.orders.change} />
            </article>
            <article className="orders-kpi">
              <p className="orders-kpi__label">Average Order Value</p>
              <p className="orders-kpi__value">{formatRwf(report.kpis.averageOrderValue.value)}</p>
              <KpiIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 8h16v10H4V8Z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </KpiIcon>
              <TrendLine change={report.kpis.averageOrderValue.change} />
            </article>
            <article className="orders-kpi">
              <p className="orders-kpi__label">Payment Success Rate</p>
              <p className="orders-kpi__value">{report.kpis.conversionRate.value.toFixed(2)}%</p>
              <KpiIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </KpiIcon>
              <TrendLine change={report.kpis.conversionRate.change} />
            </article>
          </section>

          <section className="analytics-charts-row">
            <article className="analytics-card">
              <div className="analytics-card__head">
                <h2>Revenue Over Time</h2>
                <span className="analytics-card__link">Last {report.range.days} days</span>
              </div>
              <LineChart
                series={report.revenueByDay}
                valueKey="revenue"
                maxValue={report.maxRevenue}
                peakLabel="revenue"
              />
            </article>
            <article className="analytics-card">
              <div className="analytics-card__head">
                <h2>Orders Over Time</h2>
                <span className="analytics-card__link">Last {report.range.days} days</span>
              </div>
              <LineChart
                series={report.ordersByDay}
                valueKey="orders"
                maxValue={report.maxOrders}
                peakLabel="orders"
              />
            </article>
          </section>

          <section className="analytics-row-3">
            <article className="analytics-card">
              <div className="analytics-card__head">
                <h2>Sales by Channel</h2>
                <Link to="/admin/orders" className="analytics-card__link">
                  View report
                </Link>
              </div>
              <DonutChart
                segments={report.salesByChannel}
                centerValue={formatRwf(report.kpis.revenue.value).replace("RWF ", "")}
                centerLabel="Total RWF"
              />
            </article>

            <article className="analytics-card">
              <div className="analytics-card__head">
                <h2>Top Selling Products</h2>
                <Link to="/admin/products" className="analytics-card__link">
                  View all
                </Link>
              </div>
              {report.topProducts.length === 0 ? (
                <p className="analytics-empty">No product sales in this period.</p>
              ) : (
                <ol className="analytics-top-products">
                  {report.topProducts.map((product, index) => (
                    <li key={product.name}>
                      <span className="analytics-top-products__rank">{index + 1}</span>
                      <img src={product.image} alt="" className="analytics-top-products__thumb" />
                      <div className="analytics-top-products__info">
                        <strong>{product.name}</strong>
                        <span>{product.qty} sold · {formatRwf(product.revenue)}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </article>

            <article className="analytics-card">
              <div className="analytics-card__head">
                <h2>Customer Overview</h2>
                <Link to="/admin/customers" className="analytics-card__link">
                  View all
                </Link>
              </div>
              <DonutChart
                segments={customerSegments.map((s) => ({
                  name: s.name,
                  revenue: s.count,
                  percent: s.percent,
                }))}
                centerValue={String(report.customers.total)}
                centerLabel="Total customers"
                formatSegmentValue={(v) => `${v} customers`}
              />
              <ul className="analytics-legend" style={{ marginTop: 12 }}>
                {customerSegments.map((s) => (
                  <li key={s.name}>
                    <span className="analytics-legend__label">
                      <span className="analytics-legend__dot" style={{ background: s.color }} />
                      {s.name} customers
                    </span>
                    <span className="analytics-legend__meta">
                      {s.count} ({s.percent.toFixed(1)}%)
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <section className="analytics-charts-row">
            <article className="analytics-card">
              <div className="analytics-card__head">
                <h2>Revenue by Category</h2>
              </div>
              {report.revenueByCategory.length === 0 ? (
                <p className="analytics-empty">No category breakdown yet.</p>
              ) : (
                <div className="analytics-bars">
                  {report.revenueByCategory.map((cat) => (
                    <div key={cat.name} className="analytics-bar-row">
                      <span>{cat.name}</span>
                      <div className="analytics-bar-row__track">
                        <div
                          className="analytics-bar-row__fill"
                          style={{ width: `${(cat.revenue / maxCategoryRevenue) * 100}%` }}
                        />
                      </div>
                      <span className="analytics-bar-row__value">{formatRwf(cat.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="analytics-card">
              <div className="analytics-card__head">
                <h2>Key Insights</h2>
              </div>
              {report.insights.length === 0 ? (
                <p className="analytics-empty">Place orders to generate insights.</p>
              ) : (
                <ul className="analytics-insights">
                  {report.insights.map((item) => (
                    <li key={item.text}>
                      <span className="analytics-insights__icon" aria-hidden="true">
                        {item.icon === "peak" ? "📈" : item.icon === "channel" ? "🛍" : "💡"}
                      </span>
                      {item.text}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </section>
        </>
      )}
    </div>
  );
}
