// เจ้าของ: Matika — ตารางกิจกรรมหลังบ้าน + แก้ไข / ลบ / ดูผู้สมัคร
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
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        กิจกรรมทั้งหมด {status === 'success' && `(${activities.length})`}
      </h2>
      {actionError && <p className="mb-3 text-sm text-red-600">{actionError}</p>}
      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />}
      {status === 'success' && (
        <div className="overflow-x-auto rounded-xl border border-indigo-100 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-indigo-50/60 text-left text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3">กิจกรรม</th>
                <th className="px-4 py-3">วันเวลา</th>
                <th className="px-4 py-3">สมัคร</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activities.map(a => (
                <tr key={a.id} className="hover:bg-indigo-50/40">
                  <td className="px-4 py-2 font-medium text-slate-900">{a.title}</td>
                  <td className="px-4 py-2 text-slate-600">{dateTimeTH(a.startAt)}</td>
                  <td className="px-4 py-2 text-slate-600">{a.registered}/{a.capacity}</td>
                  <td className="space-x-3 px-4 py-2 text-right">
                    <Link to={`/admin/activities/${a.id}/participants`} className="text-indigo-600 hover:underline">ผู้สมัคร</Link>
                    <Link to={`/admin/activities/${a.id}`} className="text-amber-600 hover:underline">แก้ไข</Link>
                    <button onClick={() => setTarget(a)} className="text-red-600 hover:underline">ลบ</button>
                  </td>
                </tr>
              ))}
              {activities.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">ยังไม่มีกิจกรรม</td></tr>
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
