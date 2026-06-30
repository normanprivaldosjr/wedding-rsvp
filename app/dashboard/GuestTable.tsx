"use client";

import { useActionState, useEffect } from "react";
import { useState } from "react";
import {
  updateMaxGuests,
  type UpdateMaxGuestsState,
  updateGroup,
  type UpdateGroupState,
} from "@/app/actions/guests";

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

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    pending: "bg-cream-dark text-warm-muted",
    attending: "bg-rose/20 text-rose-dark",
    declined: "bg-warm-muted/15 text-warm-muted",
  };
  const labels: Record<Status, string> = {
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

export default function GuestTable({ rows }: { rows: GuestWithRSVP[] }) {
  const [selected, setSelected] = useState<GuestWithRSVP | null>(null);
  const [updateState, updateAction, isUpdating] = useActionState<
    UpdateMaxGuestsState,
    FormData
  >(updateMaxGuests, null);

  const [groupState, groupAction, isUpdatingGroup] = useActionState<
    UpdateGroupState,
    FormData
  >(updateGroup, null);

  useEffect(() => {
    if (updateState && "success" in updateState) {
      setSelected(null);
    }
  }, [updateState]);

  useEffect(() => {
    if (groupState && "success" in groupState) {
      setSelected(null);
    }
  }, [groupState]);

  return (
    <>
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
              const status = getStatus(row);
              return (
                <tr
                  key={row.id}
                  onClick={() => setSelected(row)}
                  className="cursor-pointer hover:bg-cream/50"
                >
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

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-warm-dark/40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-cream-dark bg-card p-8 shadow-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-semibold italic text-warm-dark">
                  {selected.primary_guest_name}
                </h2>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={getStatus(selected)} />
                  {selected.guest_group && (
                    <span className="text-xs text-warm-muted">
                      {selected.guest_group}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="shrink-0 rounded-lg p-1 text-warm-muted transition hover:text-warm-dark"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-warm-muted">
                  Party Members
                </p>
                {selected.rsvp?.guest_names?.length ? (
                  <ul className="flex flex-col gap-1.5">
                    {selected.rsvp.guest_names.map((name, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-warm-dark"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose/20 text-xs font-medium text-rose-dark">
                          {i + 1}
                        </span>
                        {name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-warm-muted">
                    {selected.has_rsvped
                      ? "No party members listed."
                      : "No response yet."}
                  </p>
                )}
              </div>

              {selected.rsvp?.notes && (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-warm-muted">
                    Notes
                  </p>
                  <p className="text-sm text-warm-dark">{selected.rsvp.notes}</p>
                </div>
              )}

              <div className="border-t border-cream-dark pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-warm-muted">
                  Max Party Size
                </p>
                <form action={updateAction} className="flex items-center gap-2">
                  <input type="hidden" name="guest_id" value={selected.id} />
                  <input
                    key={selected.id}
                    name="max_guests"
                    type="number"
                    min={1}
                    max={20}
                    defaultValue={selected.max_guests}
                    className="w-20 rounded-xl border border-cream-dark bg-cream px-3 py-2 text-sm text-warm-dark outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/30"
                  />
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="rounded-xl bg-warm-dark px-4 py-2 text-sm font-medium text-cream transition hover:bg-warm-dark/80 disabled:opacity-50"
                  >
                    {isUpdating ? "Saving…" : "Save"}
                  </button>
                  {updateState && "error" in updateState && (
                    <span className="text-xs text-rose-dark">
                      {updateState.error}
                    </span>
                  )}
                </form>
                {selected.rsvp?.submitted_at && (
                  <p className="mt-3 text-xs text-warm-muted">
                    Responded{" "}
                    {new Date(selected.rsvp.submitted_at).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="border-t border-cream-dark pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-warm-muted">
                  Group
                </p>
                <form action={groupAction} className="flex items-center gap-2">
                  <input type="hidden" name="guest_id" value={selected.id} />
                  <input
                    key={selected.id}
                    name="guest_group"
                    type="text"
                    defaultValue={selected.guest_group ?? ""}
                    placeholder="e.g. BRIDE'S SIDE"
                    className="flex-1 rounded-xl border border-cream-dark bg-cream px-3 py-2 text-sm text-warm-dark outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/30"
                  />
                  <button
                    type="submit"
                    disabled={isUpdatingGroup}
                    className="rounded-xl bg-warm-dark px-4 py-2 text-sm font-medium text-cream transition hover:bg-warm-dark/80 disabled:opacity-50"
                  >
                    {isUpdatingGroup ? "Saving…" : "Save"}
                  </button>
                  {groupState && "error" in groupState && (
                    <span className="text-xs text-rose-dark">
                      {groupState.error}
                    </span>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
