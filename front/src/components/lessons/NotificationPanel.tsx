import { X, Bell, Award, BookOpen, Trophy } from "lucide-react";
import type { LessonNotification } from "../../types/lessons";

interface NotificationPanelProps {
  notifications: LessonNotification[];
  onClose: () => void;
  onMarkRead: (notificationId: string) => void;
}

const notificationIcons = {
  new_lesson: BookOpen,
  reminder: Bell,
  achievement: Trophy,
  certificate: Award
};

const notificationColors = {
  new_lesson: "text-blue-400 bg-blue-500/20",
  reminder: "text-yellow-400 bg-yellow-500/20",
  achievement: "text-green-400 bg-green-500/20",
  certificate: "text-purple-400 bg-purple-500/20"
};

function NotificationPanel({ notifications, onClose, onMarkRead }: NotificationPanelProps) {
  return (
    <div className="fixed inset-0 md:inset-auto md:left-4 md:top-20 md:w-96 bg-primary-dark/95 border border-accent/30 rounded-2xl shadow-2xl z-50 flex flex-col max-h-[90vh] md:max-h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-primary-light/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-bold text-white">الإشعارات</h3>
        </div>
        <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">لا توجد إشعارات</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = notificationIcons[notification.type];
            const colorClass = notificationColors[notification.type];

            return (
              <div
                key={notification.id}
                onClick={() => !notification.read && onMarkRead(notification.id)}
                className={`p-4 rounded-lg border cursor-pointer transition ${
                  notification.read
                    ? "bg-primary-dark/40 border-primary-light/20"
                    : "bg-accent/10 border-accent/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm mb-1">{notification.title}</p>
                    <p className="text-gray-300 text-xs mb-2">{notification.message}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(notification.createdAt).toLocaleDateString("ar-SA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default NotificationPanel;
