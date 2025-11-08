import { useEffect, useRef, useState } from "react";
import { Upload, Play, Pause, Waveform } from "lucide-react";

export default function MusicUploader({ onBeat, onPlayState }) {
  const [fileName, setFileName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const analyserRef = useRef(null);
  const scriptNodeRef = useRef(null);

  useEffect(() => {
    return () => {
      try {
        if (scriptNodeRef.current) scriptNodeRef.current.disconnect();
        if (analyserRef.current) analyserRef.current.disconnect();
        if (sourceRef.current) sourceRef.current.disconnect();
        if (audioCtxRef.current) audioCtxRef.current.close();
      } catch {}
    };
  }, []);

  const setupAudio = async () => {
    if (!audioRef.current) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      sourceRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current);
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Beat detection: energy thresholding with decay
      let lastEnergy = 0;
      let threshold = 0.25; // relative energy threshold
      let cooldown = 0;

      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(dataArray);
        // Compute signal energy
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128;
          sum += v * v;
        }
        const energy = Math.sqrt(sum / dataArray.length);

        // adaptive threshold
        threshold = 0.98 * threshold + 0.02 * energy * 1.5;

        if (cooldown <= 0 && energy - lastEnergy > 0.02 && energy > threshold) {
          onBeat?.(energy);
          cooldown = 6; // ~ beat refractory frames
        } else if (cooldown > 0) {
          cooldown -= 1;
        }
        lastEnergy = 0.9 * lastEnergy + 0.1 * energy;
        requestAnimationFrame(tick);
      };

      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioCtxRef.current.destination);
      requestAnimationFrame(tick);
    }
  };

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const url = URL.createObjectURL(f);
    if (audioRef.current) {
      audioRef.current.src = url;
      await setupAudio();
      await audioRef.current.play();
      setIsPlaying(true);
      onPlayState?.(true);
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onPlayState?.(false);
    } else {
      await audioRef.current.play();
      setIsPlaying(true);
      onPlayState?.(true);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow">
            <Waveform className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">{fileName || "Choose a track"}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">MP3, WAV, or AAC • Local playback</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 rounded-xl bg-gray-900 text-white px-4 py-2 text-sm cursor-pointer hover:bg-gray-800 transition">
            <Upload className="h-4 w-4" />
            <span>Upload</span>
            <input type="file" accept="audio/*" onChange={handleFile} className="hidden" />
          </label>
          <button
            onClick={togglePlay}
            disabled={!fileName}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm disabled:opacity-50"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
