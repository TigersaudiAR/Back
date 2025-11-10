#!/bin/bash

# 🕌 مصحف الهدى - سكربت التشغيل التلقائي
# Al-Huda Quran - Automatic Deployment Script

set -e  # Exit on any error

echo "======================================"
echo "🕌 مصحف الهدى - بدء التشغيل"
echo "Al-Huda Quran - Starting Deployment"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js غير مثبت / Node.js is not installed"
    print_info "يرجى تثبيت Node.js 20+ من https://nodejs.org"
    print_info "Please install Node.js 20+ from https://nodejs.org"
    exit 1
fi

print_success "Node.js مثبت - إصدار: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm غير مثبت / npm is not installed"
    exit 1
fi

print_success "npm مثبت - إصدار: $(npm --version)"
echo ""

# Step 1: Install Backend Dependencies
print_info "الخطوة 1/6: تثبيت مكتبات الخادم..."
print_info "Step 1/6: Installing backend dependencies..."
cd back
npm install --silent
if [ $? -eq 0 ]; then
    print_success "تم تثبيت مكتبات الخادم بنجاح"
else
    print_error "فشل تثبيت مكتبات الخادم"
    exit 1
fi
echo ""

# Step 2: Build Backend
print_info "الخطوة 2/6: بناء الخادم..."
print_info "Step 2/6: Building backend..."
npm run build
if [ $? -eq 0 ]; then
    print_success "تم بناء الخادم بنجاح"
else
    print_error "فشل بناء الخادم"
    exit 1
fi
echo ""

# Step 3: Install Frontend Dependencies
print_info "الخطوة 3/6: تثبيت مكتبات الواجهة..."
print_info "Step 3/6: Installing frontend dependencies..."
cd ../front
npm install --silent
if [ $? -eq 0 ]; then
    print_success "تم تثبيت مكتبات الواجهة بنجاح"
else
    print_error "فشل تثبيت مكتبات الواجهة"
    exit 1
fi
echo ""

# Step 4: Build Frontend
print_info "الخطوة 4/6: بناء الواجهة..."
print_info "Step 4/6: Building frontend..."
npm run build
if [ $? -eq 0 ]; then
    print_success "تم بناء الواجهة بنجاح"
else
    print_error "فشل بناء الواجهة"
    exit 1
fi
echo ""

# Step 5: Create production startup script
print_info "الخطوة 5/6: إنشاء سكربت التشغيل..."
print_info "Step 5/6: Creating startup script..."
cd ..

cat > start-production.sh << 'SCRIPT'
#!/bin/bash

# Start Backend
echo "🚀 Starting Backend Server..."
cd back
node dist/server.js &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Start Frontend (using a simple HTTP server)
echo "🚀 Starting Frontend Server..."
cd ../front
npx --yes serve -s dist -l 3000 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "======================================"
echo "✅ التطبيق يعمل الآن!"
echo "✅ Application is running!"
echo "======================================"
echo ""
echo "🌐 الواجهة: http://localhost:3000"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "🔧 الخادم: http://localhost:4000"
echo "🔧 Backend: http://localhost:4000"
echo ""
echo "للإيقاف: اضغط Ctrl+C"
echo "To stop: Press Ctrl+C"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
SCRIPT

chmod +x start-production.sh
print_success "تم إنشاء سكربت التشغيل"
echo ""

# Step 6: Summary
print_success "======================================"
print_success "✅ اكتمل التثبيت بنجاح!"
print_success "✅ Installation completed successfully!"
print_success "======================================"
echo ""
print_info "لتشغيل التطبيق، استخدم:"
print_info "To run the application, use:"
echo ""
echo -e "${GREEN}./start-production.sh${NC}"
echo ""
print_info "أو للتطوير، استخدم:"
print_info "Or for development, use:"
echo ""
echo "# Terminal 1 - Backend"
echo "cd back && npm run dev"
echo ""
echo "# Terminal 2 - Frontend"
echo "cd front && npm run dev"
echo ""

# Optionally start the application now
read -p "هل تريد تشغيل التطبيق الآن؟ / Do you want to start the application now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "جاري تشغيل التطبيق..."
    print_info "Starting application..."
    ./start-production.sh
fi
