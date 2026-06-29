import { supabaseAdmin } from "@/app/lib/supabase-admin";
import AddGuestButton from "@/app/dashboard/AddGuestButton";
import GuestTable from "@/app/dashboard/GuestTable";

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

  const totalInvited = rows.reduce((sum, r) => sum + r.max_guests, 0);
  const totalResponded = rows.filter((r) => r.has_rsvped).length;
  const totalAttending = rows
    .filter((r) => r.rsvp?.attending === true)
    .reduce((sum, r) => sum + (r.rsvp?.guest_names?.length ?? r.max_guests), 0);
  const totalDeclined = rows
    .filter((r) => r.rsvp?.attending === false)
    .reduce((sum, r) => sum + r.max_guests, 0);
  const totalPending = rows
    .filter((r) => !r.has_rsvped)
    .reduce((sum, r) => sum + r.max_guests, 0);

  const stats = [
    { label: "Invited", value: totalInvited, sub: "total people invited" },
    { label: "Responded", value: totalResponded, sub: "of those invited" },
    { label: "Attending", value: totalAttending, sub: "people attending" },
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
        <GuestTable rows={rows} />
      </div>
    </div>
  );
}
