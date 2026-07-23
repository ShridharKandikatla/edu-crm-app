export default function ChartCard({ title, subtitle, delay = '0s', children }) {
  return (
    <div className="chart-card" style={{ animationDelay: delay }}>
      <div className="chart-card-header">
        <div>
          <div className="chart-card-title">{title}</div>
          {subtitle && <div className="chart-card-subtitle">{subtitle}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}
