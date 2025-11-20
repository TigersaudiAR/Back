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

#### Frontend (`front/.env`)
إنشاء ملف `.env` في مجلد `front/`:
```env
# Backend API URL
VITE_API_URL=http://localhost:4000

# Quran Complex API Configuration
VITE_QURAN_BASE=https://qurancomplex.gov.sa/quran-dev
VITE_QURAN_API_KEY=your_api_key_if_needed

# Netlify Functions (for production)
VITE_QURAN_PROXY=/.netlify/functions/quran-proxy
```

#### Backend (`back/.env`)
إنشاء ملف `.env` في مجلد `back/`:
```env
PORT=4000
NODE_ENV=development
```

### Netlify Deployment

لنشر التطبيق على Netlify:

1. **تثبيت Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **تسجيل الدخول**:
   ```bash
   netlify login
   ```

3. **الربط بالمشروع**:
   ```bash
   cd front
   netlify init
   ```

4. **تعيين متغيرات البيئة في Netlify Dashboard**:
   - `VITE_QURAN_BASE`
   - `VITE_QURAN_API_KEY` (if needed)
   - `VITE_API_URL`

5. **النشر**:
   ```bash
   netlify deploy --prod
   ```

أو استخدم GitHub integration للنشر التلقائي.

### Netlify Functions Endpoints

بعد النشر، ستتوفر الـ Functions التالية:

- `/.netlify/functions/quran-proxy` - CORS proxy for Quran API
- `/.netlify/functions/save-question` - Save questions from scholars form

### QuranReader Features

المزايا الجديدة في قارئ القرآن:

- ✅ عرض صفحات المصحف بالصور الرسمية
- ✅ التنقل بالسحب (Swipe) أو مفاتيح الأسهم
- ✅ حفظ آخر موضع قراءة
- ✅ العرض التقليدي (نصي) للطباعة
- ✅ دعم PWA للعمل بدون اتصال
- ✅ التخزين المؤقت الذكي
- 🔄 التفسير والتلاوة (قيد التطوير)
- 🔄 الآيات التفاعلية مع Bounding Boxes (قيد التطوير)

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
