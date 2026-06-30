import { supabaseAdmin } from "@/app/lib/supabase-admin";
import GuestDashboard from "@/app/dashboard/GuestDashboard";

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

  return <GuestDashboard rows={rows} />;
}
