import clsx from "clsx";
import { Fragment, useMemo } from "react";
import type { Ayah, AyahTranslation } from "../types/quran";

type Props = {
  ayat: Ayah[];
  translations: Map<number, AyahTranslation>;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  activeAyah?: number;
  onSelectAyah?: (ayah: Ayah, rect: DOMRect | null) => void;
};

const decodeTranslation = (text: string): string => {
  if (!text) return "";
  if (typeof window !== "undefined" && typeof DOMParser !== "undefined") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    return doc.body.textContent ?? text;
  }
  return text.replace(/<[^>]*>/g, "");
};

function QuranTranslationView({
  ayat,
  translations,
  loading,
  error,
  onRetry,
  activeAyah,
  onSelectAyah
}: Props) {
  const hasTranslations = useMemo(() => translations.size > 0, [translations]);

  if (loading && !hasTranslations) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-300">
        جاري تحميل الترجمة المختارة...
      </div>
    );
  }

  if (!loading && error && !hasTranslations) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-red-200">
        <p>{error}</p>
        {onRetry && (
          <button className="btn btn-sm" onClick={onRetry}>
            إعادة المحاولة
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 pb-32 pt-6 sm:px-8">
      {loading && hasTranslations && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-[11px] text-amber-200">
          يتم تحديث الترجمة في الخلفية...
        </div>
      )}
      {error && hasTranslations && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-[11px] text-amber-200">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-4" dir="rtl">
        {ayat.map((ayah) => {
          const translation = translations.get(ayah.ayah_number);
          const segments = translation ? translation.text.split(/\n+/) : [];
          return (
            <article
              key={`${ayah.surah_id}-${ayah.ayah_number}`}
              className={clsx(
                "group relative overflow-hidden rounded-3xl border border-primary-light/30 bg-primary-dark/70 p-5 shadow-[0_18px_40px_rgba(6,30,24,0.3)] transition",
                activeAyah === ayah.ayah_number
                  ? "border-accent/60 bg-accent/10 shadow-[0_0_35px_rgba(34,197,94,0.35)]"
                  : "hover:border-accent/40 hover:bg-primary-dark/80"
              )}
              onClick={(event) => onSelectAyah?.(ayah, event.currentTarget.getBoundingClientRect())}
            >
              <header className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-300">
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-sm text-accent">
                    {ayah.ayah_number}
                  </span>
                  <span className="font-semibold text-accent">آية رقم {ayah.ayah_number}</span>
                </span>
                {translation?.source && (
                  <span className="text-[10px] text-gray-400">{translation.source}</span>
                )}
              </header>
              <p className="text-[clamp(18px,2.2vw,32px)] leading-[2.2] text-emerald-100" style={{ fontFamily: '"Noto Naskh Arabic", serif' }}>
                {ayah.text_ar}
              </p>
              <div className="mt-4 rounded-3xl bg-black/30 p-4 text-left text-sm leading-7 text-gray-200" dir="auto">
                {translation ? (
                  segments.map((segment, index) => (
                    <Fragment key={index}>
                      <span>{decodeTranslation(segment)}</span>
                      {index < segments.length - 1 && <br />}
                    </Fragment>
                  ))
                ) : (
                  <span className="text-gray-400">لم تتوفر ترجمة لهذه الآية.</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default QuranTranslationView;
