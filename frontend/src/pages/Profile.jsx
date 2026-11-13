// เจ้าของ: ChaSang45 — โปรไฟล์ของฉัน: ดูข้อมูล, แก้ชื่อ, เปลี่ยนรหัสผ่าน (เส้นทาง /me/profile ครอบด้วย ProtectedRoute)
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getMe, updateMe, changePassword } from '../api/backend';
import { ErrorBox, Loading, btnPrimary, inputClass, labelClass } from '../components/States';

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

  const msgClass = (m) => 'text-sm font-medium ' + (m.ok ? 'text-seat' : 'text-alert');

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold text-ink">โปรไฟล์ของฉัน</h1>

      <dl className="grid grid-cols-[6.5rem_1fr] gap-x-4 gap-y-2 rounded-lg border border-line bg-white p-6 text-sm">
        <dt className="text-ink-soft">อีเมล</dt>
        <dd className="break-all font-medium text-ink">{me.email}</dd>
        <dt className="text-ink-soft">บทบาท</dt>
        <dd className="font-medium text-ink">{me.role}</dd>
        <dt className="text-ink-soft">สมัครเมื่อ</dt>
        <dd className="font-medium text-ink">{dateTH(me.createdAt)}</dd>
      </dl>

      <form onSubmit={handleSaveName} className="space-y-4 rounded-lg border border-line bg-white p-6">
        <h2 className="text-lg font-semibold text-ink">แก้ไขชื่อที่แสดง</h2>
        <label className="block">
          <span className={labelClass}>ชื่อที่แสดง</span>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                 autoComplete="name" required className={inputClass} />
        </label>
        <button type="submit" disabled={nameStatus === 'submitting'} className={btnPrimary}>
          {nameStatus === 'submitting' ? 'กำลังบันทึก...' : 'บันทึกชื่อ'}
        </button>
        {nameMsg && <p role="status" className={msgClass(nameMsg)}>{nameMsg.text}</p>}
      </form>

      <form onSubmit={handleChangePassword} className="space-y-4 rounded-lg border border-line bg-white p-6">
        <h2 className="text-lg font-semibold text-ink">เปลี่ยนรหัสผ่าน</h2>
        <label className="block">
          <span className={labelClass}>รหัสผ่านเดิม</span>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                 autoComplete="current-password" required className={inputClass} />
        </label>
        <div>
          <label className="block">
            <span className={labelClass}>รหัสผ่านใหม่</span>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                   autoComplete="new-password" required minLength={6} className={inputClass} />
          </label>
          <p className="mt-1 text-xs text-ink-soft">อย่างน้อย 6 ตัวอักษร</p>
        </div>
        <label className="block">
          <span className={labelClass}>ยืนยันรหัสผ่านใหม่</span>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                 autoComplete="new-password" required className={inputClass} />
        </label>
        <button type="submit" disabled={pwStatus === 'submitting'} className={btnPrimary}>
          {pwStatus === 'submitting' ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
        </button>
        {pwMsg && <p role={pwMsg.ok ? 'status' : 'alert'} className={msgClass(pwMsg)}>{pwMsg.text}</p>}
      </form>
    </div>
  );
}

export default Profile;
