/**
 * ErrorToast Component
 * Simple toast notification for errors
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ErrorToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className="toast toast-top toast-center z-50">
      <div className="alert alert-error">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="btn btn-ghost btn-sm btn-circle"
          aria-label="إغلاق"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default ErrorToast;
