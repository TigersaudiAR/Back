# منصة مصحف الهدى التعليمية

منصة قرآنية تعليمية متكاملة تقدم تجربة فريدة لقراءة القرآن الكريم والتعلم الإسلامي بخط عثماني أصيل وواجهة عصرية.

## 🎯 المميزات الرئيسية

### قراءة القرآن الكريم
- عرض النص القرآني بخط **UthmanicHafs** الرسمي من مجمع الملك فهد
- تنسيق مطابق لمصحف المدينة النبوية
- دوائر أرقام الآيات واضحة ومنسقة
- واجهة قراءة حديثة مع وضع ملء الشاشة
- شريط أدوات مخفي للتركيز على القراءة
- **قارئ الصفحات**: عرض صور صفحات المصحف من مجمع الملك فهد (edge-to-edge)
- **تنقل سلس**: دعم السحب باللمس، مفاتيح الأسهم، وحفظ آخر موضع قراءة
- **طبقة تفاعلية**: إبراز الآيات مع عرض النص والتفسير عند النقر
- **تلاوة صوتية**: مشغل صوتي مدمج لتلاوة القارئ ماهر المعيقلي
- **وضع الطباعة**: عرض نصي كلاسيكي قابل للطباعة

### التفاعل والتعلم
- مسبحة ذكية تدعم العد الصوتي والنقر
- اختيار الأذكار حسب الوقت
- وحدات تعليمية ذاتية للعربية والتجويد
- نظام أوسمة للتحفيز

### إدارة حلقات التحفيظ
- إدارة حلقات التحفيظ مع لوحة صدارة
- تتبع الحفظ والتقدم
- تصنيف أفضل 100 مشارك

### الأحاديث والسيرة
- قسم الأحاديث النبوية من مصادر معتمدة
- إمكانية البحث في الأحاديث
- السيرة النبوية الشريفة

### الدعوة والإرشاد
- قسم الدعوة والإرشاد للإجابة عن الأسئلة
- قناة تواصل فورية مع أهل العلم
- تخزين الأسئلة المرسلة للمتابعة

### لوحة التحكم
- لوحة تحكم للأدوار المختلفة
- إدارة المحتوى والمستخدمين
- تقارير وإحصائيات

## 🛠️ التقنيات المستخدمة

### الواجهة الأمامية (Frontend)
- **React 18** - مكتبة JavaScript لبناء واجهات المستخدم
- **TypeScript** - للكتابة الآمنة من الأخطاء
- **Vite** - أداة بناء سريعة وحديثة
- **Tailwind CSS** - إطار عمل CSS utility-first
- **DaisyUI** - مكونات جاهزة لـ Tailwind CSS
- **Framer Motion** - مكتبة الحركات والانتقالات
- **Zustand** - إدارة الحالة العامة
- **Axios** - للتعامل مع HTTP requests
- **Lucide React** - مكتبة الأيقونات

### الخادم الخلفي (Backend)
- **Node.js 20** - بيئة تشغيل JavaScript
- **Express** - إطار عمل خادم الويب
- **TypeScript** - للكتابة الآمنة
- **JWT** - مصادقة المستخدمين
- **bcryptjs** - تشفير كلمات المرور
- **CORS** - التعامل مع الطلبات من نطاقات مختلفة

### مصادر البيانات
- **مجمع الملك فهد لطباعة المصحف الشريف** - المصدر الرسمي للنص القرآني
- **API مجمع الملك فهد** (`https://qurancomplex.gov.sa/quran-dev/`) - للبيانات الشرعية
- بيانات محلية للتفسير والأحاديث

## 📋 المتطلبات المسبقة

- Node.js 18 أو أحدث
- npm أو yarn

## 🚀 التثبيت والتشغيل

### بنية المشروع
```
Back/
  ├── front/   # تطبيق React + Vite + Tailwind + DaisyUI
  └── back/    # خادم Express TypeScript
```

### تشغيل الواجهة الأمامية
```bash
cd front
npm install
npm run dev
```
الواجهة الأمامية ستعمل على `http://localhost:5173`

### تشغيل الخادم الخلفي
```bash
cd back
npm install
npm run dev
```
الخادم الخلفي سيعمل على `http://localhost:4000`

## 🏗️ البناء للإنتاج

### بناء الواجهة الأمامية
```bash
cd front
npm run build
```
الملفات المبنية ستكون في `front/dist`

### بناء الخادم الخلفي
```bash
cd back
npm run build
```
الملفات المبنية ستكون في `back/dist`

## 📁 هيكلة الواجهة الأمامية

```
front/src/
  ├── components/     # مكونات قابلة لإعادة الاستخدام
  ├── pages/          # صفحات التطبيق الرئيسية
  ├── services/       # خدمات API وجلب البيانات
  ├── hooks/          # Custom React Hooks
  ├── store/          # إدارة الحالة العامة (Zustand)
  ├── types/          # تعريفات TypeScript
  ├── utils/          # دوال مساعدة
  ├── styles/         # ملفات CSS
  ├── data/           # بيانات محلية
  └── layouts/        # تخطيطات الصفحات
```

## 🎨 الخطوط المستخدمة

- **UthmanicHafs** - الخط الرسمي للنص القرآني
- **Amiri Quran** - خط بديل للقرآن
- **Noto Naskh Arabic** - للنصوص العربية العامة
- **Tajawal** - خط الواجهة الرئيسي

## 🔧 الإعدادات

### متغيرات البيئة (Environment Variables)

إنشاء ملف `.env` في مجلد `front/`:
```env
# Backend API URL
VITE_API_URL=http://localhost:4000

# Quran API Configuration
# King Fahd Complex API Base URL
VITE_QURAN_BASE=https://qurancomplex.gov.sa/quran-dev

# Optional: API Key for King Fahd Complex (if required)
VITE_QURAN_API_KEY=

# Optional: Use Netlify proxy for API calls
VITE_QURAN_PROXY=/.netlify/functions/quran-proxy

# Cache TTL in milliseconds (default: 1 hour)
VITE_CACHE_TTL=3600000
```

### Netlify Configuration

For deployment to Netlify, add the following environment variables in your Netlify site settings:

**Build & Deploy Settings:**
- Build Command: `cd front && npm install && npm run build`
- Publish Directory: `front/dist`
- Functions Directory: `front/netlify/functions`

**Environment Variables:**
```
VITE_QURAN_BASE=https://qurancomplex.gov.sa/quran-dev
VITE_QURAN_API_KEY=[your-api-key-if-required]
```

**Important Notes:**
- Never commit API keys to the repository
- Use Netlify's environment variables UI to securely store secrets
- The `save-question.ts` function uses file-based storage which is NOT permanent on serverless platforms
- For production, migrate question storage to a database service (Firebase, MongoDB, etc.)

**Testing Netlify Functions Locally:**
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Run Netlify dev server
cd front
netlify dev
```

The Netlify functions will be available at:
- `/.netlify/functions/quran-proxy` - Proxy for King Fahd Complex API
- `/.netlify/functions/save-question` - Save user questions

## 📚 Quran Reader Features

### Pages Available
- `/quran-reader` - Modern image-based page viewer with interactive overlay
- `/quran/classic` - Classical text-based printable view

### Key Features
1. **Page Navigation**
   - Swipe gestures (touch-enabled devices)
   - Arrow keys (left/right for RTL navigation)
   - Click/tap navigation buttons
   - Automatic last position restoration

2. **Interactive Overlay**
   - Click on any verse to view its text and tafsir
   - Audio playback for individual verses
   - Popover display with verse details

3. **Offline Support**
   - Service Worker caches viewed pages
   - Font files cached for offline use
   - Works without internet after initial load

4. **Accessibility**
   - All controls have Arabic aria-labels
   - Keyboard navigation support
   - RTL-aware design

For detailed implementation guide, see [front/docs/Codex_Patch_Quran_Al-Huda.md](front/docs/Codex_Patch_Quran_Al-Huda.md)

## 📝 المساهمة

نرحب بالمساهمات! يرجى:
1. عمل Fork للمشروع
2. إنشاء فرع جديد للميزة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى الفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مفتوح المصدر للأغراض التعليمية والدعوية.

## 👥 المطورون

- تطوير: TigersaudiAR
- تصميم: فريق مصحف الهدى

## 🙏 شكر وتقدير

- مجمع الملك فهد لطباعة المصحف الشريف لتوفير البيانات القرآنية
- مجتمع المطورين المسلمين لدعمهم المستمر
