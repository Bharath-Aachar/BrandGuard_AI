export default function MetricCard({ label, value, suffix, detail, children }: {
  label: string; value: string | number; suffix?: string; detail?: string; children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
        {value}
        {suffix && <span className="ml-1 text-base font-normal text-muted">{suffix}</span>}
      </p>
      <div className="mt-2 min-h-5 text-xs text-muted">{children ?? detail}</div>
    </div>
  );
}
