// เจ้าของ: Matika (ส่วนแสดงรายละเอียด) + ChaSang45 (ปุ่มสมัคร / ยกเลิก)
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getActivity, getMyActivities, joinActivity, cancelActivity } from '../api/backend';
import { ErrorBox, Loading, btnPrimary, btnDanger, dateTimeTH } from '../components/States';

function ActivityDetail() {
  const { id } = useParams();
  const { token, isLoggedIn } = useAuth();
  const [activity, setActivity] = useState(null);
  const [joined, setJoined] = useState(false);        // สมาชิกคนนี้สมัครแล้วหรือยัง
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);            // กำลังกดปุ่ม กันกดซ้ำ
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const a = await getActivity(id);
        let mine = [];
        if (token) mine = await getMyActivities(token);   // login แล้วถึงเช็กว่าสมัครไว้หรือยัง
        if (!ignore) {
          setActivity(a);
          setJoined(mine.some(m => m.id === a.id));
          setStatus('success');
        }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [id, token]);

  // ChaSang45: สมัคร — เปลี่ยน state หลัง server ตอบสำเร็จเท่านั้น
  async function handleJoin() {
    setBusy(true);
    setActionError(null);
    try {
      await joinActivity(id, token);
      setJoined(true);
      setActivity({ ...activity, registered: activity.registered + 1 });   // object ใหม่ ไม่แก้ของเดิม
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // ChaSang45: ยกเลิกการสมัคร
  async function handleCancel() {
    setBusy(true);
    setActionError(null);
    try {
      await cancelActivity(id, token);
      setJoined(false);
      setActivity({ ...activity, registered: activity.registered - 1 });
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (status === 'loading') return <Loading />;
  if (status === 'error') return <div className="mx-auto max-w-3xl px-4 py-10"><ErrorBox error={error} /></div>;

  const full = activity.registered >= activity.capacity;
  const started = new Date(activity.startAt) < new Date();

  let action;
  if (!isLoggedIn) {
    action = <Link to="/login" state={{ from: `/activities/${id}` }} className={btnPrimary}>เข้าสู่ระบบเพื่อสมัคร</Link>;
  } else if (joined) {
    action = <button onClick={handleCancel} disabled={busy} className={btnDanger}>{busy ? 'กำลังยกเลิก...' : 'ยกเลิกการสมัคร'}</button>;
  } else if (started) {
    action = <p className="text-slate-500">กิจกรรมเริ่มไปแล้ว</p>;
  } else if (full) {
    action = <p className="text-red-600">กิจกรรมเต็มแล้ว</p>;
  } else {
    action = <button onClick={handleJoin} disabled={busy} className={btnPrimary}>{busy ? 'กำลังสมัคร...' : 'สมัครเข้าร่วม'}</button>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/" className="text-sm text-indigo-600 hover:underline">← กิจกรรมทั้งหมด</Link>
      <div className="mt-3 rounded-xl border border-indigo-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{activity.title}</h1>
        <p className="mt-2 text-slate-600">📅 {dateTimeTH(activity.startAt)}</p>
        <p className="text-slate-600">📍 {activity.location || '-'}</p>
        <p className="text-slate-600">👥 สมัครแล้ว {activity.registered}/{activity.capacity}</p>
        <p className="mt-4 whitespace-pre-line text-slate-700">{activity.description}</p>
        <div className="mt-6">{action}</div>
        {actionError && <p className="mt-2 text-sm text-red-600">{actionError}</p>}
      </div>
    </div>
  );
}

export default ActivityDetail;
