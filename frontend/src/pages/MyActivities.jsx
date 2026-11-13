// เจ้าของ: ChaSang45 — กิจกรรมที่ฉันสมัครไว้ (เส้นทาง /me/activities ครอบด้วย ProtectedRoute แล้ว)
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getMyActivities, cancelActivity } from '../api/backend';
import { ErrorBox, Loading, Empty, ConfirmBox, btnDanger, dateTimeTH } from '../components/States';

function MyActivities() {
  const { token, member } = useAuth();
  const [activities, setActivities] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [target, setTarget] = useState(null);         // กิจกรรมที่กำลังจะยกเลิก (เปิดกล่องยืนยัน)
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const list = await getMyActivities(token);
        if (!ignore) { setActivities(list); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [token, reloadKey]);

  async function confirmCancel() {
    setBusy(true);
    setActionError(null);
    try {
      await cancelActivity(target.id, token);
      setActivities(activities.filter(a => a.id !== target.id));   // เอาออกหลัง server ยืนยัน (filter ได้ array ใหม่)
      setTarget(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">กิจกรรมของ {member?.displayName}</h1>
      <p className="mb-6 text-sm text-slate-500">กดชื่อกิจกรรมเพื่อดูรายละเอียด</p>

      {actionError && <p className="mb-3 text-sm text-red-600">{actionError}</p>}
      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />}
      {status === 'success' && activities.length === 0 && <Empty text="ยังไม่ได้สมัครกิจกรรมใด" />}
      {status === 'success' && activities.length > 0 && (
        <ul className="space-y-3">
          {activities.map(a => (
            <li key={a.id} className="flex items-center justify-between rounded-xl border border-indigo-100 bg-white p-4">
              <div>
                <Link to={`/activities/${a.id}`} className="font-medium text-indigo-700 hover:underline">{a.title}</Link>
                <p className="text-sm text-slate-500">{dateTimeTH(a.startAt)} · {a.location}</p>
              </div>
              <button onClick={() => setTarget(a)} className={btnDanger}>ยกเลิก</button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmBox open={Boolean(target)} busy={busy} title={`ยกเลิกการสมัคร "${target?.title}" ?`}
                  confirmText="ยกเลิกการสมัคร" onConfirm={confirmCancel} onCancel={() => setTarget(null)}>
        <p>ถ้าที่นั่งเต็มแล้ว อาจสมัครกลับเข้ามาใหม่ไม่ได้</p>
      </ConfirmBox>
    </div>
  );
}

export default MyActivities;
