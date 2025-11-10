import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Hide the online notification after 3 seconds
  useEffect(() => {
    if (isOnline && showOffline) {
      const timer = setTimeout(() => {
        setShowOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, showOffline]);

  if (!showOffline && isOnline) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-2xl border-2 px-4 py-3 shadow-2xl backdrop-blur-md transition-all ${
        isOnline
          ? 'border-green-500/50 bg-green-900/80 text-green-200'
          : 'border-red-500/50 bg-red-900/80 text-red-200'
      }`}
      role="alert"
      aria-live="polite"
    >
      {isOnline ? (
        <>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">تم استعادة الاتصال</p>
            <p className="text-xs opacity-90">يمكنك الآن استخدام جميع المزايا</p>
          </div>
        </>
      ) : (
        <>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
            <WifiOff className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">لا يوجد اتصال بالإنترنت</p>
            <p className="text-xs opacity-90">بعض المزايا قد لا تعمل</p>
          </div>
        </>
      )}
    </div>
  );
}

export default NetworkStatus;
