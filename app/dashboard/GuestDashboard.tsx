"use client";

import { useMemo, useState } from "react";
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

type Status = "pending" | "attending" | "declined";

function getStatus(row: GuestWithRSVP): Status {
  if (!row.has_rsvped) return "pending";
  return row.rsvp?.attending === true ? "attending" : "declined";
}

export default function GuestDashboard({ rows }: { rows: GuestWithRSVP[] }) {
  const [filterGroup, setFilterGroup] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "">("");

  const groups = useMemo(() => {
    const set = new Set<string>();
    for (const row of rows) {
      if (row.guest_group) set.add(row.guest_group);
    }
    return Array.from(set).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    let result = rows;
    if (filterGroup) result = result.filter((r) => r.guest_group === filterGroup);
    if (filterStatus) result = result.filter((r) => getStatus(r) === filterStatus);
    return result;
  }, [rows, filterGroup, filterStatus]);

  const totalInvited = filteredRows.reduce((sum, r) => sum + r.max_guests, 0);
  const totalResponded = filteredRows.filter((r) => r.has_rsvped).length;
  const totalAttending = filteredRows
    .filter((r) => r.rsvp?.attending === true)
    .reduce((sum, r) => sum + (r.rsvp?.guest_names?.length ?? r.max_guests), 0);
  const totalDeclined = filteredRows
    .filter((r) => r.rsvp?.attending === false)
    .reduce((sum, r) => sum + r.max_guests, 0);
  const totalPending = filteredRows
    .filter((r) => !r.has_rsvped)
    .reduce((sum, r) => sum + r.max_guests, 0);

  const stats = [
    { label: "Invited", value: totalInvited, sub: "total people invited" },
    { label: "Responded", value: totalResponded, sub: "of those invited" },
    { label: "Attending", value: totalAttending, sub: "people attending" },
    { label: "Declined", value: totalDeclined, sub: "can't make it" },
    { label: "Pending", value: totalPending, sub: "no response yet" },
  ];

  const isFiltered = !!(filterGroup || filterStatus);

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

        {/* Filter toolbar */}
        <div className="flex flex-wrap items-center gap-4 border-b border-cream-dark px-6 py-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-warm-muted">Group</label>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="rounded-lg border border-cream-dark bg-cream px-3 py-1.5 text-xs text-warm-dark outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/30"
            >
              <option value="">All</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-warm-muted">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as Status | "")}
              className="rounded-lg border border-cream-dark bg-cream px-3 py-1.5 text-xs text-warm-dark outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/30"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="attending">Attending</option>
              <option value="declined">Declined</option>
            </select>
          </div>
          {isFiltered && (
            <button
              onClick={() => {
                setFilterGroup("");
                setFilterStatus("");
              }}
              className="text-xs text-warm-muted underline-offset-2 transition hover:text-warm-dark hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        <GuestTable rows={filteredRows} isFiltered={isFiltered} />
      </div>
    </div>
  );
}
