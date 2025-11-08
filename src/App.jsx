import { useCallback, useRef, useState } from "react";
import Header from "./components/Header";
import MusicUploader from "./components/MusicUploader";
import BeatVisualizer from "./components/BeatVisualizer";
import StepCoach from "./components/StepCoach";

function App() {
  const [beat, setBeat] = useState(0);
  const [playing, setPlaying] = useState(false);
  const beatDecayRef = useRef(null);

  const handleBeat = useCallback((intensity) => {
    setBeat(intensity);
    // dispatch to global so StepCoach can estimate BPM from beat intervals
    window.dispatchEvent(new CustomEvent("rhythm-beat", { detail: { intensity } }));

    if (beatDecayRef.current) clearTimeout(beatDecayRef.current);
    beatDecayRef.current = setTimeout(() => setBeat(0), 180);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <Header />

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <section className="grid md:grid-cols-2 gap-6 mt-6">
          <MusicUploader onBeat={handleBeat} onPlayState={setPlaying} />
          <BeatVisualizer beatIntensity={beat} />
        </section>

        <section className="mt-6">
          <StepCoach playing={playing} />
        </section>

        <section className="mt-10 grid lg:grid-cols-3 gap-6">
          <Card title="How it works" text="We analyze your track locally in the browser using the Web Audio API, estimate the beat, and adapt steps to the groove. Your audio never leaves your device." />
          <Card title="Beginner friendly" text="Short, clear prompts guide your weight shifts and foot placement. Start with Slow/Quick timing, then advance to more complex patterns." />
          <Card title="Practice anywhere" text="Use any song you love. Plug in headphones, press play, and let the rhythm coach keep you on time." />
        </section>
      </main>

      <footer className="py-10 text-center text-sm text-gray-600 dark:text-gray-400">
        Built by your AI dance coach. Have fun and feel the music.
      </footer>
    </div>
  );
}

function Card({ title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-gray-700 dark:text-gray-300">{text}</p>
    </div>
  );
}

export default App;
