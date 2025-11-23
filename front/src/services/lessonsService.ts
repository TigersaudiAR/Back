import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface LessonContent {
  type: 'text' | 'list' | 'quote' | 'image' | 'video' | 'audio';
  title?: string;
  body?: string;
  items?: string[];
  text?: string;
  source?: string;
  url?: string;
  thumbnail?: string;
  duration?: number;
}

export interface LessonQuiz {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  category: string;
  title: string;
  title_en?: string;
  level: string;
  duration: number;
  description: string;
  objectives: string[];
  content: LessonContent[];
  quiz?: LessonQuiz[];
  points: number;
  order?: number;
  thumbnail?: string;
  tags?: string[];
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
  author?: string;
}

export interface UserProgress {
  userId: string;
  completedLessons: string[];
  quizResults: Array<{
    lessonId: string;
    score: number;
    maxScore: number;
    date: string;
    passed: boolean;
  }>;
  totalPoints: number;
  certificates: string[];
  lastAccessedLesson?: string;
  lastAccessedDate?: string;
}

export interface LessonNotification {
  id: string;
  lessonId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  userId?: string;
}

export interface LessonsResponse {
  lessons: Lesson[];
  total: number;
  totalAll: number;
  page: number;
  limit: number;
  totalPages: number;
  categories: Record<string, number>;
}

export interface ProgressResponse {
  progress: UserProgress;
  analytics: {
    completionRate: number;
    totalLessons: number;
    completedLessons: number;
    totalPoints: number;
    certificates: number;
    quizzesTaken: number;
    averageQuizScore: number;
    progressByCategory: Record<string, number>;
  };
}

class LessonsService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getLessons(params?: {
    category?: string;
    level?: string;
    search?: string;
    tags?: string;
    isPublished?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }): Promise<LessonsResponse> {
    const response = await axios.get(`${API_URL}/api/lessons`, { params });
    return response.data;
  }

  async getLessonById(id: string): Promise<Lesson> {
    const response = await axios.get(`${API_URL}/api/lessons/${id}`);
    return response.data;
  }

  async getLessonsByCategory(category: string): Promise<{ lessons: Lesson[]; total: number }> {
    const response = await axios.get(`${API_URL}/api/lessons/category/${category}`);
    return response.data;
  }

  async getLessonsByLevel(level: string): Promise<{ lessons: Lesson[]; total: number }> {
    const response = await axios.get(`${API_URL}/api/lessons/level/${level}`);
    return response.data;
  }

  async createLesson(lesson: Partial<Lesson>): Promise<{ message: string; lesson: Lesson }> {
    const response = await axios.post(`${API_URL}/api/lessons`, lesson, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async updateLesson(id: string, lesson: Partial<Lesson>): Promise<{ message: string; lesson: Lesson }> {
    const response = await axios.put(`${API_URL}/api/lessons/${id}`, lesson, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async deleteLesson(id: string): Promise<{ message: string; deletedId: string }> {
    const response = await axios.delete(`${API_URL}/api/lessons/${id}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async completeLesson(id: string): Promise<{ message: string; points: number; totalPoints: number; completedLessons: number }> {
    const response = await axios.post(`${API_URL}/api/lessons/${id}/complete`, {}, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async submitQuiz(id: string, answers: number[]): Promise<{
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    results: Array<{
      question: string;
      userAnswer: number;
      correctAnswer: number;
      isCorrect: boolean;
      explanation: string;
    }>;
    bonusPoints: number;
    certificate?: any;
    message: string;
  }> {
    const response = await axios.post(`${API_URL}/api/lessons/${id}/quiz`, { answers }, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async getUserProgress(): Promise<ProgressResponse> {
    const response = await axios.get(`${API_URL}/api/lessons/progress/me`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async getCertificates(): Promise<{ certificates: any[]; total: number }> {
    const response = await axios.get(`${API_URL}/api/lessons/certificates/me`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async getLeaderboard(): Promise<{ leaderboard: any[]; total: number }> {
    const response = await axios.get(`${API_URL}/api/lessons/leaderboard/top`);
    return response.data;
  }

  async getNotifications(): Promise<{ notifications: LessonNotification[]; total: number; unread: number }> {
    const response = await axios.get(`${API_URL}/api/lessons/notifications/me`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async markNotificationAsRead(notificationId: string): Promise<{ message: string; notification: LessonNotification }> {
    const response = await axios.put(`${API_URL}/api/lessons/notifications/${notificationId}/read`, {}, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async markAllNotificationsAsRead(): Promise<{ message: string; updated: number }> {
    const response = await axios.put(`${API_URL}/api/lessons/notifications/read-all`, {}, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async getStatistics(): Promise<any> {
    const response = await axios.get(`${API_URL}/api/lessons/stats/overview`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }
}

export const lessonsService = new LessonsService();
