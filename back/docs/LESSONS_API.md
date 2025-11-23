# Lessons API Documentation

## نظام الدروس التعليمية الشامل

نظام متكامل لإدارة وعرض الدروس التعليمية الإسلامية مع واجهة تفاعلية حديثة.

## البنية الأساسية

### الأنواع (Types)

```typescript
type LessonLevel = "beginner" | "intermediate" | "advanced";
type LessonStatus = "draft" | "published" | "archived";
type MediaType = "text" | "image" | "video" | "audio" | "document";

interface Lesson {
  id: string;
  category: string;
  title: string;
  level: LessonLevel;
  status: LessonStatus;
  duration: number; // بالدقائق
  description: string;
  objectives: string[];
  content: ContentBlock[];
  quiz?: QuizQuestion[];
  points: number;
  tags?: string[];
}
```

## Endpoints الرئيسية

### Public Endpoints

#### 1. الحصول على التصنيفات
```
GET /api/lessons/categories
```

#### 2. الحصول على جميع الدروس (مع الفلترة)
```
GET /api/lessons?category=aqidah&level=beginner&search=إيمان
```

#### 3. الحصول على درس معين
```
GET /api/lessons/:id
```

#### 4. البحث في الدروس
```
GET /api/lessons/search/query?q=التوحيد&limit=10
```

### Authenticated Endpoints

#### 5. بدء درس
```
POST /api/lessons/:id/start
```

#### 6. إكمال درس
```
POST /api/lessons/:id/complete
Body: { "timeSpent": 20 }
```

#### 7. إرسال إجابات الاختبار
```
POST /api/lessons/:id/quiz
Body: { "answers": [1, 2, 0] }
```

#### 8. الحصول على التقدم
```
GET /api/lessons/progress/me
```

#### 9. الحصول على الشهادات
```
GET /api/lessons/certificates/me
```

#### 10. الإشعارات
```
GET /api/lessons/notifications/me
PUT /api/lessons/notifications/:id/read
```

### Admin Endpoints

#### 11. إنشاء/تعديل/حذف درس
```
POST /api/lessons
PUT /api/lessons/:id
DELETE /api/lessons/:id
```

#### 12. الإحصائيات
```
GET /api/lessons/admin/statistics
```

## الميزات الرئيسية

✅ **نظام دروس شامل** مع 6 تصنيفات رئيسية
✅ **محتوى متعدد الوسائط** (نص، فيديو، صوت، صور)
✅ **اختبارات تفاعلية** مع نتائج فورية
✅ **تتبع التقدم** للمستخدمين
✅ **نظام النقاط والشهادات**
✅ **لوحة صدارة**
✅ **نظام إشعارات**
✅ **بحث وفلترة متقدمة**
✅ **لوحة تحكم للمسؤولين**

للتوثيق الكامل، راجع الكود المصدري.
