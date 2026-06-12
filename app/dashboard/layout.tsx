import { logout } from "@/app/actions/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-cream-dark bg-card px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="font-serif text-xs italic text-rose">Wedding RSVP</p>
            <h1 className="font-serif text-lg font-semibold text-warm-dark">
              Guest Dashboard
            </h1>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-cream-dark bg-cream px-4 py-2 text-sm text-warm-muted transition hover:border-warm-muted hover:text-warm-dark"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
