import express from "express";

const router = express.Router();

const FALLBACK_TIMES = {
  الفجر: "04:32",
  الشروق: "05:58",
  الظهر: "12:14",
  العصر: "15:45",
  المغرب: "18:29",
  العشاء: "19:55"
};

function computeQibla(lat: number, lng: number) {
  const kaabaLat = 21.4225 * (Math.PI / 180);
  const kaabaLng = 39.8262 * (Math.PI / 180);
  const latRad = lat * (Math.PI / 180);
  const lngRad = lng * (Math.PI / 180);
  const bearing =
    (Math.atan2(
      Math.sin(kaabaLng - lngRad),
      Math.cos(latRad) * Math.tan(kaabaLat) - Math.sin(latRad) * Math.cos(kaabaLng - lngRad)
    ) * (180 / Math.PI) + 360) % 360;
  return bearing;
}

router.get("/", async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const city = (req.query.city as string) || "Mecca";
  const country = (req.query.country as string) || "Saudi Arabia";
  const method = Number(req.query.method) || 4;

  const now = Math.floor(Date.now() / 1000);

  let timings: Record<string, string> | null = null;
  let qiblaBearing: number | null = null;
  let locationLabel: string | undefined;

  try {
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      const timingResponse = await fetch(
        `https://api.aladhan.com/v1/timings/${now}?latitude=${lat}&longitude=${lng}&method=${method}&adjustment=0`
      );
      if (!timingResponse.ok) {
        throw new Error(`timings error ${timingResponse.status}`);
      }
      const timingPayload = await timingResponse.json();
      timings = timingPayload?.data?.timings ?? null;
      qiblaBearing = computeQibla(lat, lng);
      locationLabel = `${timingPayload?.data?.meta?.timezone ?? ""}`;
    } else {
      const timingResponse = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`
      );
      if (!timingResponse.ok) {
        throw new Error(`timingsByCity error ${timingResponse.status}`);
      }
      const timingPayload = await timingResponse.json();
      timings = timingPayload?.data?.timings ?? null;
      const metaLat = Number(timingPayload?.data?.meta?.latitude);
      const metaLng = Number(timingPayload?.data?.meta?.longitude);
      if (!Number.isNaN(metaLat) && !Number.isNaN(metaLng)) {
        qiblaBearing = computeQibla(metaLat, metaLng);
      }
      locationLabel = `${timingPayload?.data?.meta?.timezone ?? city}`;
    }
  } catch (error) {
    console.error("Prayer API error", error);
  }

  if (!timings) {
    return res.status(200).json({
      times: FALLBACK_TIMES,
      qiblaBearing: Number.isNaN(lat) || Number.isNaN(lng) ? 0 : computeQibla(lat, lng),
      city,
      fallback: true
    });
  }

  const normalized: Record<string, string> = {
    الفجر: timings.Fajr,
    الشروق: timings.Sunrise,
    الظهر: timings.Dhuhr,
    العصر: timings.Asr,
    المغرب: timings.Maghrib,
    العشاء: timings.Isha
  };

  res.json({
    times: normalized,
    qiblaBearing: qiblaBearing ?? (Number.isNaN(lat) || Number.isNaN(lng) ? 0 : computeQibla(lat, lng)),
    city: locationLabel ?? city,
    fallback: false
  });
});

export const prayersRouter = router;
