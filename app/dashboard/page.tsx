import { supabaseAdmin } from "@/app/lib/supabase-admin";
import AddGuestButton from "@/app/dashboard/AddGuestButton";

type Guest = {
  id: string;
  primary_guest_name: string;
  max_guests: number;
  guest_group: string | null;
  has_rsvped: boolean;
  created_at: string;
};

type RSVP = {
  id: string;
  guest_id: string;
  attending: boolean | null;
  guest_names: string[] | null;
  notes: string | null;
  submitted_at: string;
};

type GuestWithRSVP = Guest & { rsvp: RSVP | null };

export default async function DashboardPage() {
  const [{ data: guests }, { data: rsvps }] = await Promise.all([
    supabaseAdmin
      .from("guests")
      .select("id, primary_guest_name, max_guests, guest_group, has_rsvped, created_at")
      .order("primary_guest_name"),
    supabaseAdmin
      .from("rsvps")
      .select("id, guest_id, attending, guest_names, notes, submitted_at"),
  ]);

  const rsvpByGuestId = new Map<string, RSVP>(
    (rsvps ?? []).map((r) => [r.guest_id, r])
  );

  const rows: GuestWithRSVP[] = (guests ?? []).map((g) => ({
    ...g,
    rsvp: rsvpByGuestId.get(g.id) ?? null,
  }));

  const totalInvited = rows.length;
  const totalResponded = rows.filter((r) => r.has_rsvped).length;
  const totalAttending = rows.filter((r) => r.rsvp?.attending === true).length;
  const totalDeclined = rows.filter((r) => r.rsvp?.attending === false).length;
  const totalPending = totalInvited - totalResponded;
  const totalAttendingGuests = rows
    .filter((r) => r.rsvp?.attending === true)
    .reduce((sum, r) => sum + (r.rsvp?.guest_names?.length ?? 1), 0);

  const stats = [
    { label: "Invited", value: totalInvited, sub: "total guests" },
    { label: "Responded", value: totalResponded, sub: "of those invited" },
    { label: "Attending", value: totalAttending, sub: `${totalAttendingGuests} guests total` },
    { label: "Declined", value: totalDeclined, sub: "can't make it" },
    { label: "Pending", value: totalPending, sub: "no response yet" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-1 rounded-2xl border border-cream-dark bg-card px-5 py-4 shadow-sm"
          >
            <span className="text-2xl font-semibold text-warm-dark">
              {s.value}
            </span>
            <span className="text-sm font-medium text-warm-dark">{s.label}</span>
            <span className="text-xs text-warm-muted">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Guest table */}
      <div className="overflow-hidden rounded-2xl border border-cream-dark bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-cream-dark px-6 py-4">
          <h2 className="font-serif text-lg font-medium italic text-warm-dark">
            Guest List
          </h2>
          <AddGuestButton />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-dark bg-cream text-left">
                <th className="px-6 py-3 font-medium text-warm-muted">Name</th>
                <th className="px-4 py-3 font-medium text-warm-muted">Group</th>
                <th className="px-4 py-3 font-medium text-warm-muted">Status</th>
                <th className="px-4 py-3 font-medium text-warm-muted">Party</th>
                <th className="px-4 py-3 font-medium text-warm-muted">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-dark">
              {rows.map((row) => {
                const status = !row.has_rsvped
                  ? "pending"
                  : row.rsvp?.attending === true
                    ? "attending"
                    : "declined";

                return (
                  <tr key={row.id} className="hover:bg-cream/50">
                    <td className="px-6 py-3.5 font-medium text-warm-dark">
                      {row.primary_guest_name}
                      <span className="ml-2 text-xs text-warm-muted">
                        (max {row.max_guests})
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-warm-muted">
                      {row.guest_group ?? "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-4 py-3.5 text-warm-muted">
                      {row.rsvp?.guest_names?.length
                        ? row.rsvp.guest_names.join(", ")
                        : "—"}
                    </td>
                    <td className="max-w-xs px-4 py-3.5 text-warm-muted">
                      {row.rsvp?.notes ?? "—"}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-warm-muted"
                  >
                    No guests yet. Use the &ldquo;Add Guest&rdquo; button above to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "attending" | "declined" }) {
  const styles = {
    pending: "bg-cream-dark text-warm-muted",
    attending: "bg-rose/20 text-rose-dark",
    declined: "bg-warm-muted/15 text-warm-muted",
  };
  const labels = {
    pending: "Pending",
    attending: "Attending",
    declined: "Declined",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
