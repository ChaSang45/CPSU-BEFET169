// เจ้าของ: ChaSang45 — การ์ดกิจกรรม 1 ใบ
import { Link } from 'react-router-dom';
import { dateTimeTH } from './States';
import { StatusBadge, activityStatus } from './ActivityStatus';

function ActivityCard({ activity }) {
  const started = activityStatus(activity) === 'started';
  return (
    <Link to={`/activities/${activity.id}`}
          className={'block rounded-xl border border-indigo-100 bg-white p-4 shadow-sm transition hover:shadow-md '
                     + (started ? 'opacity-70' : '')}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{activity.title}</h3>
        <StatusBadge activity={activity} />
      </div>
      <p className="mt-1 text-sm text-slate-500">📅 {dateTimeTH(activity.startAt)}</p>
      <p className="text-sm text-slate-500">📍 {activity.location || '-'}</p>
      <p className="mt-2 text-sm text-slate-600">สมัครแล้ว {activity.registered}/{activity.capacity}</p>
    </Link>
  );
}

export default ActivityCard;
