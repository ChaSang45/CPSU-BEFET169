// เจ้าของ: ChaSang45
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { btnPrimary, inputClass, labelClass, linkClass } from '../components/States';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');             // 'typing' | 'submitting'
  const { login, sessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';                   // ProtectedRoute ส่งมาบอกว่าเดิมจะไปไหน

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await login(email, password);                // POST /api/auth/login + จำ token
      navigate(from, { replace: true });           // กลับไปหน้าที่ตั้งใจจะไปตอนแรก
    } catch (err) {
      setError(err.message);                       // ข้อความ 401 จาก server
      setStatus('typing');
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">เข้าสู่ระบบ</h1>
      {sessionExpired && (
        <p role="alert" className="mt-4 rounded-md border border-signal bg-signal/20 px-3 py-2 text-sm text-ink">
          เซสชันหมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่
        </p>
      )}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-line bg-white p-6">
        <label className="block">
          <span className={labelClass}>อีเมล</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                 placeholder="name@example.com" autoComplete="email" required className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>รหัสผ่าน</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                 autoComplete="current-password" required className={inputClass} />
        </label>
        <button type="submit" disabled={status === 'submitting'} className={btnPrimary + ' w-full'}>
          {status === 'submitting' ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
        {error && <p role="alert" className="text-sm font-medium text-alert">{error}</p>}
      </form>
      <p className="mt-6 text-sm text-ink-soft">
        ยังไม่มีบัญชี? <Link to="/register" className={linkClass}>สมัครสมาชิก</Link>
      </p>
    </div>
  );
}

export default Login;
