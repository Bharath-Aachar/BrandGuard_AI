"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileCheck2,
  LayoutDashboard,
  Radar,
  ScanSearch,
  Settings,
  ShieldCheck,
  BookOpenCheck,
  ClipboardCheck,
  UserCheck,
  Database,
} from "lucide-react";
import { useBrandGuard } from "@/context/BrandGuardContext";
import { DEMO_USERS } from "@/lib/workflowStore";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scanner", label: "Content Scanner", icon: ScanSearch },
  { href: "/approvals", label: "Review & Approvals", icon: ClipboardCheck },
  { href: "/threat-radar", label: "Threat Radar", icon: Radar },
  { href: "/brand-guidelines", label: "Brand Guidelines", icon: BookOpenCheck },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/audit-reports", label: "Audit Reports", icon: FileCheck2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, setCurrentUser, storageMode } = useBrandGuard();

  const item = (href: string, label: string, Icon: typeof Settings) => {
    const active = pathname === href || (href === "/scanner" && pathname.startsWith("/scans"));
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
          active ? "bg-accent/15 text-fg font-medium" : "text-muted hover:bg-surface2 hover:text-fg"
        }`}
      >
        <Icon size={16} aria-hidden className={active ? "text-accent" : ""} />
        {label}
      </Link>
    );
  };

  return (
    <nav aria-label="Main" className="flex h-full flex-col px-3 py-5">
      <Link href="/dashboard" className="mb-6 flex items-center gap-2 px-3">
        <ShieldCheck size={20} className="text-accent" aria-hidden />
        <span className="text-[15px] font-semibold tracking-tight">BrandGuard AI</span>
      </Link>

      <div className="flex flex-col gap-0.5">{NAV.map((n) => item(n.href, n.label, n.icon))}</div>

      <div className="mt-auto space-y-3 pt-3 border-t border-line">
        {/* Active Role Switcher for Hackathon Testing */}
        <div className="rounded-lg bg-surface2/60 p-2.5 border border-line text-xs">
          <div className="flex items-center justify-between text-muted mb-1.5 font-medium">
            <span className="flex items-center gap-1.5">
              <UserCheck size={13} className="text-accent" />
              Active Role:
            </span>
            <span className="font-semibold text-fg uppercase tracking-wider text-[10px] px-1.5 py-0.2 rounded bg-accent/20 text-accent">
              {currentUser.role}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 mt-1">
            <button
              onClick={() => setCurrentUser(DEMO_USERS.creator)}
              className={`py-1 px-1.5 rounded text-[11px] font-medium transition-colors ${
                currentUser.role === 'creator'
                  ? 'bg-accent text-white'
                  : 'bg-surface text-muted hover:text-fg'
              }`}
            >
              Creator
            </button>
            <button
              onClick={() => setCurrentUser(DEMO_USERS.reviewer)}
              className={`py-1 px-1.5 rounded text-[11px] font-medium transition-colors ${
                currentUser.role === 'reviewer'
                  ? 'bg-accent text-white'
                  : 'bg-surface text-muted hover:text-fg'
              }`}
            >
              Reviewer
            </button>
          </div>

          <div className="mt-2 pt-2 border-t border-line/60 flex items-center justify-between text-[10px] text-muted">
            <span className="flex items-center gap-1">
              <Database size={11} className={storageMode === 'supabase' ? 'text-emerald-400' : 'text-amber-400'} />
              Storage:
            </span>
            <span className="font-mono">{storageMode === 'supabase' ? 'PostgreSQL' : 'Demo Local'}</span>
          </div>
        </div>

        <div>{item("/settings", "Settings", Settings)}</div>
      </div>
    </nav>
  );
}
