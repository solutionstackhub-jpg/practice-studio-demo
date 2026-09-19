export function BarChart({
  values, labels, height = 132,
}: { values: number[]; labels: string[]; height?: number }) {
  const top = Math.ceil(Math.max(...values, 1) / 50) * 50;
  return (
    <div>
      <div className="flex gap-3">
        <div className="flex flex-col justify-between py-[1px] text-[10.5px] tabular-nums text-faint" style={{ height }}>
          <span>{top}</span><span>{Math.round(top / 2)}</span><span>0</span>
        </div>
        <div className="relative flex-1" style={{ height }}>
          {[0, 50, 100].map((f) => (
            <div key={f} className="absolute inset-x-0 border-t border-line" style={{ top: `${f}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-[3px]">
            {values.map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-[2px] bg-gold"
                style={{ height: `${(v / top) * 100}%`, opacity: 0.5 + (i / values.length) * 0.5 }}
                title={`${v} recordings`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-2 flex justify-between pl-9 text-[10.5px] text-faint">
        {labels.map((l) => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}

export function LineChart({
  values, labels, height = 132,
}: { values: number[]; labels: string[]; height?: number }) {
  const max = Math.ceil(Math.max(...values) / 5) * 5 || 5;
  const step = 100 / (values.length - 1);
  const pos = values.map((v, i) => ({ x: i * step, y: (1 - v / max) * 100 }));
  const d = pos.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

  return (
    <div>
      <div className="flex gap-3">
        <div className="flex flex-col justify-between py-[1px] text-[10.5px] tabular-nums text-faint" style={{ height }}>
          <span>{max}</span><span>{max / 2}</span><span>0</span>
        </div>
        <div className="relative flex-1" style={{ height }}>
          {[0, 50, 100].map((f) => (
            <div key={f} className="absolute inset-x-0 border-t border-line" style={{ top: `${f}%` }} />
          ))}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${d} L100,100 L0,100 Z`} fill="url(#lc-fill)" />
            <path d={d} fill="none" stroke="var(--color-gold)" strokeWidth="2"
              vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          {pos.map((p, i) => (
            <span
              key={i}
              title={`${values[i]} filler words`}
              className="absolute h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold bg-surface"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            />
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between pl-9 text-[10.5px] text-faint">
        {labels.map((l) => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}
