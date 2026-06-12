"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/app/lib/supabase";

type Guest = {
  id: string;
  primary_guest_name: string;
  max_guests: number;
  has_rsvped: boolean;
};

type Props = {
  onSelect: (guest: Guest) => void;
};

export default function GuestSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("guests")
        .select("id, primary_guest_name, max_guests, has_rsvped")
        .ilike("primary_guest_name", `%${query.trim()}%`)
        .limit(10);
      setResults(data ?? []);
      setIsOpen(true);
      setIsLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(guest: Guest) {
    setQuery(guest.primary_guest_name);
    setIsOpen(false);
    onSelect(guest);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Type your name…"
          className="w-full rounded-xl border border-cream-dark bg-card px-5 py-4 text-base text-warm-dark placeholder-warm-muted shadow-sm outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/30"
          autoComplete="off"
          spellCheck={false}
        />
        {isLoading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg
              className="h-5 w-5 animate-spin text-rose"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </span>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-cream-dark bg-card shadow-lg">
          {results.map((guest) => (
            <li key={guest.id}>
              <button
                type="button"
                onClick={() => handleSelect(guest)}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left text-warm-dark transition hover:bg-cream"
              >
                <span className="font-medium">{guest.primary_guest_name}</span>
                {guest.has_rsvped && (
                  <span className="ml-3 shrink-0 rounded-full bg-rose/20 px-2.5 py-0.5 text-xs text-rose-dark">
                    Already RSVP&apos;d
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOpen && !isLoading && results.length === 0 && query.trim().length >= 2 && (
        <div className="absolute z-10 mt-2 w-full rounded-xl border border-cream-dark bg-card px-5 py-4 text-sm text-warm-muted shadow-lg">
          No guests found. Please check the spelling or contact us for help.
        </div>
      )}
    </div>
  );
}
