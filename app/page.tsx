"use client";

import { useState } from "react";
import GuestSearch from "@/app/components/GuestSearch";
import RSVPForm from "@/app/components/RSVPForm";
import Confirmation from "@/app/components/Confirmation";

type Guest = {
  id: string;
  primary_guest_name: string;
  max_guests: number;
  has_rsvped: boolean;
};

type Step = "search" | "rsvp" | "confirmation";

export default function Home() {
  const [step, setStep] = useState<Step>("search");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [didAttend, setDidAttend] = useState<boolean>(false);

  function handleGuestSelect(guest: Guest) {
    setSelectedGuest(guest);
    setStep("rsvp");
  }

  function handleRSVPComplete(attending: boolean) {
    setDidAttend(attending);
    setStep("confirmation");
  }

  function handleBack() {
    setSelectedGuest(null);
    setStep("search");
  }

  function handleReset() {
    setSelectedGuest(null);
    setDidAttend(false);
    setStep("search");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <header className="mb-10 text-center">
          <p className="mb-1 font-serif text-sm italic tracking-widest text-rose">
            Together with their families
          </p>
          <h1 className="font-serif text-4xl font-semibold text-warm-dark">
            You&apos;re Invited
          </h1>
          <div className="mx-auto mt-4 h-px w-16 bg-rose/50" />
        </header>

        {/* Card */}
        <div className="rounded-2xl border border-cream-dark bg-card px-8 py-10 shadow-sm">
          {step === "search" && (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <h2 className="font-serif text-xl font-medium italic text-warm-dark">
                  Find your invitation
                </h2>
                <p className="mt-1.5 text-sm text-warm-muted">
                  Start typing your name to look up your RSVP.
                </p>
              </div>
              <GuestSearch onSelect={handleGuestSelect} />
              <p className="text-center text-xs text-warm-muted">
                Please respond by{" "}
                <span className="font-medium text-warm-dark">
                  July 28, 2026
                </span>
              </p>
            </div>
          )}

          {step === "rsvp" && selectedGuest && (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <h2 className="font-serif text-xl font-medium italic text-warm-dark">
                  Hello, {selectedGuest.primary_guest_name.split(" ")[0]}!
                </h2>
                <p className="mt-1.5 text-sm text-warm-muted">
                  We&apos;d love to know if you&apos;ll be joining us.
                </p>
              </div>
              <RSVPForm
                guest={selectedGuest}
                onComplete={handleRSVPComplete}
                onBack={handleBack}
              />
            </div>
          )}

          {step === "confirmation" && (
            <Confirmation attending={didAttend} onReset={handleReset} />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-warm-muted">
          Having trouble? Reach out to us directly.
        </footer>
      </div>
    </div>
  );
}
