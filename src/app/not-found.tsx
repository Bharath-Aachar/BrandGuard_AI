import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted">The page or scan you requested doesn&apos;t exist.</p>
      <Link href="/dashboard" className="mt-4 inline-block text-sm text-accent hover:underline">Go to dashboard</Link>
    </div>
  );
}
