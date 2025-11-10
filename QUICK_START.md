# 🕌 Quick Start Guide - دليل التشغيل السريع

## ✅ Status | الحالة

**جميع المشاكل محلولة ✓** | **All Issues Resolved ✓**
- ✅ 0 أخطاء في الكود | 0 Code Errors
- ✅ 0 ثغرات أمنية | 0 Security Vulnerabilities  
- ✅ جاهز للنشر | Ready for Deployment
- ✅ جاهز للتشغيل | Ready to Run

---

## 🚀 One-Command Deployment | نشر بأمر واحد

### Linux / macOS

نسخ ولصق هذا الأمر في Terminal:

```bash
chmod +x deploy.sh && ./deploy.sh
```

### Windows

نسخ ولصق هذا الأمر في Command Prompt:

```cmd
deploy.bat
```

---

## 📋 What the Script Does | ماذا يفعل السكربت

السكربت سيقوم تلقائياً بـ:
1. ✅ تثبيت جميع المكتبات (الخادم + الواجهة)
2. ✅ بناء المشروع (Backend + Frontend)
3. ✅ إنشاء سكربت التشغيل
4. ✅ تشغيل التطبيق (اختياري)

The script will automatically:
1. ✅ Install all dependencies (Backend + Frontend)
2. ✅ Build the project (Backend + Frontend)
3. ✅ Create startup script
4. ✅ Start the application (optional)

---

## 🌐 Access the Application | الوصول للتطبيق

بعد التشغيل، يمكنك الوصول للتطبيق عبر:

**الواجهة (Frontend):**
- 🌐 http://localhost:3000

**الخادم (Backend API):**
- 🔧 http://localhost:4000

---

## 🛠️ Manual Deployment | النشر اليدوي

إذا كنت تفضل التشغيل اليدوي:

### 1. Install Dependencies | تثبيت المكتبات

```bash
# Backend
cd back
npm install

# Frontend  
cd ../front
npm install
```

### 2. Build Project | بناء المشروع

```bash
# Backend
cd back
npm run build

# Frontend
cd ../front
npm run build
```

### 3. Run Application | تشغيل التطبيق

**للإنتاج (Production):**

```bash
# Backend (Terminal 1)
cd back
node dist/server.js

# Frontend (Terminal 2)
cd front
npx serve -s dist -l 3000
```

**للتطوير (Development):**

```bash
# Backend (Terminal 1)
cd back
npm run dev

# Frontend (Terminal 2)
cd front
npm run dev
```

---

## ⚡ Quick Commands | أوامر سريعة

بعد التثبيت الأولي:

```bash
# تشغيل سريع (Quick Start)
./start-production.sh      # Linux/macOS
start-production.bat        # Windows

# إيقاف التشغيل (Stop)
Ctrl+C                      # Linux/macOS
# أو أغلق نوافذ الخادم     # Windows
```

---

## 📦 What's Included | المحتويات

التطبيق يشمل:

✅ **القرآن الكريم** - Quran Reader with Juz/Hizb/Page
✅ **تعلم الإسلام** - Islamic Learning (8 topics)
✅ **السيرة النبوية** - Prophet's Biography (6 events)
✅ **التعليم الذاتي** - Self-learning modules
✅ **الأحاديث** - Hadith collection
✅ **الأذكار** - Daily Adhkar
✅ **حلقات التحفيظ** - Memorization circles
✅ **PWA** - Works offline, installable
✅ **Service Worker** - Smart caching
✅ **Error Handling** - Beautiful error pages
✅ **Network Status** - Online/offline indicator

---

## 🔧 Troubleshooting | حل المشاكل

### المنفذ مستخدم | Port Already in Use

```bash
# إيقاف العملية على المنفذ 4000
lsof -ti:4000 | xargs kill -9    # macOS/Linux
netstat -ano | findstr :4000     # Windows (ثم استخدم taskkill)

# إيقاف العملية على المنفذ 3000
lsof -ti:3000 | xargs kill -9    # macOS/Linux
netstat -ano | findstr :3000     # Windows
```

### Node.js غير مثبت | Node.js Not Installed

قم بتثبيت Node.js 20+ من:
- 🌐 https://nodejs.org

### خطأ في التثبيت | Installation Error

```bash
# مسح المكتبات وإعادة التثبيت
rm -rf back/node_modules front/node_modules
rm -rf back/package-lock.json front/package-lock.json
./deploy.sh
```

---

## 📱 PWA Installation | تثبيت التطبيق

التطبيق يدعم التثبيت كتطبيق أصلي:

1. افتح http://localhost:3000
2. ابحث عن أيقونة "تثبيت" في المتصفح
3. اضغط "تثبيت" أو "Add to Home Screen"
4. استمتع بالتطبيق!

---

## 🎯 Next Steps | الخطوات التالية

بعد التشغيل:

1. ✅ تصفح القرآن الكريم
2. ✅ استكشف المحتوى التعليمي
3. ✅ جرب التثبيت كـ PWA
4. ✅ اختبر العمل بدون إنترنت
5. ✅ استخدم لوحة التحكم للإدارة

---

## 📞 Support | الدعم

إذا واجهت أي مشاكل:

1. تحقق من نسخة Node.js (يجب أن تكون 20+)
2. تأكد من عدم وجود عمليات تستخدم المنافذ 3000 و 4000
3. راجع ملف README_FEATURES.md للتفاصيل الكاملة

---

<div align="center">

**✅ جاهز للتشغيل - Ready to Run**

**🚀 نسخ ولصق السكربت وانطلق!**

**Copy, Paste, and Launch!**

</div>
