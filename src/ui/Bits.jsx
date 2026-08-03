export function Card({ className = "", children, ...rest }) {
  return (
    <div
      className={`rounded-2xl border border-line bg-white ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SectionHead({ title, action = "View All", onAction, right }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-[15px] font-bold">{title}</h3>
      {right ??
        (action ? (
          <button
            onClick={onAction}
            className="text-[13px] font-semibold text-brand-600 hover:underline"
          >
            {action}
          </button>
        ) : null)}
    </div>
  );
}

export function Chip({ active, children, className = "", ...rest }) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition ${
        active
          ? "bg-brand-600 text-white"
          : "border border-line bg-white text-ink hover:bg-neutral-50"
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Pill({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

export function Tabs({ items, value, onChange, className = "" }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {items.map((it) => (
        <button
          key={it}
          onClick={() => onChange?.(it)}
          className={`relative px-4 py-2.5 text-[14px] font-semibold transition ${
            value === it ? "text-brand-600" : "text-muted hover:text-ink"
          }`}
        >
          {it}
          {value === it && (
            <span className="absolute inset-x-3 -bottom-px h-[2.5px] rounded-full bg-brand-600" />
          )}
        </button>
      ))}
    </div>
  );
}

export function Progress({ value, className = "", bar = "bg-brand-600" }) {
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-brand-100 ${className}`}>
      <div className={`h-full rounded-full ${bar}`} style={{ width: `${value}%` }} />
    </div>
  );
}
