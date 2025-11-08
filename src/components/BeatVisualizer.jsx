import { useEffect, useRef } from "react";

export default function BeatVisualizer({ beatIntensity = 0 }) {
  const ref = useRef(null);
  const lastBeatRef = useRef(0);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const now = Date.now();
    const since = now - lastBeatRef.current;
    if (beatIntensity > 0) {
      lastBeatRef.current = now;
      // Pulse animation
      el.animate(
        [
          { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(99,102,241,0.6)" },
          { transform: "scale(1.08)", boxShadow: "0 0 0 12px rgba(99,102,241,0)" },
        ],
        { duration: 220, easing: "cubic-bezier(0.2,0,0,1)" }
      );
    } else if (since > 400) {
      // subtle breathing when idle
      el.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.02)" },
          { transform: "scale(1)" },
        ],
        { duration: 2000, iterations: 1, easing: "ease-in-out" }
      );
    }
  }, [beatIntensity]);

  return (
    <div
      ref={ref}
      className="relative isolate grid place-items-center h-48 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-fuchsia-500/10 to-emerald-500/20 text-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.25),transparent_60%)] pointer-events-none" />
      <div className="relative z-10">
        <p className="text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Beat Pulse</p>
        <p className="mt-1 text-4xl font-extrabold text-gray-900 dark:text-white">
          {beatIntensity > 0 ? "Boom" : "Listening"}
        </p>
        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">Follows the groove of your song in real time</p>
      </div>
    </div>
  );
}
