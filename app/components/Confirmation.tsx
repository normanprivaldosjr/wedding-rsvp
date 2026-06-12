"use client";

type Props = {
  attending: boolean;
  onReset: () => void;
};

export default function Confirmation({ attending, onReset }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="text-5xl">{attending ? "🎉" : "💌"}</div>

      <div className="flex flex-col gap-2">
        <h2 className="font-serif text-2xl font-semibold italic text-warm-dark">
          {attending ? "We can't wait to see you!" : "You'll be missed."}
        </h2>
        <p className="text-sm leading-relaxed text-warm-muted">
          {attending
            ? "Thank you for letting us know. We're so excited to celebrate with you — see you soon!"
            : "Thank you for letting us know. We'll be thinking of you on our special day."}
        </p>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-2 text-sm text-warm-muted underline underline-offset-2 transition hover:text-warm-dark"
      >
        Submit another RSVP
      </button>
    </div>
  );
}
