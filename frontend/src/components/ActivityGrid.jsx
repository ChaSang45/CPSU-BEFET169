// เจ้าของ: ChaSang45
import ActivityCard from './ActivityCard';
import { activityStatus } from './ActivityStatus';
import { Empty, ErrorBox, Loading } from './States';

function Section({ id, title, list }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-3 text-lg font-semibold text-ink">
        {title} <span className="text-sm font-normal text-ink-soft">({list.length})</span>
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map(a => <ActivityCard key={a.id} activity={a} />)}
      </div>
    </section>
  );
}

// วาดรายการกิจกรรมตาม "สถานะ" 3 แบบ: loading | error | success (สำเร็จแต่ว่างเปล่าก็เป็น success)
// รายการที่เรียงมาแล้ว (ยังไม่เริ่มก่อน) แบ่งเป็น 2 กลุ่มให้เห็นชัดว่ากลุ่มไหนยังสมัครได้
function ActivityGrid({ activities, status, error, onRetry }) {
  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={error} onRetry={onRetry} />;
  if (!activities || activities.length === 0) return <Empty text="ไม่พบกิจกรรม ลองคำอื่นดู" />;

  const upcoming = activities.filter(a => activityStatus(a) !== 'started');
  const started = activities.filter(a => activityStatus(a) === 'started');
  return (
    <div className="space-y-10">
      {upcoming.length > 0 && <Section id="upcoming" title="กำลังจะมาถึง" list={upcoming} />}
      {started.length > 0 && <Section id="started" title="เริ่มไปแล้ว" list={started} />}
    </div>
  );
}

export default ActivityGrid;
