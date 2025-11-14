@echo off
REM 🕌 مصحف الهدى - سكربت التشغيل التلقائي (Windows)
REM Al-Huda Quran - Automatic Deployment Script (Windows)

echo ======================================
echo 🕌 مصحف الهدى - بدء التشغيل
echo Al-Huda Quran - Starting Deployment
echo ======================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ Node.js غير مثبت / Node.js is not installed
    echo يرجى تثبيت Node.js 20+ من https://nodejs.org
    echo Please install Node.js 20+ from https://nodejs.org
    exit /b 1
)

echo ✓ Node.js مثبت
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ npm غير مثبت / npm is not installed
    exit /b 1
)

echo ✓ npm مثبت
npm --version
echo.

REM Step 1: Install Backend Dependencies
echo الخطوة 1/6: تثبيت مكتبات الخادم...
echo Step 1/6: Installing backend dependencies...
cd back
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ✗ فشل تثبيت مكتبات الخادم
    exit /b 1
)
echo ✓ تم تثبيت مكتبات الخادم بنجاح
echo.

REM Step 2: Build Backend
echo الخطوة 2/6: بناء الخادم...
echo Step 2/6: Building backend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ✗ فشل بناء الخادم
    exit /b 1
)
echo ✓ تم بناء الخادم بنجاح
echo.

REM Step 3: Install Frontend Dependencies
echo الخطوة 3/6: تثبيت مكتبات الواجهة...
echo Step 3/6: Installing frontend dependencies...
cd ..\front
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ✗ فشل تثبيت مكتبات الواجهة
    exit /b 1
)
echo ✓ تم تثبيت مكتبات الواجهة بنجاح
echo.

REM Step 4: Build Frontend
echo الخطوة 4/6: بناء الواجهة...
echo Step 4/6: Building frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ✗ فشل بناء الواجهة
    exit /b 1
)
echo ✓ تم بناء الواجهة بنجاح
echo.

REM Step 5: Create production startup script
echo الخطوة 5/6: إنشاء سكربت التشغيل...
echo Step 5/6: Creating startup script...
cd ..

(
echo @echo off
echo REM Start Backend and Frontend
echo echo 🚀 Starting Backend Server...
echo cd back
echo start "Backend Server" node dist/server.js
echo.
echo echo 🚀 Starting Frontend Server...
echo cd ..\front
echo start "Frontend Server" npx serve -s dist -l 3000
echo.
echo echo.
echo echo ======================================
echo echo ✅ التطبيق يعمل الآن!
echo echo ✅ Application is running!
echo echo ======================================
echo echo.
echo echo 🌐 الواجهة: http://localhost:3000
echo echo 🌐 Frontend: http://localhost:3000
echo echo.
echo echo 🔧 الخادم: http://localhost:4000
echo echo 🔧 Backend: http://localhost:4000
echo echo.
echo echo للإيقاف: أغلق نوافذ الخادم
echo echo To stop: Close server windows
echo echo.
echo pause
) > start-production.bat

echo ✓ تم إنشاء سكربت التشغيل
echo.

REM Step 6: Summary
echo ======================================
echo ✅ اكتمل التثبيت بنجاح!
echo ✅ Installation completed successfully!
echo ======================================
echo.
echo لتشغيل التطبيق، استخدم:
echo To run the application, use:
echo.
echo start-production.bat
echo.
echo أو للتطوير، افتح نافذتين:
echo Or for development, open two terminals:
echo.
echo Terminal 1: cd back ^&^& npm run dev
echo Terminal 2: cd front ^&^& npm run dev
echo.

set /p REPLY="هل تريد تشغيل التطبيق الآن؟ / Do you want to start the application now? (y/n) "
if /i "%REPLY%"=="y" (
    echo جاري تشغيل التطبيق...
    echo Starting application...
    call start-production.bat
)
