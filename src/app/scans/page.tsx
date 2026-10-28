import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import RecentScansTable from "@/components/RecentScansTable";
import { scans } from "@/lib/mock-data";

export default function ScansPage() {
  const sorted = [...scans].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <DashboardLayout>
      <PageHeader title="All Scans" description="Every scan in the sample data. Demo records only." />
      <div className="rounded-lg border border-line bg-surface"><RecentScansTable scans={sorted} emptyHref="/scanner" /></div>
    </DashboardLayout>
  );
}
