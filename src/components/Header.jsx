import { Music, Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-fuchsia-500/10 to-emerald-500/20 blur-3xl pointer-events-none" />
      <div className="relative mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-4">
          <Music className="h-6 w-6" />
          <span className="font-semibold tracking-wide uppercase">Rhythm Coach</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Learn to dance by letting the music lead
        </h1>
        <p className="mt-4 max-w-2xl text-gray-600 dark:text-gray-300 text-lg">
          An interactive AI coach that listens to your song, detects the beat, and guides your steps in real-time.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur px-4 py-2 text-sm text-gray-700 dark:text-gray-200 shadow ring-1 ring-black/5">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Live beat tracking • Smart step prompts • No account needed</span>
        </div>
      </div>
    </header>
  );
}
