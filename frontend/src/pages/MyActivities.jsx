// เจ้าของ: ChaSang45 — กิจกรรมที่ฉันสมัครไว้ (เส้นทาง /me/activities ครอบด้วย ProtectedRoute แล้ว)
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getMyActivities, cancelActivity } from '../api/backend';
import { ErrorBox, Loading, Empty, ConfirmBox, btnDanger, linkClass } from '../components/States';
import { PinIcon } from '../components/Icons';
import { DateBlock } from '../components/Ticket';
import { StatusBadge, activityStatus } from '../components/ActivityStatus';

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
      <h1 className="text-3xl font-bold text-ink">กิจกรรมของ {member?.displayName}</h1>
      <p className="mb-6 mt-1 text-ink-soft">กดชื่อกิจกรรมเพื่อดูรายละเอียด</p>

      {actionError && <p role="alert" className="mb-3 text-sm font-medium text-alert">{actionError}</p>}
      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />}
      {status === 'success' && activities.length === 0 && (
        <div className="text-center">
          <Empty text="ยังไม่ได้สมัครกิจกรรมใด" />
          <Link to="/" className={linkClass + ' inline-flex min-h-[44px] items-center'}>ดูกิจกรรมทั้งหมด</Link>
        </div>
      )}
      {status === 'success' && activities.length > 0 && (
        <ul className="space-y-4">
          {activities.map(a => (
            <li key={a.id} className="flex overflow-hidden rounded-lg border border-line bg-white">
              <DateBlock iso={a.startAt} muted={activityStatus(a) === 'started'} />
              <div className="min-w-0 flex-1 p-4">
                <Link to={`/activities/${a.id}`} className="break-words font-semibold leading-snug text-ink hover:underline">{a.title}</Link>
                <p className="mt-2 flex items-start gap-1.5 text-sm text-ink-soft">
                  <PinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="min-w-0 break-words">{a.location || '-'}</span>
                </p>
                <div className="mt-3"><StatusBadge activity={a} /></div>
              </div>
              <div className="stub-v flex w-24 shrink-0 sm:w-28 items-center justify-center px-2 py-3">
                <button onClick={() => setTarget(a)} className={btnDanger}>ยกเลิก</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmBox open={Boolean(target)} busy={busy} title={`ยกเลิกการสมัคร "${target?.title}" ?`}
                  confirmText="ยกเลิกการสมัคร" cancelText="กลับ" onConfirm={confirmCancel} onCancel={() => setTarget(null)}>
        <p>ถ้าที่นั่งเต็มแล้ว อาจสมัครกลับเข้ามาใหม่ไม่ได้</p>
      </ConfirmBox>
    </div>
  );
}

export default MyActivities;
