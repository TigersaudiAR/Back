import { useState } from "react";
import { login } from "../../lib/auth";
import { useAuthStore } from "../../store/auth";

function SettingsPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [status, setStatus] = useState<string | null>(null);
  const { user } = useAuthStore();

  const handleLogin = async () => {
    setStatus("جاري تسجيل الدخول...");
    try {
      await login(email, password);
      setStatus("تم تسجيل الدخول بنجاح");
    } catch (error) {
      console.error(error);
      setStatus("تعذر تسجيل الدخول");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-primary-dark/60 border border-primary-light/40 rounded-3xl p-6 space-y-4">
      <h2 className="text-xl font-bold text-accent">إعدادات الحساب</h2>
      {user ? (
        <p className="text-sm text-gray-200">أنت مسجل كـ {user.role}</p>
      ) : (
        <>
          <label className="form-control">
            <span className="label-text">البريد الإلكتروني</span>
            <input className="input input-bordered" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="form-control">
            <span className="label-text">كلمة المرور</span>
            <input
              className="input input-bordered"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="btn btn-accent" onClick={handleLogin}>
            تسجيل الدخول
          </button>
        </>
      )}
      {status && <p className="text-xs text-gray-300">{status}</p>}
    </div>
  );
}

export default SettingsPage;
