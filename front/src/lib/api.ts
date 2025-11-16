import axios, { AxiosError, AxiosRequestConfig } from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      
      // Check if we're online
      if (!navigator.onLine) {
        return Promise.reject(new Error('لا يوجد اتصال بالإنترنت. يرجى التحقق من اتصالك'));
      }
      
      return Promise.reject(new Error('خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى'));
    }

    // Handle specific HTTP errors
    const status = error.response.status;
    
    // Unauthorized - redirect to login
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem("token");
      window.location.href = "/";
      return Promise.reject(error);
    }

    // Forbidden
    if (status === 403) {
      return Promise.reject(new Error('ليس لديك صلاحية للوصول إلى هذا المحتوى'));
    }

    // Not Found
    if (status === 404) {
      return Promise.reject(new Error('المحتوى المطلوب غير موجود'));
    }

    // Server Error - retry logic
    if (status >= 500 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return api.request(originalRequest);
    }

    // Rate limiting
    if (status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 5;
      return Promise.reject(new Error(`تم تجاوز الحد المسموح. يرجى الانتظار ${retryAfter} ثانية`));
    }

    // Default error message
    const message = error.response.data?.message || error.response.data?.error || 'حدث خطأ غير متوقع';
    return Promise.reject(new Error(message));
  }
);

// Helper function to check if user is online
export const checkOnlineStatus = (): boolean => {
  return navigator.onLine;
};

// Helper to retry failed requests
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError!;
};

export default api;
