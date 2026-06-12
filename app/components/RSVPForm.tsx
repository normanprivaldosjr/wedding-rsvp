"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

// July 28, 2026 11:59 PM Philippine Time (UTC+8)
const RSVP_DEADLINE = new Date("2026-07-28T23:59:00+08:00");

type Guest = {
  id: string;
  primary_guest_name: string;
  max_guests: number;
  has_rsvped: boolean;
};

type Props = {
  guest: Guest;
  onComplete: (attending: boolean) => void;
  onBack: () => void;
};

export default function RSVPForm({ guest, onComplete, onBack }: Props) {
  const isPastDeadline = new Date() > RSVP_DEADLINE;

  const initialNames = Array.from({ length: guest.max_guests }, (_, i) =>
    i === 0 ? guest.primary_guest_name : ""
  );

  const [attending, setAttending] = useState<boolean | null>(null);
  const [guestNames, setGuestNames] = useState<string[]>(initialNames);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateGuestName(index: number, value: string) {
    setGuestNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (attending === null) {
      setError("Please let us know if you'll be attending.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const filledNames = guestNames.filter((n) => n.trim().length > 0);
    const payload = {
      attending,
      guest_names: filledNames,
      notes: notes.trim() || null,
    };

    // Check for an existing RSVP for this guest
    const { data: existing } = await supabase
      .from("rsvps")
      .select("id")
      .eq("guest_id", guest.id)
      .maybeSingle();

    let rsvpError;

    if (existing) {
      // Update the existing row instead of inserting a duplicate
      const { error } = await supabase
        .from("rsvps")
        .update({ ...payload, submitted_at: new Date().toISOString() })
        .eq("id", existing.id);
      rsvpError = error;
    } else {
      const { error } = await supabase
        .from("rsvps")
        .insert({ guest_id: guest.id, ...payload });
      rsvpError = error;
    }

    if (rsvpError) {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
      return;
    }

    await supabase
      .from("guests")
      .update({ has_rsvped: true })
      .eq("id", guest.id);

    onComplete(attending);
  }

  const additionalSlots = guest.max_guests > 1 ? guest.max_guests - 1 : 0;

  const deadlineLabel = RSVP_DEADLINE.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (isPastDeadline) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-4xl">🗓️</span>
        <p className="font-serif text-lg italic text-warm-dark">
          The RSVP deadline has passed.
        </p>
        <p className="text-sm text-warm-muted">
          We stopped accepting responses on {deadlineLabel}. Please reach out to
          us directly if you have questions.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-2 text-sm text-warm-muted underline underline-offset-2 transition hover:text-warm-dark"
        >
          ← Go back
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {guest.has_rsvped && (
        <div className="rounded-xl border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-rose-dark">
          It looks like you&apos;ve already submitted an RSVP. You&apos;re
          welcome to update it below — your previous response will be replaced.
        </div>
      )}

      {/* Attendance */}
      <div className="flex flex-col gap-3">
        <p className="font-serif text-lg italic text-warm-muted">
          Will you be joining us?
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAttending(true)}
            className={`rounded-xl border px-5 py-4 text-center text-sm font-medium transition ${
              attending === true
                ? "border-rose bg-rose text-card shadow-sm"
                : "border-cream-dark bg-card text-warm-dark hover:border-rose hover:bg-rose/10"
            }`}
          >
            <span className="block text-xl mb-1">🥂</span>
            Yes, I&apos;ll be there!
          </button>
          <button
            type="button"
            onClick={() => setAttending(false)}
            className={`rounded-xl border px-5 py-4 text-center text-sm font-medium transition ${
              attending === false
                ? "border-warm-muted bg-warm-muted text-card shadow-sm"
                : "border-cream-dark bg-card text-warm-dark hover:border-warm-muted hover:bg-warm-muted/10"
            }`}
          >
            <span className="block text-xl mb-1">😔</span>
            Sorry, I can&apos;t make it
          </button>
        </div>
      </div>

      {/* Guest names — only when attending */}
      {attending === true && (
        <div className="flex flex-col gap-3">
          <p className="font-serif text-lg italic text-warm-muted">
            {guest.max_guests === 1
              ? "Your name"
              : `Your party (up to ${guest.max_guests} guests)`}
          </p>
          <div className="flex flex-col gap-2.5">
            {/* Primary guest — pre-filled, read-only */}
            <div className="relative">
              <input
                type="text"
                value={guestNames[0]}
                readOnly
                className="w-full rounded-xl border border-cream-dark bg-cream px-5 py-3.5 text-sm text-warm-dark"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-warm-muted">
                You
              </span>
            </div>

            {/* Additional guest name slots */}
            {additionalSlots > 0 &&
              Array.from({ length: additionalSlots }, (_, i) => (
                <input
                  key={i + 1}
                  type="text"
                  value={guestNames[i + 1]}
                  onChange={(e) => updateGuestName(i + 1, e.target.value)}
                  placeholder={`Guest ${i + 2} name (optional)`}
                  className="w-full rounded-xl border border-cream-dark bg-card px-5 py-3.5 text-sm text-warm-dark placeholder-warm-muted outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/30"
                />
              ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="flex flex-col gap-2">
        <label className="font-serif text-lg italic text-warm-muted">
          Any dietary needs or notes?
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Vegetarian, allergies, anything else…"
          rows={3}
          className="w-full resize-none rounded-xl border border-cream-dark bg-card px-5 py-3.5 text-sm text-warm-dark placeholder-warm-muted outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/30"
        />
      </div>

      {error && <p className="text-sm text-rose-dark">{error}</p>}

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-warm-dark py-4 text-sm font-medium text-cream transition hover:bg-warm-dark/80 disabled:opacity-50"
        >
          {isSubmitting
            ? "Sending…"
            : guest.has_rsvped
              ? "Update RSVP"
              : "Send RSVP"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-warm-muted transition hover:text-warm-dark"
        >
          ← Change name
        </button>
      </div>
    </form>
  );
}
