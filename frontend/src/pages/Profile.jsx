// เจ้าของ: ChaSang45 — โปรไฟล์ของฉัน: ดูข้อมูล, แก้ชื่อ, เปลี่ยนรหัสผ่าน (เส้นทาง /me/profile ครอบด้วย ProtectedRoute)
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getMe, updateMe, changePassword } from '../api/backend';
import { ErrorBox, Loading, btnPrimary, inputClass } from '../components/States';

const dateTH = (iso) => new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

function Profile() {
  const { token, updateMember } = useAuth();
  const [me, setMe] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // ฟอร์มแก้ชื่อ
  const [displayName, setDisplayName] = useState('');
  const [nameStatus, setNameStatus] = useState('typing');     // 'typing' | 'submitting'
  const [nameMsg, setNameMsg] = useState(null);

  // ฟอร์มเปลี่ยนรหัสผ่าน
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwStatus, setPwStatus] = useState('typing');
  const [pwMsg, setPwMsg] = useState(null);                   // { ok: true/false, text }

  // โหลดข้อมูลล่าสุดจาก server (GET /api/me)
  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getMe(token);
        if (!ignore) { setMe(data); setDisplayName(data.displayName); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [token, reloadKey]);

  async function handleSaveName(e) {
    e.preventDefault();
    setNameStatus('submitting');
    setNameMsg(null);
    try {
      const updated = await updateMe(displayName, token);
      setMe(updated);
      updateMember(updated);                                  // ให้ Navbar เปลี่ยนชื่อตาม
      setNameMsg({ ok: true, text: 'บันทึกชื่อแล้ว' });
    } catch (err) {
      setNameMsg({ ok: false, text: err.message });
    } finally {
      setNameStatus('typing');
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword !== confirmPassword) {                    // ตรวจในหน้าเว็บก่อน ไม่ต้องยิง server
      setPwMsg({ ok: false, text: 'รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน' });
      return;
    }
    setPwStatus('submitting');
    try {
      await changePassword(currentPassword, newPassword, token);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwMsg({ ok: true, text: 'เปลี่ยนรหัสผ่านแล้ว ครั้งหน้าให้ใช้รหัสใหม่' });
    } catch (err) {
      setPwMsg({ ok: false, text: err.message });             // เช่น 400 รหัสผ่านเดิมไม่ถูกต้อง
    } finally {
      setPwStatus('typing');
    }
  }

  if (status === 'loading') return <Loading />;
  if (status === 'error') {
    return <div className="mx-auto max-w-lg px-4 py-10"><ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} /></div>;
  }

  const msgClass = (m) => 'text-sm ' + (m.ok ? 'text-emerald-600' : 'text-red-600');

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">โปรไฟล์ของฉัน</h1>

      <div className="rounded-xl border border-indigo-100 bg-white p-6 text-sm text-slate-600">
        <p>อีเมล: <span className="text-slate-900">{me.email}</span></p>
        <p>บทบาท: <span className="text-slate-900">{me.role}</span></p>
        <p>สมัครเมื่อ: <span className="text-slate-900">{dateTH(me.createdAt)}</span></p>
      </div>

      <form onSubmit={handleSaveName} className="space-y-3 rounded-xl border border-indigo-100 bg-white p-6">
        <h2 className="font-semibold text-slate-900">แก้ไขชื่อที่แสดง</h2>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className={inputClass} />
        <button type="submit" disabled={nameStatus === 'submitting'} className={btnPrimary}>
          {nameStatus === 'submitting' ? 'กำลังบันทึก...' : 'บันทึกชื่อ'}
        </button>
        {nameMsg && <p className={msgClass(nameMsg)}>{nameMsg.text}</p>}
      </form>

      <form onSubmit={handleChangePassword} className="space-y-3 rounded-xl border border-indigo-100 bg-white p-6">
        <h2 className="font-semibold text-slate-900">เปลี่ยนรหัสผ่าน</h2>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
               placeholder="รหัสผ่านเดิม" required className={inputClass} />
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
               placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)" required minLength={6} className={inputClass} />
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
               placeholder="ยืนยันรหัสผ่านใหม่" required className={inputClass} />
        <button type="submit" disabled={pwStatus === 'submitting'} className={btnPrimary}>
          {pwStatus === 'submitting' ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
        </button>
        {pwMsg && <p className={msgClass(pwMsg)}>{pwMsg.text}</p>}
      </form>
    </div>
  );
}

export default Profile;
