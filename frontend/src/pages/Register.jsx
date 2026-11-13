// เจ้าของ: ChaSang45 — โครงเดียวกับ Login
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { btnPrimary, inputClass, labelClass, linkClass } from '../components/States';

function Register() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');             // 'typing' | 'submitting'
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await register(email, password, displayName);  // สมัคร แล้ว login ให้อัตโนมัติ
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);                          // เช่น 409 อีเมลนี้ถูกใช้แล้ว
      setStatus('typing');
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">สมัครสมาชิก</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-line bg-white p-6">
        <label className="block">
          <span className={labelClass}>ชื่อที่แสดง</span>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                 autoComplete="name" required className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>อีเมล</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                 placeholder="name@example.com" autoComplete="email" required className={inputClass} />
        </label>
        <div>
          <label className="block">
            <span className={labelClass}>รหัสผ่าน</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                   autoComplete="new-password" required minLength={6} className={inputClass} />
          </label>
          <p className="mt-1 text-xs text-ink-soft">อย่างน้อย 6 ตัวอักษร</p>
        </div>
        <button type="submit" disabled={status === 'submitting'} className={btnPrimary + ' w-full'}>
          {status === 'submitting' ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
        </button>
        {error && <p role="alert" className="text-sm font-medium text-alert">{error}</p>}
      </form>
      <p className="mt-6 text-sm text-ink-soft">
        มีบัญชีแล้ว? <Link to="/login" className={linkClass}>เข้าสู่ระบบ</Link>
      </p>
    </div>
  );
}

export default Register;
