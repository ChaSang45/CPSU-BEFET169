// เจ้าของ: ChaSang45 — การ์ดกิจกรรม 1 ใบ ออกแบบเป็นตั๋ว: บล็อกวันที่ | ชื่อและสถานที่ | ส่วนท้ายตั๋วบอกที่นั่งว่าง
import { Link } from 'react-router-dom';
import { PinIcon } from './Icons';
import { StatusBadge, activityStatus } from './ActivityStatus';
import { DateBlock, SeatCount } from './Ticket';

function ActivityCard({ activity }) {
  const started = activityStatus(activity) === 'started';
  return (
    <Link to={`/activities/${activity.id}`}
          className="group flex overflow-hidden rounded-lg border border-line bg-white transition-shadow hover:shadow-md">
      <DateBlock iso={activity.startAt} muted={started} />
      <div className="min-w-0 flex-1 p-4">
        <h3 className="break-words font-semibold leading-snug text-ink group-hover:underline">{activity.title}</h3>
        <p className="mt-2 flex items-start gap-1.5 text-sm text-ink-soft">
          <PinIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="min-w-0 break-words">{activity.location || '-'}</span>
        </p>
        <div className="mt-3"><StatusBadge activity={activity} /></div>
      </div>
      <div className="stub-v flex w-24 shrink-0 sm:w-28 items-center justify-center px-2 py-3">
        <SeatCount activity={activity} />
      </div>
    </Link>
  );
}

export default ActivityCard;
