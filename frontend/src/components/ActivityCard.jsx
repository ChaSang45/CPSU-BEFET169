// เจ้าของ: Matika — การ์ดกิจกรรม 1 ใบ
import { Link } from 'react-router-dom';
import { dateTimeTH } from './States';

function ActivityCard({ activity }) {
  const full = activity.registered >= activity.capacity;
  return (
    <Link to={`/activities/${activity.id}`}
          className="block rounded-xl border border-indigo-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <h3 className="font-semibold text-slate-900">{activity.title}</h3>
      <p className="mt-1 text-sm text-slate-500">📅 {dateTimeTH(activity.startAt)}</p>
      <p className="text-sm text-slate-500">📍 {activity.location || '-'}</p>
      <p className={'mt-2 text-sm ' + (full ? 'text-red-600' : 'text-emerald-600')}>
        สมัครแล้ว {activity.registered}/{activity.capacity} {full && '(เต็ม)'}
      </p>
    </Link>
  );
}

export default ActivityCard;
