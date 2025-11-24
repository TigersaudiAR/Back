# 📚 نظام الدروس التفاعلية الشامل - Comprehensive Interactive Lessons System

## 🎯 Overview | نظرة عامة

A complete, production-ready interactive lessons system for Islamic educational content with advanced features including progress tracking, achievements, certificates, and notifications.

نظام شامل وجاهز للإنتاج للدروس التعليمية الإسلامية التفاعلية مع ميزات متقدمة تشمل تتبع التقدم والإنجازات والشهادات والإشعارات.

## ✨ Key Features | المميزات الرئيسية

### 🎓 Lesson Management | إدارة الدروس
- ✅ Complete CRUD operations (Create, Read, Update, Delete)
- ✅ Multi-category support (Aqidah, Fiqh, Sirah, Quran, Hadith, Akhlaq, Arabic, Tajweed)
- ✅ Four difficulty levels (Beginner, Intermediate, Advanced, Expert)
- ✅ Rich content blocks (text, lists, quotes, media)
- ✅ Prerequisites and learning paths
- ✅ Draft/Published/Archived status

### 🔍 Advanced Search & Filtering | البحث والفلترة المتقدمة
- ✅ Full-text search across titles and descriptions
- ✅ Multi-criteria filtering (category, level, duration, topics, status)
- ✅ Sorting by multiple fields (title, date, popularity, rating)
- ✅ Pagination with faceted results
- ✅ Smart filtering with result counts

### 📊 Progress Tracking | تتبع التقدم
- ✅ Detailed progress percentages per lesson
- ✅ Time spent tracking
- ✅ Bookmarks and notes
- ✅ Content block-level progress
- ✅ Learning streaks (consecutive days)
- ✅ Category and level-based analytics

### 📝 Quiz & Assessment | الاختبارات والتقييم
- ✅ Multiple choice questions with explanations
- ✅ Automatic grading (70% passing threshold)
- ✅ Multiple attempts tracking
- ✅ Detailed result feedback
- ✅ Perfect score detection
- ✅ Quiz history and analytics

### 🏆 Gamification | التحفيز
- ✅ Achievement system with 5+ badges
- ✅ Point-based progression
- ✅ Learning streaks
- ✅ Certificates for perfect scores
- ✅ Rarity tiers (Common, Rare, Epic, Legendary)
- ✅ Leaderboard support

### 🔔 Notifications | الإشعارات
- ✅ New lesson notifications
- ✅ Achievement earned alerts
- ✅ Reminder system
- ✅ User preferences management
- ✅ Read/unread status
- ✅ Email and push notification support (hooks ready)

### 👥 User Roles | الأدوار
- ✅ Student: View and complete lessons
- ✅ Teacher: Create and edit lessons
- ✅ Admin: Full system access including deletion

## 🏗️ Architecture | البنية المعمارية

### Backend Stack
```
TypeScript + Express + JWT Authentication
├── Types Layer (lesson.types.ts)
│   └── 20+ interfaces for type safety
├── Service Layer (lessonService.ts)
│   └── Business logic and data management
└── Routes Layer (lessons.ts)
    └── 25+ RESTful API endpoints
```

### Frontend Stack
```
React 18 + TypeScript + Tailwind CSS + DaisyUI
├── Admin Dashboard (LessonAdminDashboard.tsx)
│   └── Lesson CRUD, search, filtering, pagination
└── User Dashboard (UserLessonDashboard.tsx)
    └── Progress visualization, achievements, certificates
```

### Database Schema
```
14 Entities with complete relationships:
├── Core: Lesson, Topic, ContentBlock, MediaContent, QuizQuestion
├── Progress: UserLessonProgress, QuizAttempt, QuizQuestionResult
├── Gamification: Achievement, UserAchievement, Certificate
└── Communication: Notification, UserLessonStats, NotificationPreferences
```

## 📡 API Endpoints | نقاط النهاية

### Public Endpoints
- `GET /api/lessons` - List lessons with filtering
- `GET /api/lessons/:id` - Get lesson details
- `GET /api/lessons/category/:category` - Filter by category
- `GET /api/lessons/leaderboard/top` - Get leaderboard
- `GET /api/lessons/topics/all` - List all topics
- `GET /api/lessons/topics/category/:category` - Topics by category

### Authenticated Endpoints (Students)
- `GET /api/lessons/progress/me` - User statistics
- `GET /api/lessons/progress/lesson/:id` - Lesson progress
- `POST /api/lessons/progress/:id` - Update progress
- `POST /api/lessons/:id/complete` - Complete lesson
- `POST /api/lessons/:id/quiz` - Submit quiz
- `GET /api/lessons/certificates/me` - User certificates
- `GET /api/lessons/achievements/me` - User achievements
- `GET /api/lessons/notifications/me` - User notifications
- `POST /api/lessons/notifications/:id/read` - Mark as read
- `GET /api/lessons/notifications/preferences` - Get preferences
- `PUT /api/lessons/notifications/preferences` - Update preferences

### Admin/Teacher Endpoints
- `POST /api/lessons` - Create lesson (Teacher+)
- `PUT /api/lessons/:id` - Update lesson (Teacher+)
- `DELETE /api/lessons/:id` - Delete lesson (Admin only)
- `POST /api/lessons/topics` - Create topic (Teacher+)

See [API Documentation](back/docs/LESSONS_API.md) for detailed request/response examples.

## 💾 Data Models | نماذج البيانات

### Lesson
```typescript
{
  id: string
  category: LessonCategory
  topics: string[]
  title: string
  level: LessonLevel
  duration: number  // minutes
  description: string
  objectives: string[]
  prerequisites: string[]
  content: ContentBlock[]
  quiz: QuizQuestion[]
  points: number
  status: "draft" | "published" | "archived"
  viewCount: number
  completionCount: number
}
```

### UserLessonProgress
```typescript
{
  userId: string
  lessonId: string
  status: "not_started" | "in_progress" | "completed"
  progress: number  // 0-100
  timeSpent: number  // seconds
  bookmarks: string[]
  notes: string
}
```

See [ERD Documentation](back/docs/LESSONS_ERD.md) for complete schema.

## 🚀 Getting Started | البدء

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
cd back && npm install
cd ../front && npm install
```

2. **Build backend:**
```bash
cd back && npm run build
```

3. **Run development servers:**
```bash
# Terminal 1: Backend
cd back && npm run dev

# Terminal 2: Frontend
cd front && npm run dev
```

4. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api/lessons

### Environment Variables
```env
# Backend (.env)
JWT_SECRET=your-secret-key
PORT=4000

# Frontend (.env)
VITE_API_URL=http://localhost:4000
```

## 📖 Usage Examples | أمثلة الاستخدام

### Create a Lesson (Teacher)
```typescript
POST /api/lessons
Authorization: Bearer <token>

{
  "category": "aqidah",
  "title": "أركان الإيمان",
  "level": "beginner",
  "duration": 20,
  "description": "درس شامل عن أركان الإيمان الستة",
  "objectives": ["معرفة الأركان", "فهم الأهمية"],
  "content": [
    {
      "id": "block-1",
      "type": "text",
      "order": 0,
      "title": "المقدمة",
      "body": "محتوى الدرس..."
    }
  ],
  "quiz": [
    {
      "id": "q1",
      "question": "كم عدد أركان الإيمان؟",
      "options": ["خمسة", "ستة", "سبعة"],
      "correct": 1,
      "explanation": "أركان الإيمان ستة..."
    }
  ],
  "points": 10,
  "order": 1
}
```

### Search Lessons
```typescript
GET /api/lessons?query=إيمان&category=aqidah&level=beginner&page=1&limit=10
```

### Submit Quiz
```typescript
POST /api/lessons/aqidah-1/quiz
Authorization: Bearer <token>

{
  "answers": [1, 0, 2]
}
```

## 🔒 Security | الأمان

### Current Implementation
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ TypeScript type safety
- ✅ Input validation via types

### Production Requirements
- ⚠️ Rate limiting (see recommendations in API docs)
- ⚠️ Database migration from in-memory storage
- ⚠️ HTTPS enforcement
- ⚠️ Input sanitization
- ⚠️ Error handling improvements
- ⚠️ Audit logging

See [Security Considerations](back/docs/LESSONS_API.md#security-considerations) for details.

## 📊 Statistics & Analytics | الإحصائيات

### User Statistics
- Total lessons completed
- Total points earned
- Time spent learning
- Learning streak (consecutive days)
- Category-wise progress
- Average quiz scores
- Perfect scores count

### Lesson Statistics
- View count
- Completion count
- Average completion time
- Quiz pass rate
- User ratings

## 🎮 Gamification Elements | عناصر التحفيز

### Achievements
- 🎯 البداية الموفقة - Complete first lesson (10 points)
- 📚 طالب العلم - Complete 5 lessons (25 points)
- ⭐ الإتقان الكامل - Perfect quiz score (20 points)
- 🕌 عالم العقيدة - Master Aqidah category (50 points)
- 🔥 المثابر الأسبوعي - 7-day streak (30 points)

### Certificates
Awarded automatically for 100% quiz scores, includes:
- Lesson title and category
- Score percentage
- Issuance date
- Unique certificate ID

## 🗂️ File Structure | هيكل الملفات

```
Back/
├── back/
│   ├── src/
│   │   ├── types/
│   │   │   ├── index.ts
│   │   │   └── lesson.types.ts (309 lines)
│   │   ├── services/
│   │   │   └── lessonService.ts (734 lines)
│   │   ├── routes/
│   │   │   └── lessons.ts (287 lines)
│   │   └── middleware/
│   │       └── auth.ts
│   ├── docs/
│   │   ├── LESSONS_API.md (API Reference)
│   │   └── LESSONS_ERD.md (Database Schema)
│   └── data/seed/lessons/
│       └── lessons.json
├── front/
│   └── src/
│       └── components/
│           ├── admin/
│           │   └── LessonAdminDashboard.tsx (330 lines)
│           └── lessons/
│               └── UserLessonDashboard.tsx (264 lines)
└── LESSONS_SYSTEM.md (this file)
```

## 🧪 Testing | الاختبار

### Manual Testing
1. Start backend and frontend servers
2. Register/login as different roles
3. Test CRUD operations
4. Complete lessons and quizzes
5. Verify achievements and certificates
6. Check notifications

### Future Testing
- Unit tests for service layer
- Integration tests for API
- Component tests for UI
- E2E tests for workflows

## 🚧 Known Limitations | القيود المعروفة

1. **In-memory storage**: Data is lost on server restart
2. **No rate limiting**: Vulnerable to abuse in production
3. **No media upload**: Multimedia support structure ready but not implemented
4. **Leaderboard placeholder**: Requires user service integration
5. **No real-time updates**: Polling required for notifications

## 🔮 Future Enhancements | التحسينات المستقبلية

### High Priority
- [ ] Database migration (PostgreSQL/MongoDB)
- [ ] Rate limiting implementation
- [ ] Media upload system
- [ ] Real-time notifications (WebSockets)
- [ ] Comprehensive test suite

### Medium Priority
- [ ] Lesson editor with WYSIWYG
- [ ] Comments and discussions
- [ ] Lesson ratings and reviews
- [ ] Advanced analytics dashboard
- [ ] Export/import functionality
- [ ] Lesson templates

### Low Priority
- [ ] AI-powered recommendations
- [ ] Collaborative learning features
- [ ] Live classes integration
- [ ] Mobile app support
- [ ] Offline mode
- [ ] Multi-language support

## 📞 Support & Contribution | الدعم والمساهمة

### Getting Help
- Check [API Documentation](back/docs/LESSONS_API.md)
- Review [ERD Documentation](back/docs/LESSONS_ERD.md)
- Open an issue on GitHub

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make minimal, focused changes
4. Test thoroughly
5. Submit a pull request

## 📜 License | الترخيص

This project is part of the Islamic educational platform and is open source for educational and dawah purposes.

---

**Built with ❤️ for the Muslim Ummah**

نُصرت بالرعب مسيرة شهر
