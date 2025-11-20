# 🕌 Codex Patch: Quran Al-Huda Learning Platform
**Version:** 1.0  
**Author:** Abdulrahman (TigersaudiAR)  
**Reviewed by:** Codex GPT  

---

## 📖 الهدف
تحسين وضبط مشروع **منصة مصحف الهدى التعليمية** ليعرض الآيات القرآنية بشكل مطابق لمصحف المدينة النبوية، مع واجهة تفاعلية، صوتيات، تفسير، وأداء بصري مثالي دون أي خلل في مواضع النص أو ترتيب الآيات.

---

## 🔍 القسم (1): فحص المشكلات الحالية

### ⚠️ أ. أخطاء العرض القرآني
1. **تغيير مواضع الآيات**  
   - عناصر HTML المستخدمة (مثل `div` أو `flex`) تُسبب التفاف غير متناسق للكلمات.  
   - المواضع الحالية لا تطابق تنسيق المصحف العثماني.  
   ✅ الحل:  
   استخدم `text-align: justify; line-height: 2.2; font-family: "UthmanicHafs";`

2. **ترقيم الآيات داخل دوائر مشوهة**
   - الأرقام داخل دوائر غير متساوية، وأحيانًا تُقطع عند التكبير.  
   ✅ الحل:
   ```css
   .ayah-number {
     display: inline-flex;
     justify-content: center;
     align-items: center;
     width: 1.8em;
     height: 1.8em;
     border-radius: 50%;
     border: 1px solid #6fbf73;
     margin-right: 0.5em;
   }
```

3. **الخط المستخدم ليس عثماني**

   * حاليًا الخط من نوع “Simplified Arabic” أو “Amiri”.
     ✅ الحل:

   ```css
   @font-face {
     font-family: "UthmanicHafs";
     src: url("https://cdn.islamic.network/fonts/UthmanicHafs-Regular.woff2") format("woff2");
     font-display: swap;
   }
   ```

4. **اختلاف الفراغات بين الآيات**

   * استخدم `gap: 1.5rem;` بدل `margin-bottom` غير المنتظم.

---

### 🎨 ب. أخطاء الواجهة (UI/UX)

1. **تباين لوني ضعيف**
   الخلفية خضراء داكنة والنص الذهبي غير مقروء.
   ✅ استخدم درجات أفتح مثل `#FFD966`.

2. **أزرار بدون وصف نصي (Accessibility Error)**

   * DevTools: “Buttons must have discernible text”
     ✅ الحل:

   ```html
   <button aria-label="تشغيل تلاوة الشيخ ماهر المعيقلي">🔊</button>
   ```

3. **تأخير في التفاعل (INP Issue)**

   * حدث scroll أو click يستغرق ~385ms
     ✅ الحلول:
   * استخدم `React.memo` لتقليل إعادة الرسم.
   * فعّل Lazy Loading لمكونات الصوت والتفسير.

4. **رسالة تحميل غير مستمرة**

   * Overlay لا يُزال بعد جلب السورة.
     ✅ تأكد من إرجاع الحالة `loading=false` بعد إتمام Promise.

---

### ⚙️ ج. أداء وموارد

1. **غياب `preconnect`**:

   ```html
   <link rel="preconnect" href="https://api.quran.com">
   <link rel="preconnect" href="https://cdn.islamic.network">
   ```

2. **عدم وجود Cache للملفات الثابتة**

   ```json
   {
     "headers": [
       {
         "source": "/(.*)\\.(woff2|svg|jpg|png)",
         "headers": [{ "key": "Cache-Control", "value": "public,max-age=31536000,immutable" }]
       }
     ]
   }
   ```

3. **الخط القرآني لا يُحمّل بسرعة**
   ✅ استخدم `font-display: swap;` مع `preload` في `<head>`:

   ```html
   <link rel="preload" href="https://cdn.islamic.network/fonts/UthmanicHafs-Regular.woff2" as="font" type="font/woff2" crossorigin>
   ```

---

## 🧩 القسم (2): التحسينات الجوهرية

| العنصر             | المشكلة              | الحل                                                                     |
| ------------------ | -------------------- | ------------------------------------------------------------------------ |
| **عرض الآيات**     | الالتفاف غير المنسق  | استخدم Flexbox عمودي أو Grid بخط عثماني فقط                              |
| **ترتيب السور**    | يعتمد على index محلي | استخدم API موحد                                                          |
| **التلاوة**        | تحتاج مصدر واضح      | `https://cdn.islamic.network/quran/audio/128/ar.mahermuaiqly/{ayah}.mp3` |
| **التفسير**        | غير مدمج أو ثقيل     | Lazy Load عبر `api.quran.com/api/v4/tafsirs`                             |
| **التفاعل الصوتي** | لا يوجد تحكم بالصوت  | أضف `<AudioPlayer />` ثابت أسفل الصفحة                                   |
| **التحميل**        | بطء أولي             | استخدم SSR أو Static Generation                                          |

---

## 🌐 القسم (3): الموارد الخارجية المعتمدة

| نوع المورد     | الرابط                                                         | الاستخدام                       |
| -------------- | -------------------------------------------------------------- | ------------------------------- |
| نصوص الآيات    | `https://api.quran.com/api/v4/quran/verses/uthmani`            | جلب النص القرآني                |
| أسماء السور    | `https://api.quran.com/api/v4/chapters`                        | عرض أسماء السور والفهرس         |
| تفسير          | `https://api.quran.com/api/v4/tafsirs`                         | جلب التفسير النصي               |
| الصوتيات       | `https://cdn.islamic.network/quran/audio/128/ar.mahermuaiqly/` | تلاوة مباشرة بدون تأخير         |
| خط عثماني رسمي | `https://cdn.islamic.network/fonts/UthmanicHafs-Regular.woff2` | عرض النص القرآني الصحيح         |
| أيقونات        | `https://unpkg.com/heroicons@2.0.13/outline`                   | تصميم الأزرار بشكل خفيف ومتناسق |

---

## 💡 القسم (4): اقتراحات تجربة المستخدم UX

1. **مشغّل صوت مصغّر دائم أسفل الصفحة**
   يعرض اسم السورة والآية الحالية، مع إمكانية الإيقاف المؤقت أو إعادة التشغيل.

2. **تخزين آخر موضع قراءة**

   ```js
   localStorage.setItem("lastSurah", surahIndex);
   localStorage.setItem("lastAyah", ayahIndex);
   ```

   واسترجاعها عند التشغيل التالي.

3. **زر الوضع الليلي والنهاري**

   ```css
   [data-theme="dark"] { --bg: #061b11; --text: #e7f6ec; }
   [data-theme="light"] { --bg: #f8f8f8; --text: #062; }
   ```

4. **خيارات التعليم (للطلبة)**

   * وضع اختبار تفاعلي "أكمل الآية التالية" بعد الحفظ.
   * سجل التقدم عبر متصفح المستخدم.

---

## 🧠 القسم (5): الأكواد الجاهزة لتصحيح التنسيق

### 🧾 ملف App.css

```css
body {
  background-color: #041b10;
  color: #c7f0d8;
  font-family: "UthmanicHafs", "Amiri", serif;
  line-height: 2.2;
  text-align: justify;
  direction: rtl;
}

.ayah {
  display: block;
  margin: 1.4rem auto;
  font-size: 1.45rem;
  max-width: 90%;
}

.ayah-number {
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.8em;
  height: 1.8em;
  border: 1px solid #79c08b;
  border-radius: 50%;
  margin-left: 0.4em;
}
```

---

## 🧩 القسم (6): إعدادات Vercel (جاهزة للنسخ)

| الإعداد               | القيمة          |
| --------------------- | --------------- |
| Framework Preset      | **Other**       |
| Build Command         | `npm run build` |
| Output Directory      | `dist`          |
| Environment Variables |                 |

```
VITE_API_BASE=https://api.quran.com
VITE_AUDIO_BASE=https://cdn.islamic.network/quran/audio/128/
```

---

## 🧾 القسم (7): التوصيات النهائية

* استخدم خط عثماني رسمي فقط.
* لا تغيّر مواضع الكلمات أبدًا.
* لا تُجزّئ الآية لأكثر من سطر إلا عند الوقف المعتمد.
* استخدم Lazy Loading لمكون الصوت والتفسير.
* تأكد أن كل زر في الواجهة له وصف صوتي (aria-label).
* اختبر الأداء بـ Lighthouse، يجب أن تكون القيم:

  * INP < 200ms
  * LCP < 1.8s
  * CLS < 0.1

---

## ✅ القسم (8): المهام المطلوب تنفيذها فورًا

1. تحديث الخط والمظهر العام عبر CSS.
2. ربط الـ API للآيات والتفسير.
3. تثبيت الصوتيات عبر CDN رسمي.
4. ضبط `aria-label` للأزرار.
5. تحسين الأداء ورفع المشروع إلى Vercel.

---

**💠 النتيجة المتوقعة بعد التصحيح:**
واجهة عرض قرآنية مطابقة لمصحف المدينة، مرتبة تمامًا، قابلة للتفاعل بالصوت والتفسير، خفيفة وسريعة على جميع الأجهزة، تراعي الضوابط الشرعية في العرض والكتابة، وتوفّر تجربة قراءة وتعليم راقية وواقعية.

---

**تمّ بعناية فائقة لإدراجها في Codex ChatGPT مباشرة.**

```

---

هل ترغب أن أحول هذا الملف الآن إلى نسخة **`.md` قابلة للتحميل مباشرة** لتضعها في مجلد المشروع بجانب الكود؟
