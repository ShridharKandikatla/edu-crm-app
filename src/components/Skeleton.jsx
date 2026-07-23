export function SkeletonBlock({ width = '100%', height = '20px', style = {}, className = '' }) {
  return (
    <div
      className={`rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[skeleton-shimmer_1.5s_ease-in-out_infinite] ${className}`}
      style={{ width, height, ...style }}
    />
  );
}

export function SkeletonText({ lines = 3, gap = '8px', lineHeight = '14px' }) {
  return (
    <div className="flex flex-col" style={{ gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[skeleton-shimmer_1.5s_ease-in-out_infinite]"
          style={{
            width: i === lines - 1 ? '60%' : '100%',
            height: lineHeight,
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ style = {} }) {
  return (
    <div
      className="p-5 rounded-xl border border-gray-200 bg-white"
      style={style}
    >
      <SkeletonBlock width="40%" height="14px" style={{ marginBottom: '12px' }} />
      <SkeletonBlock width="60%" height="28px" style={{ marginBottom: '8px' }} />
      <SkeletonBlock width="30%" height="12px" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonBlock
              key={c}
              width={c === 0 ? '40%' : c === cols - 1 ? '15%' : `${25 - c * 3}%`}
              height="16px"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
