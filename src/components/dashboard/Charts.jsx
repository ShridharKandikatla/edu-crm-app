import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  Area, AreaChart,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white',
        padding: '12px 16px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        fontSize: '0.8125rem',
      }}>
        <p style={{ fontWeight: 700, marginBottom: 4, color: '#111827' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#4f46e5', fontWeight: 500 }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function FunnelChart({ data }) {
  if (data.length === 0) {
    return <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>No pipeline data</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barSize={36}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" name="Leads" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SourcePieChart({ data }) {
  if (data.length === 0) {
    return <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>No source data</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '11px' }}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TrendAreaChart({ data }) {
  if (data.length === 0) {
    return <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>No trend data for the last 30 days</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="leads" name="Leads" stroke="#6366f1" fill="url(#colorLeads)" strokeWidth={2} />
        <Area type="monotone" dataKey="converted" name="Converted" stroke="#10b981" fill="url(#colorConverted)" strokeWidth={2} />
        <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" iconSize={8} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
