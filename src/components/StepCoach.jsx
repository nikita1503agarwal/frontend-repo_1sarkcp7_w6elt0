import { useEffect, useMemo, useRef, useState } from "react";
import { Footprints, Volume2 } from "lucide-react";

// Dance coach that maps BPM and style to step prompts and can play a metronome click
export default function StepCoach({ playing }) {
  const [bpm, setBpm] = useState(0);
  const [prompt, setPrompt] = useState("Upload a track to begin");
  const [style, setStyle] = useState("Freestyle");
  const [metronome, setMetronome] = useState(false);
  const beatTimesRef = useRef([]);
  const audioCtxRef = useRef(null);

  // Initialize AudioContext lazily for metronome
  const ensureAudio = () => {
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        // ignore if not available
      }
    }
    return audioCtxRef.current;
  };

  const click = () => {
    const ctx = ensureAudio();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.value = 1000; // click tone
    g.gain.value = 0.15;
    o.connect(g).connect(ctx.destination);
    const now = ctx.currentTime;
    o.start(now);
    o.stop(now + 0.04);
  };

  // Receive beats from a window event dispatched by MusicUploader
  useEffect(() => {
    const onBeat = () => {
      const t = performance.now();
      beatTimesRef.current.push(t);
      // keep last few beats
      if (beatTimesRef.current.length > 16) beatTimesRef.current.shift();
      // estimate bpm from intervals
      if (beatTimesRef.current.length >= 5) {
        const times = beatTimesRef.current;
        const intervals = [];
        for (let i = 1; i < times.length; i++) intervals.push(times[i] - times[i - 1]);
        // robust average: drop min/max outliers
        const sorted = intervals.slice().sort((a, b) => a - b).slice(1, -1);
        const useArr = sorted.length >= 2 ? sorted : intervals;
        const avgMs = useArr.reduce((a, b) => a + b, 0) / useArr.length;
        const currentBpm = Math.max(60, Math.min(180, 60000 / avgMs));
        setBpm(Math.round(currentBpm));
      }
    };
    window.addEventListener("rhythm-beat", onBeat);
    return () => window.removeEventListener("rhythm-beat", onBeat);
  }, []);

  // Pattern library per style
  const pattern = useMemo(() => {
    const freestyle = () => {
      if (bpm < 90) return ["Step", "Step", "Rock", "Recover"];
      if (bpm < 115) return ["Left", "Right", "Left", "Right"];
      if (bpm < 135) return ["Quick", "Quick", "Slow", "Slow"];
      return ["Step", "Together", "Step", "Together"];
    };
    const salsa = () => ["Quick", "Quick", "Slow", "Hold"]; // 1-2-3 hold 4 / 5-6-7 hold 8
    const waltz = () => ["Step", "Side", "Together"]; // 1-2-3
    const hiphop = () => ["Bounce", "Bounce", "Step", "Groove"];

    switch (style) {
      case "Salsa":
        return salsa();
      case "Waltz":
        return waltz();
      case "Hip-Hop":
        return hiphop();
      default:
        return freestyle();
    }
  }, [bpm, style]);

  // Drive prompts on tempo; optional metronome
  useEffect(() => {
    if (!playing || bpm === 0) {
      setPrompt("Waiting for the music...");
      return;
    }
    let i = 0;
    const intervalMs = Math.max(280, Math.round(60000 / Math.max(70, bpm)));
    const id = setInterval(() => {
      setPrompt(pattern[i % pattern.length]);
      if (metronome) click();
      i += 1;
    }, intervalMs);
    return () => clearInterval(id);
  }, [playing, bpm, pattern, metronome]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-emerald-500 text-white grid place-items-center">
          <Footprints className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 dark:text-gray-300">Coach</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{prompt}</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
          <Volume2 className="h-4 w-4" />
          <span>{bpm ? `${bpm} BPM` : "--"}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Style</label>
          <div className="relative">
            <select
              className="w-full appearance-none rounded-lg bg-gray-900/5 dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              <option>Freestyle</option>
              <option>Salsa</option>
              <option>Waltz</option>
              <option>Hip-Hop</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500">▾</div>
          </div>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setMetronome((m) => !m)}
            className={`w-full rounded-lg border px-3 py-2 text-sm font-medium transition ${
              metronome
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-400/40 dark:text-emerald-300"
                : "bg-gray-900/5 dark:bg-white/5 text-gray-800 dark:text-gray-200 border-white/10"
            }`}
          >
            {metronome ? "Metronome: On" : "Metronome: Off"}
          </button>
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
