// เจ้าของ: ChaSang45 — โครงเดียวกับ Login
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { btnPrimary, inputClass } from '../components/States';

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
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-semibold text-slate-900">สมัครสมาชิก</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="ชื่อที่แสดง" required className={inputClass} />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="อีเมล" required className={inputClass} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน (อย่างน้อย 6 ตัว)" required minLength={6} className={inputClass} />
        <button type="submit" disabled={status === 'submitting'} className={btnPrimary + ' w-full'}>
          {status === 'submitting' ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
      <p className="mt-6 text-sm text-slate-500">
        มีบัญชีแล้ว? <Link to="/login" className="text-indigo-600 hover:underline">เข้าสู่ระบบ</Link>
      </p>
    </div>
  );
}

export default Register;
