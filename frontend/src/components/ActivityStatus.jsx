// เจ้าของ: ChaSang45 — สถานะของกิจกรรม (เปิดรับ / เต็ม / เริ่มแล้ว) ใช้ร่วมกันทั้งการ์ด หน้ารายละเอียด และการเรียงรายการ

// เริ่มแล้วสำคัญที่สุด (สมัครไม่ได้ไม่ว่าจะเต็มหรือไม่) รองลงมาคือเต็ม ที่เหลือคือเปิดรับ
// ตรงกับที่ Go ตรวจ: กิจกรรมเริ่มแล้ว = 400, เต็ม = 409
export function activityStatus(activity, now = new Date()) {
  if (new Date(activity.startAt) < now) return 'started';
  if (activity.registered >= activity.capacity) return 'full';
  return 'open';
}

const LABEL = { open: 'เปิดรับสมัคร', full: 'เต็ม', started: 'เริ่มแล้ว' };
const STYLE = {
  open: 'bg-seat/10 text-seat',
  full: 'bg-alert/10 text-alert',
  started: 'bg-line/60 text-ink-soft',
};

export function StatusBadge({ activity }) {
  const status = activityStatus(activity);
  return (
    <span className={'inline-block rounded px-2 py-0.5 text-xs font-semibold ' + STYLE[status]}>
      {LABEL[status]}
    </span>
  );
}

// กิจกรรมที่ยังไม่เริ่มขึ้นก่อน (ใกล้ถึงสุดก่อน) แล้วตามด้วยกิจกรรมที่เริ่มไปแล้ว (ล่าสุดก่อน)
// คืน array ใหม่ ไม่แก้ของเดิม
export function sortActivities(list, now = new Date()) {
  const time = (a) => new Date(a.startAt).getTime();
  const upcoming = list.filter(a => time(a) >= now.getTime()).sort((a, b) => time(a) - time(b));
  const started = list.filter(a => time(a) < now.getTime()).sort((a, b) => time(b) - time(a));
  return [...upcoming, ...started];
}
