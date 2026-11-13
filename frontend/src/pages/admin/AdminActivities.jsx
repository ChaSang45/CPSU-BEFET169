// เจ้าของ: ChaSang45 — ตารางกิจกรรมหลังบ้าน + แก้ไข / ลบ / ดูผู้สมัคร
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getActivities, deleteActivity } from '../../api/backend';
import { ErrorBox, Loading, ConfirmBox, dateTimeTH } from '../../components/States';

function AdminActivities() {
  const { token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [target, setTarget] = useState(null);          // กิจกรรมที่กำลังจะลบ (เปิดกล่องยืนยัน)
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const list = await getActivities();
        if (!ignore) { setActivities(list); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [reloadKey]);

  async function confirmDelete() {
    setBusy(true);
    setActionError(null);
    try {
      await deleteActivity(target.id, token);
      setActivities(activities.filter(a => a.id !== target.id));    // ลบออกหลัง server ยืนยัน
      setTarget(null);
    } catch (err) {
      setActionError(err.message);                                   // เช่น 403 ถ้าไม่ใช่ admin
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-ink">
        กิจกรรมทั้งหมด {status === 'success' && `(${activities.length})`}
      </h2>
      {actionError && <p className="mb-3 text-sm text-alert">{actionError}</p>}
      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />}
      {status === 'success' && (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full text-sm">
            <thead className="bg-paper text-left text-xs text-ink-soft">
              <tr>
                <th className="px-4 py-3">กิจกรรม</th>
                <th className="px-4 py-3">วันเวลา</th>
                <th className="px-4 py-3">สมัคร</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {activities.map(a => (
                <tr key={a.id} className="hover:bg-paper">
                  <td className="min-w-[9rem] px-4 py-2 font-medium text-ink">{a.title}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-ink-soft">{dateTimeTH(a.startAt)}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-ink-soft">{a.registered}/{a.capacity}</td>
                  <td className="space-x-2 whitespace-nowrap px-4 py-1 text-right">
                    <Link to={`/admin/activities/${a.id}/participants`} className="inline-flex min-h-[44px] items-center px-1 font-medium text-ink underline decoration-signal decoration-2 underline-offset-4 hover:bg-signal/30">ผู้สมัคร</Link>
                    <Link to={`/admin/activities/${a.id}`} className="inline-flex min-h-[44px] items-center px-1 font-medium text-ink underline decoration-signal decoration-2 underline-offset-4 hover:bg-signal/30">แก้ไข</Link>
                    <button onClick={() => setTarget(a)} className="inline-flex min-h-[44px] items-center px-1 font-medium text-alert underline underline-offset-4 hover:bg-alert/10">ลบ</button>
                  </td>
                </tr>
              ))}
              {activities.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-ink-soft">ยังไม่มีกิจกรรม</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmBox open={Boolean(target)} busy={busy} title={`ลบ "${target?.title}" ?`}
                  confirmText="ลบ" onConfirm={confirmDelete} onCancel={() => setTarget(null)}>
        <p>รายชื่อผู้สมัครกิจกรรมนี้จะถูกลบไปด้วย ย้อนกลับไม่ได้</p>
      </ConfirmBox>
    </div>
  );
}

export default AdminActivities;
