import type { Ayah } from "../types/quran";

interface AyahLineProps {
  ayah: Ayah;
  isActive?: boolean;
  onClick?: (ayah: Ayah) => void;
}

function AyahLine({ ayah, isActive, onClick }: AyahLineProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer transition-all ${
        isActive ? "bg-accent/40 text-accent" : "hover:bg-primary/40"
      }`}
      onClick={() => onClick?.(ayah)}
    >
      <span className="text-xs bg-primary-dark/70 px-2 py-1 rounded-full">{ayah.ayah_number}</span>
      <span>{ayah.text_ar}</span>
    </span>
  );
}

export default AyahLine;
