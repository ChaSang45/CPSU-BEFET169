// เจ้าของ: ChaSang45
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { btnPrimary, inputClass } from '../components/States';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');             // 'typing' | 'submitting'
  const { login } = useAuth();
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
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-semibold text-slate-900">เข้าสู่ระบบ</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="อีเมล" required className={inputClass} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน" required className={inputClass} />
        <button type="submit" disabled={status === 'submitting'} className={btnPrimary + ' w-full'}>
          {status === 'submitting' ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
      <p className="mt-6 text-sm text-slate-500">
        ยังไม่มีบัญชี? <Link to="/register" className="text-indigo-600 hover:underline">สมัครสมาชิก</Link>
      </p>
    </div>
  );
}

export default Login;
