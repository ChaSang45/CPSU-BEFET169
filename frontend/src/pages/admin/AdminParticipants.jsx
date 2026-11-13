// เจ้าของ: ChaSang45 — รายชื่อคนที่สมัครกิจกรรมนี้
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getParticipants } from '../../api/backend';
import { ErrorBox, Loading, dateTimeTH } from '../../components/States';

function AdminParticipants() {
  const { id } = useParams();
  const { token } = useAuth();
  const [data, setData] = useState(null);             // { activity, items }
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const d = await getParticipants(id, token);
        if (!ignore) { setData(d); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [id, token, reloadKey]);

  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />;

  const { activity, items } = data;
  return (
    <div>
      <Link to="/admin" className="inline-flex min-h-[44px] items-center text-sm font-medium text-ink underline decoration-signal decoration-2 underline-offset-4 hover:bg-signal/30">← กิจกรรมทั้งหมด</Link>
      <h2 className="mt-2 text-lg font-semibold text-ink">ผู้สมัคร: {activity.title}</h2>
      <p className="mb-4 text-sm text-ink-soft">{items.length}/{activity.capacity} คน</p>
      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-xs text-ink-soft">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">ชื่อ</th>
              <th className="px-4 py-3">อีเมล</th>
              <th className="px-4 py-3">สมัครเมื่อ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((p, i) => (
              <tr key={p.memberId}>
                <td className="px-4 py-2 text-ink-soft">{i + 1}</td>
                <td className="px-4 py-2 font-medium text-ink">{p.displayName}</td>
                <td className="px-4 py-2 text-ink-soft">{p.email}</td>
                <td className="whitespace-nowrap px-4 py-2 text-ink-soft">{dateTimeTH(p.registeredAt)}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-ink-soft">ยังไม่มีผู้สมัคร</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminParticipants;
