import type { Activity } from "@/types";
import { formatDate } from "@/lib/risk";

export default function ActivityList({ items }: { items: Activity[] }) {
  return (
    <section aria-labelledby="activity" className="rounded-lg border border-line bg-surface p-5">
      <h2 id="activity" className="text-base font-semibold">Recent Activity</h2>
      <p className="mt-0.5 text-xs text-muted">Sample events for the prototype.</p>
      <ul className="mt-4 space-y-3 text-sm">
        {items.map((a) => (
          <li key={a.id} className="flex justify-between gap-4">
            <span>{a.text}</span>
            <time dateTime={a.date} className="shrink-0 text-xs text-muted">{formatDate(a.date)}</time>
          </li>
        ))}
      </ul>
    </section>
  );
}
