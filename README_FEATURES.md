# 🕌 مصحف الهدى - منصة القرآن الكريم التعليمية
# Al-Huda Quran - Comprehensive Islamic Learning Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Security](https://img.shields.io/badge/security-0%20vulnerabilities-brightgreen)]()
[![PWA](https://img.shields.io/badge/PWA-enabled-blue)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

منصة إسلامية تعليمية شاملة ومتطورة توفر تجربة تعليمية متكاملة للقرآن الكريم والعلوم الإسلامية باستخدام أحدث التقنيات.

A comprehensive Islamic educational platform providing an integrated learning experience for the Holy Quran and Islamic sciences using cutting-edge technologies.

## ✨ المميزات الرئيسية | Key Features

### 📖 القرآن الكريم | Quran Reader
- ✅ عرض تقليدي يحاكي المصحف العثماني | Traditional Mushaf display
- ✅ خط عثماني أصلي (Uthmanic Hafs) | Authentic Uthmanic font
- ✅ عرض الجزء، الحزب، ورقم الصفحة | Juz, Hizb, and Page numbers
- ✅ تلاوات متعددة من مشايخ مختلفين | Multiple reciter options
- ✅ تفسير وترجمة عند النقر على الآية | Tafsir on ayah click
- ✅ حفظ تلقائي لآخر موضع قراءة | Auto-save reading position
- ✅ التنقل بالسحب بين السور | Swipe navigation between Surahs

### 📚 المحتوى التعليمي | Educational Content
- ✅ **تعلم الإسلام** (8 مواضيع شاملة) | What is Islam (8 comprehensive topics)
- ✅ **السيرة النبوية** (جدول زمني تفاعلي) | Prophet's Biography (interactive timeline)
- ✅ **3 مسارات تعليمية كاملة**:
  - أساسيات العربية (3 دروس) | Arabic Basics (3 lessons)
  - التجويد (3 دروس) | Tajweed (3 lessons)
  - الحفظ (3 دروس) | Memorization (3 lessons)
- ✅ **18 اختبار** (نقاط تفتيش ونهائية) | 18 quizzes (checkpoint & final)
- ✅ **27 مرحلة تفاعلية** مع تحديات | 27 interactive stages with challenges
- ✅ الأحاديث النبوية من مصادر معتمدة | Authentic Hadith collection
- ✅ الأذكار والأدعية اليومية | Daily Adhkar and Supplications
- ✅ مواقيت الصلاة حسب الموقع | Location-based prayer times

### 👥 حلقات التحفيظ | Memorization Circles
- ✅ إدارة الحلقات والطلاب | Circle and student management
- ✅ متابعة تقدم الحفظ | Progress tracking
- ✅ لوحة صدارة للأفضل 100 | Top 100 leaderboard

### 🎯 التقنيات المتقدمة | Advanced Technologies

#### Progressive Web App (PWA)
- ✅ يعمل بدون إنترنت بعد التثبيت | Offline functionality
- ✅ قابل للتثبيت كتطبيق أصلي | Installable as native app
- ✅ تحديثات تلقائية مع إشعارات | Auto-updates with notifications
- ✅ تخزين ذكي للبيانات | Intelligent caching

#### الأداء والجودة | Performance & Quality
- ✅ Service Worker للتخزين المؤقت | Service Worker caching
- ✅ تحميل سريع (تحميل مسبق للخطوط) | Fast loading (font preloading)
- ✅ تقسيم الكود (Code Splitting) | Code splitting
- ✅ تحميل كسول للصفحات | Lazy loading
- ✅ تحسين محركات البحث (SEO) | SEO optimized

#### معالجة الأخطاء | Error Handling
- ✅ Error Boundary شامل | Comprehensive error boundaries
- ✅ إعادة محاولة تلقائية للطلبات الفاشلة | Automatic retry for failed requests
- ✅ رسائل خطأ واضحة بالعربية | Clear Arabic error messages
- ✅ مؤشر حالة الاتصال | Network status indicator

#### الأمان | Security
- ✅ 0 ثغرات أمنية (CodeQL) | 0 security vulnerabilities
- ✅ قائمة بيضاء للنطاقات الموثوقة | Origin whitelisting
- ✅ مصادقة آمنة بالتوكن | Secure token authentication
- ✅ حماية من CSRF | CSRF protection

### 🎨 تجربة المستخدم | User Experience
- ✅ واجهة عربية جميلة | Beautiful Arabic UI
- ✅ تصميم متجاوب لجميع الأجهزة | Responsive design
- ✅ دعم إمكانية الوصول (ARIA) | Accessibility support
- ✅ وضع ليلي ونهاري | Dark/Light themes
- ✅ رسوم متحركة سلسة | Smooth animations

### 👨‍💼 لوحة التحكم | Admin Dashboard
- ✅ إدارة المستخدمين | User management
- ✅ إدارة المحتوى | Content management
- ✅ صلاحيات متعددة (مدير، معلم، دعم) | Multiple roles
- ✅ إحصائيات وتقارير | Analytics and reports

## 🚀 البدء السريع | Quick Start

### المتطلبات | Prerequisites
- Node.js 20+ 
- npm أو yarn

### التثبيت | Installation

```bash
# استنساخ المشروع | Clone repository
git clone https://github.com/TigersaudiAR/Back.git
cd Back

# تثبيت المكتبات - الخادم | Install backend dependencies
cd back
npm install

# تثبيت المكتبات - الواجهة | Install frontend dependencies
cd ../front
npm install
```

### التشغيل في بيئة التطوير | Development

```bash
# تشغيل الخادم | Run backend
cd back
npm run dev
# سيعمل على http://localhost:4000

# تشغيل الواجهة (في نافذة جديدة) | Run frontend (new terminal)
cd front
npm run dev
# سيعمل على http://localhost:5173
```

### البناء للإنتاج | Production Build

```bash
# بناء الخادم | Build backend
cd back
npm run build

# بناء الواجهة | Build frontend
cd front
npm run build
```

## 📁 هيكل المشروع | Project Structure

```
Back/
├── back/                    # الخادم (Backend - Express + TypeScript)
│   ├── src/
│   │   ├── routes/         # نقاط النهاية API
│   │   ├── services/       # منطق العمل
│   │   ├── middleware/     # المصادقة والتحقق
│   │   ├── types/          # تعريفات TypeScript
│   │   └── utils/          # وظائف مساعدة
│   ├── data/seed/          # بيانات أولية
│   └── package.json
│
├── front/                   # الواجهة (Frontend - React + Vite)
│   ├── src/
│   │   ├── components/     # مكونات قابلة لإعادة الاستخدام
│   │   ├── pages/          # صفحات التطبيق
│   │   ├── layouts/        # تخطيطات الصفحات
│   │   ├── hooks/          # React Hooks مخصصة
│   │   ├── store/          # إدارة الحالة (Zustand)
│   │   ├── utils/          # وظائف مساعدة
│   │   └── styles/         # ملفات CSS
│   ├── public/
│   │   ├── sw.js          # Service Worker
│   │   └── manifest.json  # PWA Manifest
│   └── package.json
│
└── README.md
```

## 🔧 التقنيات المستخدمة | Technologies Used

### Backend
- **Express.js** - إطار عمل الخادم
- **TypeScript** - لغة برمجة قوية
- **JWT** - المصادقة الآمنة
- **bcrypt** - تشفير كلمات المرور

### Frontend
- **React 18** - مكتبة بناء الواجهات
- **TypeScript** - أمان الأنواع
- **Vite** - أداة بناء سريعة
- **Tailwind CSS** - تصميم عصري
- **DaisyUI** - مكونات جاهزة
- **Framer Motion** - رسوم متحركة
- **Zustand** - إدارة الحالة
- **Axios** - طلبات HTTP
- **React Router** - التوجيه

### DevOps & Tools
- **Service Worker** - دعم PWA
- **CodeQL** - فحص الأمان
- **ESLint** - جودة الكود
- **Prettier** - تنسيق الكود

## 📱 PWA Installation | تثبيت التطبيق

يمكن تثبيت التطبيق كتطبيق أصلي على:
The app can be installed as a native app on:

- 📱 Android (Chrome, Edge, Samsung Internet)
- 🍎 iOS/iPadOS (Safari - Add to Home Screen)
- 💻 Desktop (Chrome, Edge, Brave)

### خطوات التثبيت | Installation Steps:
1. افتح التطبيق في المتصفح
2. ابحث عن أيقونة "تثبيت" في شريط العنوان
3. اضغط "تثبيت" أو "Add to Home Screen"
4. استمتع بالتطبيق بدون متصفح!

## 🌐 API Endpoints

### Quran
- `GET /api/quran` - قائمة السور
- `GET /api/quran?surah=1` - آيات سورة محددة
- `GET /api/quran/index` - فهرس السور
- `GET /api/quran/tafsir` - التفسير

### Islamic Learning
- `GET /api/islamic-learning/what-is-islam` - محتوى "تعلم الإسلام"
- `GET /api/islamic-learning/seerah` - السيرة النبوية
- `GET /api/islamic-learning/search?q=query` - بحث في المحتوى

### Others
- `GET /api/hadith` - الأحاديث
- `GET /api/adhkar` - الأذكار
- `GET /api/halaqat` - حلقات التحفيظ
- `GET /api/prayers` - مواقيت الصلاة

## 🔐 الأمان | Security

- ✅ **0 ثغرات أمنية** تم اكتشافها بواسطة CodeQL
- ✅ تشفير كلمات المرور بـ bcrypt
- ✅ مصادقة JWT آمنة
- ✅ حماية من هجمات XSS
- ✅ قائمة بيضاء للنطاقات في Service Worker
- ✅ تحديد زمن انتهاء للطلبات (30 ثانية)

## 🎯 الميزات القادمة | Upcoming Features

- [ ] إضافة المزيد من التفاسير
- [ ] دعم لغات إضافية
- [ ] نظام إشعارات متقدم
- [ ] تطبيقات أصلية للهواتف
- [ ] منتدى للنقاشات
- [ ] البث المباشر للدروس
- [ ] نظام نقاط وجوائز

## 👨‍💻 المساهمة | Contributing

نرحب بمساهماتكم! يرجى اتباع الخطوات التالية:

1. Fork المشروع
2. أنشئ فرع للميزة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للفرع (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

## 📄 الترخيص | License

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## 📞 التواصل | Contact

- **الموقع**: [قريباً]
- **البريد**: support@alhuda-quran.com
- **GitHub**: [@TigersaudiAR](https://github.com/TigersaudiAR)

## 🙏 شكر وتقدير | Acknowledgments

- القرآن الكريم من [api.quran.com](https://api.quran.com)
- الخط العثماني من [Islamic Network](https://islamic.network)
- جميع المساهمين في المشروع

---

<div align="center">

**صُنع بـ ❤️ لخدمة القرآن الكريم والعلوم الإسلامية**

Made with ❤️ to serve the Holy Quran and Islamic Sciences

</div>
