export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        <h2 className="page-title">{title}</h2>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {children && <div className="page-header-actions flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}
