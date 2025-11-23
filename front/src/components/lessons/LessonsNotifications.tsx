import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { lessonsService } from '../../services/lessonsService';
import { useLessonsStore } from '../../store/lessons';

export default function LessonsNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadNotifications, setNotifications, markNotificationAsRead } = useLessonsStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 5 minutes
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await lessonsService.getNotifications();
      setNotifications(response.notifications, response.unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await lessonsService.markNotificationAsRead(notificationId);
      markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await lessonsService.markAllNotificationsAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else if (diffInDays < 7) {
      return `منذ ${diffInDays} يوم`;
    } else {
      return date.toLocaleDateString('ar-SA');
    }
  };

  return (
    <div className="dropdown dropdown-end">
      <label 
        tabIndex={0} 
        className="btn btn-ghost btn-circle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="indicator">
          <Bell size={20} />
          {unreadNotifications > 0 && (
            <span className="badge badge-sm badge-primary indicator-item">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </div>
      </label>
      
      {isOpen && (
        <div 
          tabIndex={0} 
          className="mt-3 card card-compact dropdown-content w-80 md:w-96 bg-base-100 shadow-xl z-50"
        >
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">الإشعارات</h3>
              <div className="flex gap-2">
                {unreadNotifications > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={loading}
                    className="btn btn-xs btn-ghost gap-1"
                  >
                    <CheckCheck size={14} />
                    تحديد الكل كمقروء
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn btn-xs btn-ghost btn-circle"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="divider my-0"></div>

            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">لا توجد إشعارات</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2">
                <AnimatePresence>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        notification.read 
                          ? 'bg-base-200 opacity-70' 
                          : 'bg-primary/10 hover:bg-primary/20'
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          handleMarkAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="badge badge-primary badge-xs"></span>
                            )}
                          </div>
                          <p className="text-sm mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="btn btn-xs btn-ghost btn-circle"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
