// ชิ้นส่วนของ "ตั๋ว" ที่ใช้ซ้ำในการ์ดกิจกรรม หน้ารายละเอียด และหน้ากิจกรรมของฉัน
import { dateParts } from './States';
import { activityStatus } from './ActivityStatus';

// บล็อกวันที่ด้านซ้ายของตั๋ว สีเหลืองสำหรับกิจกรรมที่ยังมาไม่ถึง ซีดลงเมื่อเริ่มไปแล้ว
export function DateBlock({ iso, muted = false, large = false }) {
  const { day, month, time } = dateParts(iso);
  return (
    <div className={
      'flex shrink-0 flex-col items-center justify-center px-3 py-4 text-center '
      + (muted ? 'bg-line/60 text-ink-soft ' : 'bg-signal text-ink ')
      + (large ? 'w-20 sm:w-28' : 'w-16 sm:w-24')
    }>
      <span className={(large ? 'text-5xl ' : 'text-3xl ') + 'font-bold leading-none tabular-nums'}>{day}</span>
      <span className="mt-1 text-sm font-semibold">{month}</span>
      <span className="mt-0.5 text-xs tabular-nums">{time}</span>
    </div>
  );
}

const SEAT_COLOR = { open: 'text-seat', full: 'text-alert', started: 'text-ink-soft' };

// ส่วนท้ายตั๋ว: จำนวนที่นั่งว่างเป็นตัวเลขใหญ่ ใต้ลงมาคือจำนวนที่สมัครแล้ว
export function SeatCount({ activity }) {
  const left = Math.max(activity.capacity - activity.registered, 0);
  const state = activityStatus(activity);
  return (
    <div className="text-center">
      <p className={'text-2xl font-bold leading-none tabular-nums ' + SEAT_COLOR[state]}>{left}</p>
      <p className="mt-1 text-xs text-ink-soft">ที่นั่งว่าง</p>
      <p className="mt-0.5 text-xs tabular-nums text-ink-soft">สมัครแล้ว {activity.registered}/{activity.capacity}</p>
    </div>
  );
}
