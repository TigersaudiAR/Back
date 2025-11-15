import { useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import type { Dhikr } from "../types/adhkar";

interface TasbihSmartProps {
  item: Dhikr;
  onComplete?: () => void;
}

type Mode = "tap" | "audio" | "rhythm";

function TasbihSmart({ item, onComplete }: TasbihSmartProps) {
  const [mode, setMode] = useState<Mode>("tap");
  const [count, setCount] = useState(0);
  const [listening, setListening] = useState(false);
  const [completed, setCompleted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const targetCount = useMemo(() => item.count ?? 33, [item.count]);

  useEffect(() => {
    if (mode !== "audio" || !listening) return;
    const context = new AudioContext();
    audioContextRef.current = context;
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const source = context.createMediaStreamSource(stream);
        const analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const threshold = 180;

        const detect = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          if (average > threshold) {
            setCount((prev) => prev + 1);
          }
          if (listening) {
            requestAnimationFrame(detect);
          }
        };
        detect();
      })
      .catch(() => setListening(false));

    return () => {
      context.close().catch(() => undefined);
      analyserRef.current = null;
    };
  }, [mode, listening]);

  useEffect(() => {
    if (mode !== "rhythm" || !listening) return;
    const interval = setInterval(() => {
      setCount((prev) => prev + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, [mode, listening]);

  useEffect(() => {
    const saved = localStorage.getItem(`tasbih-${item.id}`);
    if (saved) {
      setCount(Number(saved));
    }
  }, [item.id]);

  useEffect(() => {
    localStorage.setItem(`tasbih-${item.id}`, count.toString());
    
    // Check if target count is reached
    if (count >= targetCount && !completed) {
      setCompleted(true);
      // Auto-transition after 2 seconds
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    }
  }, [item.id, count, targetCount, completed, onComplete]);

  const reset = () => {
    setCount(0);
    setCompleted(false);
  };

  return (
    <div className={`bg-primary-dark/60 rounded-3xl border border-primary-light/40 p-6 space-y-4 shadow-lg text-center transition-all duration-500 ${completed ? 'border-green-500 bg-green-900/20' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-accent text-lg font-semibold flex-1">{item.title}</h3>
        {completed && (
          <div className="bg-green-500 rounded-full p-2 animate-bounce">
            <Check className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      <p className="text-sm leading-7 text-gray-200 whitespace-pre-line with-tashkeel">{item.text}</p>
      {item.reference && (
        <p className="text-[11px] text-gray-400">المصدر: {item.reference}</p>
      )}
      <div className="flex justify-center gap-2 text-xs">
        <span className="badge badge-accent">العدد المستهدف: {targetCount}</span>
        <span className={`badge ${completed ? 'badge-success' : ''}`}>الحالي: {count}</span>
      </div>
      <div className="flex justify-center gap-3">
        <button 
          className={`btn btn-sm ${mode === 'tap' ? 'btn-accent' : 'btn-outline'}`} 
          onClick={() => setMode("tap")}
        >
          النقر
        </button>
        <button 
          className={`btn btn-sm ${mode === 'audio' ? 'btn-accent' : 'btn-outline'}`} 
          onClick={() => setMode("audio")}
        >
          الصوت
        </button>
        <button 
          className={`btn btn-sm ${mode === 'rhythm' ? 'btn-accent' : 'btn-outline'}`} 
          onClick={() => setMode("rhythm")}
        >
          الإيقاع
        </button>
      </div>
      <div
        className={`rounded-full border-4 h-40 w-40 mx-auto flex items-center justify-center cursor-pointer select-none transition-all duration-300 ${
          completed 
            ? 'border-green-500 bg-green-500/10' 
            : 'border-accent/50 hover:border-accent hover:scale-105'
        }`}
        onClick={() => {
          if (mode === "tap") {
            setCount((prev) => prev + 1);
          } else {
            setListening((prev) => !prev);
          }
        }}
      >
        <div>
          <p className={`text-3xl font-bold ${completed ? 'text-green-500' : 'text-accent'}`}>
            {count}
          </p>
          <p className="text-xs text-gray-300">
            {completed 
              ? "مكتمل ✓" 
              : mode === "tap" 
                ? "انقر في أي مكان" 
                : listening 
                  ? "جار الاستماع" 
                  : "ابدأ الاستماع"
            }
          </p>
        </div>
      </div>
      <button className="btn btn-sm btn-outline" onClick={reset}>
        إعادة الضبط
      </button>
    </div>
  );
}

export default TasbihSmart;
