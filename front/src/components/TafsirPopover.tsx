import { useEffect, useRef } from "react";
import type { Tafsir } from "../types/quran";

interface TafsirPopoverProps {
  tafsir?: Tafsir;
  anchorRect?: DOMRect | null;
  onClose: () => void;
}

function TafsirPopover({ tafsir, anchorRect, onClose }: TafsirPopoverProps) {
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!popoverRef.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!tafsir || !anchorRect) {
    return null;
  }

  const style: React.CSSProperties = {
    position: "fixed",
    top: anchorRect.bottom + 8,
    left: anchorRect.left,
    maxWidth: 320
  };

  return (
    <div
      ref={popoverRef}
      style={style}
      className="z-50 bg-primary-dark/95 border border-accent/40 rounded-2xl shadow-2xl p-4 text-sm"
    >
      <div className="flex items-center justify-between gap-4 mb-2">
        <span className="text-accent font-semibold">{tafsir.source}</span>
        <button className="btn btn-xs" onClick={onClose}>
          إغلاق
        </button>
      </div>
      <p className="leading-7 text-gray-200">{tafsir.text_ar}</p>
    </div>
  );
}

export default TafsirPopover;
