"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShieldCheck, X } from "lucide-react";
import Sidebar from "./Sidebar";

import { AuditModal } from "./AuditModal";
import { useBrandGuard } from "@/context/BrandGuardContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const { isAuditModalOpen, setIsAuditModalOpen, scanResult, currentPolicy } = useBrandGuard();

  // Adjust state during render when route changes without triggering effect cascade
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen lg:pl-60">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-line bg-surface lg:block">
        <Sidebar />
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <ShieldCheck size={18} className="text-accent" aria-hidden /> BrandGuard AI
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          aria-expanded={open}
          className="rounded-md p-2 text-muted hover:bg-surface2 hover:text-fg"
        >
          <Menu size={20} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative h-full w-64 border-r border-line bg-surface">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
              className="absolute right-2 top-3 rounded-md p-2 text-muted hover:text-fg"
            >
              <X size={18} />
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        {children}
      </main>

      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        scanResult={scanResult}
        currentPolicy={currentPolicy}
      />
    </div>
  );
}
