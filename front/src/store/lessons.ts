import { create } from 'zustand';
import { Lesson, UserProgress, LessonNotification } from '../services/lessonsService';

interface LessonsState {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  userProgress: UserProgress | null;
  notifications: LessonNotification[];
  unreadNotifications: number;
  loading: boolean;
  error: string | null;
  
  setLessons: (lessons: Lesson[]) => void;
  setCurrentLesson: (lesson: Lesson | null) => void;
  setUserProgress: (progress: UserProgress) => void;
  setNotifications: (notifications: LessonNotification[], unread: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
}

export const useLessonsStore = create<LessonsState>((set) => ({
  lessons: [],
  currentLesson: null,
  userProgress: null,
  notifications: [],
  unreadNotifications: 0,
  loading: false,
  error: null,

  setLessons: (lessons) => set({ lessons }),
  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),
  setUserProgress: (progress) => set({ userProgress: progress }),
  setNotifications: (notifications, unread) => 
    set({ notifications, unreadNotifications: unread }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  markNotificationAsRead: (notificationId) => 
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadNotifications: Math.max(0, state.unreadNotifications - 1)
    })),
  
  clearNotifications: () => 
    set({ notifications: [], unreadNotifications: 0 })
}));
