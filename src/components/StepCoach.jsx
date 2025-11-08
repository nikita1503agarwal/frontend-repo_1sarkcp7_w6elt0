import { useEffect, useMemo, useRef, useState } from "react";
import { Footprints, Volume2 } from "lucide-react";

// Simple dance coach that maps BPM to step prompts (Left/Right/Step/Step)
export default function StepCoach({ playing }) {
  const [bpm, setBpm] = useState(0);
  const [prompt, setPrompt] = useState("Upload a track to begin");
  const beatTimesRef = useRef([]);

  // Receive beats from a window event dispatched by MusicUploader
  useEffect(() => {
    const onBeat = (e) => {
      const t = performance.now();
      beatTimesRef.current.push(t);
      // keep last few beats
      if (beatTimesRef.current.length > 12) beatTimesRef.current.shift();
      // estimate bpm from intervals
      if (beatTimesRef.current.length >= 4) {
        const times = beatTimesRef.current;
        const intervals = [];
        for (let i = 1; i < times.length; i++) intervals.push(times[i] - times[i - 1]);
        const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const currentBpm = Math.max(60, Math.min(180, 60000 / avgMs));
        setBpm(Math.round(currentBpm));
      }
    };
    window.addEventListener("rhythm-beat", onBeat);
    return () => window.removeEventListener("rhythm-beat", onBeat);
  }, []);

  const pattern = useMemo(() => {
    // Choose dance pattern by bpm range
    if (bpm < 90) return ["Step", "Step", "Rock", "Recover"];
    if (bpm < 115) return ["Left", "Right", "Left", "Right"];
    if (bpm < 135) return ["Quick", "Quick", "Slow", "Slow"];
    return ["Step", "Together", "Step", "Together"];
  }, [bpm]);

  useEffect(() => {
    if (!playing || bpm === 0) {
      setPrompt("Waiting for the music...");
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      setPrompt(pattern[i % pattern.length]);
      i += 1;
    }, Math.max(300, Math.round(60000 / Math.max(80, bpm))));
    return () => clearInterval(id);
  }, [playing, bpm, pattern]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-5">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-emerald-500 text-white grid place-items-center">
          <Footprints className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 dark:text-gray-300">Coach</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{prompt}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Volume2 className="h-4 w-4" />
          <span>{bpm ? `${bpm} BPM` : "--"}</span>
        </div>
      </div>
      <ul className="mt-4 grid grid-cols-4 gap-2 text-center text-xs text-gray-700 dark:text-gray-300">
        {pattern.map((p, idx) => (
          <li key={idx} className="rounded-lg bg-gray-900/5 dark:bg-white/5 py-2">
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
