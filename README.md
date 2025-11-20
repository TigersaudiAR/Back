# منصة مصحف الهدى التعليمية

منصة قرآنية تعليمية متكاملة تقدم تجربة فريدة لقراءة القرآن الكريم والتعلم الإسلامي بخط عثماني أصيل وواجهة عصرية.

## 🎯 المميزات الرئيسية

### قراءة القرآن الكريم
- عرض النص القرآني بخط **UthmanicHafs** الرسمي من مجمع الملك فهد
- تنسيق مطابق لمصحف المدينة النبوية
- دوائر أرقام الآيات واضحة ومنسقة
- واجهة قراءة حديثة مع وضع ملء الشاشة
- شريط أدوات مخفي للتركيز على القراءة

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
VITE_API_URL=http://localhost:4000
VITE_QURAN_BASE=https://qurancomplex.gov.sa/quran-dev/
VITE_QURAN_API_KEY=<optional-api-key>
VITE_QURAN_PROXY=/api/quran-proxy
```

**Environment Variables Explained:**

- `VITE_API_URL`: Backend API URL (default: http://localhost:4000)
- `VITE_QURAN_BASE`: King Fahd Complex Quran API base URL (default: https://qurancomplex.gov.sa/quran-dev/)
- `VITE_QURAN_API_KEY`: Optional API key for authenticated requests to Quran API
- `VITE_QURAN_PROXY`: Netlify Function proxy endpoint for CORS-free API access (default: /api/quran-proxy)

### Netlify Functions Setup

The project includes Netlify Functions for serverless API endpoints:

1. **quran-proxy**: CORS proxy for King Fahd Complex API
   - Endpoint: `/.netlify/functions/quran-proxy?endpoint=/surah/1`
   - Usage: Forwards requests to avoid CORS issues

2. **save-question**: Save user questions (demonstration only)
   - Endpoint: `/.netlify/functions/save-question`
   - Method: POST
   - ⚠️ **Note**: File storage is ephemeral. Migrate to a database for production.

To test Netlify Functions locally:
```bash
npm install -g netlify-cli
cd front
netlify dev
```

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
