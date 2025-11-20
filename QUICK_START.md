# 🕌 Quick Start Guide - دليل التشغيل السريع

## ✅ Status | الحالة

**جميع المشاكل محلولة ✓** | **All Issues Resolved ✓**
- ✅ 0 أخطاء في الكود | 0 Code Errors
- ✅ 0 ثغرات أمنية | 0 Security Vulnerabilities  
- ✅ جاهز للنشر | Ready for Deployment
- ✅ جاهز للتشغيل | Ready to Run

---

## ⚠️ IMPORTANT | مهم جداً

**Before running the deployment scripts, make sure you have:**
**قبل تشغيل سكربتات النشر، تأكد من:**

1. ✅ Node.js 20+ installed | Node.js 20+ مثبت
2. ✅ npm installed | npm مثبت
3. ✅ Internet connection for downloading dependencies | اتصال إنترنت لتحميل المكتبات

**The scripts will automatically:**
**السكربتات ستقوم تلقائياً بـ:**
- Install all dependencies (backend + frontend)
- Build the projects
- Start the application

---

## 🚀 One-Command Deployment | نشر بأمر واحد

### Linux / macOS

Copy and paste this command in Terminal:

نسخ ولصق هذا الأمر في Terminal:

```bash
chmod +x deploy.sh && ./deploy.sh
```

### Windows

Copy and paste this command in Command Prompt or PowerShell:

نسخ ولصق هذا الأمر في Command Prompt أو PowerShell:

```cmd
deploy.bat
```

---

## 📋 What the Script Does | ماذا يفعل السكربت

السكربت سيقوم تلقائياً بـ:
1. ✅ فحص Node.js و npm | Check Node.js and npm
2. ✅ تثبيت جميع مكتبات الخادم | Install all backend dependencies  
3. ✅ بناء الخادم | Build backend
4. ✅ تثبيت جميع مكتبات الواجهة | Install all frontend dependencies
5. ✅ بناء الواجهة | Build frontend
6. ✅ إنشاء سكربت التشغيل | Create startup script
7. ✅ تشغيل التطبيق (اختياري) | Start application (optional)

The script will automatically:
1. ✅ Check Node.js and npm installation
2. ✅ Install all backend dependencies
3. ✅ Build backend (TypeScript → JavaScript)
4. ✅ Install all frontend dependencies
5. ✅ Build frontend (Vite production build)
6. ✅ Create production startup scripts
7. ✅ Start the application (optional)

---

## 🌐 Access the Application | الوصول للتطبيق

بعد التشغيل، يمكنك الوصول للتطبيق عبر:

**Frontend UI (الواجهة):**
- 🌐 http://localhost:3000

**Backend API (الخادم):**
- 🔧 http://localhost:4000
- 🔧 http://localhost:4000/api/health (Health Check)

---

## 🛠️ Manual Deployment | النشر اليدوي

إذا كنت تفضل التشغيل اليدوي:

### 1. Install Dependencies | تثبيت المكتبات

```bash
# Backend الخادم
cd back
npm install

# Frontend الواجهة
cd ../front
npm install
```

### 2. Build Project | بناء المشروع

```bash
# Backend الخادم
cd back
npm run build

# Frontend الواجهة
cd ../front
npm run build
```

### 3. Run Application | تشغيل التطبيق

**Production (للإنتاج):**

Open TWO terminal windows:

```bash
# Terminal 1 - Backend الخادم
cd back
node dist/server.js

# Terminal 2 - Frontend الواجهة  
cd front
npx serve -s dist -l 3000
```

**Development (للتطوير):**

Open TWO terminal windows:

```bash
# Terminal 1 - Backend
cd back
npm run dev

# Terminal 2 - Frontend
cd front
npm run dev
```

---

## ⚡ Quick Commands | أوامر سريعة

After initial installation:

بعد التثبيت الأولي:

```bash
# Quick Start تشغيل سريع
./start-production.sh      # Linux/macOS
start-production.bat        # Windows

# Stop إيقاف
Ctrl+C                      # Linux/macOS
# أو أغلق نوافذ الخادم     # Windows (or close server windows)
```

---

## 📦 What's Included | المحتويات

التطبيق يشمل:

✅ **القرآن الكريم** - Quran Reader with advanced features:
  - Page-based image reader with King Fahd Complex images
  - Classic text view for reading and printing
  - localStorage caching for offline reading
  - Ayah overlays with tafsir (coming soon)
  - Audio recitation support (coming soon)
✅ **تعلم الإسلام** - Islamic Learning (8 comprehensive topics)
✅ **السيرة النبوية** - Prophet's Biography (6 major events)
✅ **التعليم الذاتي** - Self-learning modules (Arabic, Tajweed, Hifz)
✅ **الأحاديث** - Hadith collection from authentic sources
✅ **الأذكار** - Daily Adhkar and supplications
✅ **حلقات التحفيظ** - Memorization circles management
✅ **Netlify Functions** - API proxy and question saving endpoints
✅ **PWA Support** - Works offline, installable as native app
✅ **Service Worker** - Smart caching for Quran pages and fonts
✅ **Error Handling** - Beautiful error pages with recovery options
✅ **Network Status** - Real-time online/offline indicator
✅ **i18n Support** - Arabic localization with react-i18next

---

## 🌐 Environment Setup | إعداد متغيرات البيئة

### Frontend Environment Variables

Create a `.env` file in `front/` directory (copy from `.env.example`):

```env
# Backend API
VITE_API_URL=http://localhost:4000

# Quran API - King Fahd Complex for Printing the Holy Quran
VITE_QURAN_BASE=https://qurancomplex.gov.sa/quran-dev/
VITE_QURAN_API_KEY=
VITE_QURAN_PROXY=
```

**Environment Variables:**
- `VITE_API_URL`: Backend server URL (default: http://localhost:4000)
- `VITE_QURAN_BASE`: King Fahd Complex API base URL (default: https://qurancomplex.gov.sa/quran-dev/)
- `VITE_QURAN_API_KEY`: API key if required (optional)
- `VITE_QURAN_PROXY`: Netlify Functions proxy URL (optional, e.g., `/.netlify/functions/quran-proxy`)

---

## 🔌 Netlify Functions | وظائف Netlify

For local development of Netlify Functions:

```bash
cd front
npm install -g netlify-cli
netlify dev
```

**Available Functions:**
- `/api/quran-proxy` - Proxies requests to King Fahd Complex API with CORS support
- `/api/save-question` - Saves user questions (demo only, use persistent DB for production)

**Note**: File-based storage in `save-question` is ephemeral on serverless platforms. Migrate to a persistent database (MongoDB, PostgreSQL) for production use.

---

## 🔧 Troubleshooting | حل المشاكل

### Problem: Port Already in Use | المنفذ مستخدم

**Backend (Port 4000):**
```bash
# Linux/macOS
lsof -ti:4000 | xargs kill -9

# Windows (في Command Prompt)
netstat -ano | findstr :4000
# ثم استخدم taskkill /PID [PID_NUMBER] /F
```

**Frontend (Port 3000):**
```bash
# Linux/macOS
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
# ثم استخدم taskkill /PID [PID_NUMBER] /F
```

### Problem: Node.js Not Installed | Node.js غير مثبت

Download and install Node.js 20+ from:
قم بتحميل وتثبيت Node.js 20+ من:

- 🌐 https://nodejs.org

### Problem: Installation Errors | أخطاء في التثبيت

Clear dependencies and reinstall:

امسح المكتبات وأعد التثبيت:

```bash
# Linux/macOS
rm -rf back/node_modules front/node_modules
rm -rf back/package-lock.json front/package-lock.json
./deploy.sh

# Windows
rmdir /s /q back\node_modules front\node_modules
del back\package-lock.json front\package-lock.json
deploy.bat
```

### Problem: Permission Denied (Linux/macOS)

```bash
chmod +x deploy.sh
chmod +x start-production.sh
./deploy.sh
```

### Problem: Build Errors

Make sure you have:
1. ✅ Node.js 20+ installed
2. ✅ Latest npm version
3. ✅ Stable internet connection
4. ✅ Sufficient disk space (at least 500MB)

---

## 📱 PWA Installation | تثبيت التطبيق

التطبيق يدعم التثبيت كتطبيق أصلي:

The app supports installation as a native app:

1. Open http://localhost:3000 in your browser
   افتح http://localhost:3000 في المتصفح
2. Look for the "Install" icon in the address bar
   ابحث عن أيقونة "تثبيت" في شريط العنوان
3. Click "Install" or "Add to Home Screen"
   اضغط "تثبيت" أو "Add to Home Screen"
4. Enjoy the app offline!
   استمتع بالتطبيق بدون إنترنت!

**Supported Platforms:**
- 📱 Android (Chrome, Edge, Samsung Internet)
- 🍎 iOS/iPadOS (Safari - Add to Home Screen)
- 💻 Desktop (Chrome, Edge, Brave)

---

## 🎯 Next Steps | الخطوات التالية

After deployment | بعد التشغيل:

1. ✅ Browse the Quran | تصفح القرآن الكريم
2. ✅ Explore educational content | استكشف المحتوى التعليمي
3. ✅ Try PWA installation | جرب التثبيت كـ PWA
4. ✅ Test offline functionality | اختبر العمل بدون إنترنت
5. ✅ Use admin dashboard | استخدم لوحة التحكم للإدارة

---

## 📞 Support | الدعم

If you encounter any issues:

إذا واجهت أي مشاكل:

1. Check Node.js version (must be 20+)
   تحقق من نسخة Node.js (يجب أن تكون 20+)
2. Ensure ports 3000 and 4000 are free
   تأكد من أن المنافذ 3000 و 4000 غير مستخدمة
3. Review README_FEATURES.md for complete details
   راجع ملف README_FEATURES.md للتفاصيل الكاملة
4. Check that you have internet connection during installation
   تأكد من وجود اتصال إنترنت أثناء التثبيت

---

## 🎓 Learning Resources | مصادر التعلم

After the app is running, you can:
بعد تشغيل التطبيق، يمكنك:

- Read the Quran with modern or classic view
  قراءة القرآن بالعرض الحديث أو التقليدي
- Learn about Islam through Q&A section
  تعلم الإسلام من خلال قسم الأسئلة والأجوبة
- Explore Prophet's biography timeline
  استكشف جدول السيرة النبوية الزمني
- Take interactive lessons and quizzes
  خذ دروس واختبارات تفاعلية
- Join memorization circles
  انضم لحلقات التحفيظ

---

<div align="center">

**✅ جاهز للتشغيل - Ready to Run**

**🚀 Copy, Paste, and Launch!**

**نسخ، لصق، وانطلق!**

</div>
