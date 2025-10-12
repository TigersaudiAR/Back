import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ message: "إحداثيات غير صالحة" });
  }
  const qiblaBearing = (Math.atan2(Math.sin((39.8262 - lng) * (Math.PI / 180)), Math.cos(lat * (Math.PI / 180)) * Math.tan(21.4225 * (Math.PI / 180)) - Math.sin(lat * (Math.PI / 180)) * Math.cos((39.8262 - lng) * (Math.PI / 180))) * (180 / Math.PI) + 360) % 360;
  const times = {
    الفجر: "04:32",
    الشروق: "05:58",
    الظهر: "12:14",
    العصر: "15:45",
    المغرب: "18:29",
    العشاء: "19:55"
  };
  res.json({ times, qiblaBearing });
});

export const prayersRouter = router;
