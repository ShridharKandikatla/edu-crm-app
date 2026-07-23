import { HiOutlineArrowUp, HiOutlineArrowDown } from 'react-icons/hi';

export default function KPICard({ label, value, change, icon: Icon, variant, footer, isText, index }) {
  return (
    <div
      className={`kpi-card ${variant}`}
      style={{ animationDelay: `${index * 0.08}s` }}
      aria-label={`${label}: ${isText ? value : value.toLocaleString()}`}
    >
      <div className="kpi-header">
        <div className={`kpi-icon ${variant}`}>
          <Icon />
        </div>
        <div className={`kpi-trend ${change >= 0 ? 'up' : 'down'}`}>
          {change >= 0 ? <HiOutlineArrowUp size={12} /> : <HiOutlineArrowDown size={12} />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="kpi-value">{isText ? value : value.toLocaleString()}</div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-footer">{footer}</div>
    </div>
  );
}
