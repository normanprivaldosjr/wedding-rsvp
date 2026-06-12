"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addGuest, type AddGuestState } from "@/app/actions/guests";

export default function AddGuestButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<AddGuestState, FormData>(
    addGuest,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Close and reset on success
  useEffect(() => {
    if (state && "success" in state) {
      setIsOpen(false);
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-xl bg-warm-dark px-4 py-2.5 text-sm font-medium text-cream transition hover:bg-warm-dark/80"
      >
        + Add Guest
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-warm-dark/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md rounded-2xl border border-cream-dark bg-card p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="font-serif text-xl font-semibold italic text-warm-dark">
                Add a Guest
              </h2>
              <p className="mt-1 text-sm text-warm-muted">
                An invitation code will be generated automatically.
              </p>
            </div>

            <form ref={formRef} action={formAction} className="flex flex-col gap-5">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="primary_guest_name"
                  className="text-xs font-medium uppercase tracking-wide text-warm-muted"
                >
                  Full Name <span className="text-rose-dark">*</span>
                </label>
                <input
                  id="primary_guest_name"
                  name="primary_guest_name"
                  type="text"
                  required
                  placeholder="e.g. Maria Santos"
                  className="rounded-xl border border-cream-dark bg-cream px-4 py-3 text-sm text-warm-dark placeholder-warm-muted outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/30"
                />
              </div>

              {/* Max guests */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="max_guests"
                  className="text-xs font-medium uppercase tracking-wide text-warm-muted"
                >
                  Max Guests <span className="text-rose-dark">*</span>
                </label>
                <input
                  id="max_guests"
                  name="max_guests"
                  type="number"
                  min={1}
                  max={20}
                  defaultValue={1}
                  required
                  className="rounded-xl border border-cream-dark bg-cream px-4 py-3 text-sm text-warm-dark outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/30"
                />
                <p className="text-xs text-warm-muted">
                  Includes the primary guest. Set to 2 if they may bring a plus-one.
                </p>
              </div>

              {/* Group */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="guest_group"
                  className="text-xs font-medium uppercase tracking-wide text-warm-muted"
                >
                  Group <span className="text-warm-muted/60">(optional)</span>
                </label>
                <input
                  id="guest_group"
                  name="guest_group"
                  type="text"
                  placeholder="e.g. Bride's Side, College Friends"
                  className="rounded-xl border border-cream-dark bg-cream px-4 py-3 text-sm text-warm-dark placeholder-warm-muted outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/30"
                />
              </div>

              {state && "error" in state && (
                <p className="text-sm text-rose-dark">{state.error}</p>
              )}

              <div className="mt-1 flex gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-xl bg-warm-dark py-3 text-sm font-medium text-cream transition hover:bg-warm-dark/80 disabled:opacity-50"
                >
                  {isPending ? "Adding…" : "Add Guest"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-xl border border-cream-dark py-3 text-sm font-medium text-warm-muted transition hover:border-warm-muted hover:text-warm-dark"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
