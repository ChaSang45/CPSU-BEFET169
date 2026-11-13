// เจ้าของ: ChaSang45 — รายละเอียดกิจกรรม + ปุ่มสมัคร / ยกเลิก
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getActivity, getMyActivities, joinActivity, cancelActivity } from '../api/backend';
import { ErrorBox, Loading, btnPrimary, btnDanger, dateTimeTH, linkClass } from '../components/States';
import { CheckIcon, ClockIcon, PinIcon, UsersIcon } from '../components/Icons';
import { DateBlock } from '../components/Ticket';
import { StatusBadge, activityStatus } from '../components/ActivityStatus';

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
        if (token) {                                       // login แล้วถึงเช็กว่าสมัครไว้หรือยัง
          try {
            mine = await getMyActivities(token);
          } catch {
            // เช็กไม่ได้ (เช่น ตั๋วหมดอายุ) ก็ยังแสดงกิจกรรมได้ เพราะเป็นข้อมูลสาธารณะ
            // ถ้าตั๋วเสียจริง apiFetch จะล้าง login แล้ว effect นี้โหลดใหม่แบบ Guest เอง
          }
        }
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

  const activityState = activityStatus(activity);   // 'open' | 'full' | 'started'

  let action;
  if (!isLoggedIn) {
    action = <Link to="/login" state={{ from: `/activities/${id}` }} className={btnPrimary}>เข้าสู่ระบบเพื่อสมัคร</Link>;
  } else if (joined) {
    action = (
      <>
        <p className="flex items-center gap-2 font-semibold text-seat">
          <CheckIcon className="h-5 w-5" />
          คุณสมัครกิจกรรมนี้แล้ว
        </p>
        <button onClick={handleCancel} disabled={busy} className={btnDanger}>{busy ? 'กำลังยกเลิก...' : 'ยกเลิกการสมัคร'}</button>
      </>
    );
  } else if (activityState === 'started') {
    action = <p className="text-ink-soft">กิจกรรมเริ่มไปแล้ว</p>;
  } else if (activityState === 'full') {
    action = <p className="font-semibold text-alert">กิจกรรมเต็มแล้ว</p>;
  } else {
    action = <button onClick={handleJoin} disabled={busy} className={btnPrimary}>{busy ? 'กำลังสมัคร...' : 'สมัครเข้าร่วม'}</button>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/" className={linkClass}>กลับไปกิจกรรมทั้งหมด</Link>
      <article className="mt-4 overflow-hidden rounded-lg border border-line bg-white">
        <div className="flex">
          <DateBlock iso={activity.startAt} muted={activityState === 'started'} large />
          <div className="min-w-0 flex-1 p-5">
            <StatusBadge activity={activity} />
            <h1 className="mt-2 break-words text-2xl font-bold leading-snug text-ink">{activity.title}</h1>
            <ul className="mt-3 space-y-1.5 text-ink-soft">
              <li className="flex items-start gap-2"><ClockIcon className="mt-1 h-4 w-4 shrink-0" />{dateTimeTH(activity.startAt)}</li>
              <li className="flex items-start gap-2"><PinIcon className="mt-1 h-4 w-4 shrink-0" />{activity.location || '-'}</li>
              <li className="flex items-start gap-2"><UsersIcon className="mt-1 h-4 w-4 shrink-0" /><span>สมัครแล้ว {activity.registered}/{activity.capacity}</span></li>
            </ul>
          </div>
        </div>
        {activity.description && (
          <div className="border-t border-line px-5 py-4">
            <p className="max-w-prose whitespace-pre-line text-ink">{activity.description}</p>
          </div>
        )}
        <div className="stub-h flex flex-wrap items-center gap-3 px-5 py-5">{action}</div>
      </article>
      {actionError && <p role="alert" className="mt-3 text-sm font-medium text-alert">{actionError}</p>}
    </div>
  );
}

export default ActivityDetail;
