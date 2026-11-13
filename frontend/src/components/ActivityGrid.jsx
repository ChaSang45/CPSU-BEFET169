// เจ้าของ: ChaSang45
import { useState } from 'react';
import ActivityCard from './ActivityCard';
import { activityStatus } from './ActivityStatus';
import { Empty, ErrorBox, Loading, btnGhost } from './States';

const PAGE = 10;   // แสดงทีละ 10 ใบ กดปุ่มเพื่อดูเพิ่ม หน้าจะได้ไม่ยาวเกินไป

function Section({ id, title, list }) {
  const [limit, setLimit] = useState(PAGE);
  const visible = list.slice(0, limit);               // slice ได้ array ใหม่ ไม่แก้ของเดิม
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-3 text-lg font-semibold text-ink">
        {title} <span className="text-sm font-normal text-ink-soft">({list.length})</span>
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">   {/* 2 คอลัมน์เมื่อจอกว้างตั้งแต่ 1024px ขึ้นไป ไม่งั้นชื่อกิจกรรมแคบจนตัดบรรทัดถี่ */}
        {visible.map(a => <ActivityCard key={a.id} activity={a} />)}
      </div>
      {list.length > limit && (
        <div className="mt-4 text-center">
          <button onClick={() => setLimit(limit + PAGE)} className={btnGhost}>
            แสดงเพิ่ม (เหลืออีก {list.length - limit})
          </button>
        </div>
      )}
    </section>
  );
}

// วาดรายการกิจกรรมตาม "สถานะ" 3 แบบ: loading | error | success (สำเร็จแต่ว่างเปล่าก็เป็น success)
// แบ่ง 2 กลุ่ม: กำลังจะมาถึง (แสดงเสมอ) / เริ่มไปแล้ว (พับไว้ก่อน เพราะสมัครไม่ได้แล้วและมักเป็นส่วนใหญ่ของรายการ)
// กำลังค้นหา (searching) = กางกลุ่มที่พับไว้ด้วย เพื่อไม่ให้ผลค้นหาถูกซ่อน
function ActivityGrid({ activities, status, error, onRetry, searching = false }) {
  const [showStarted, setShowStarted] = useState(false);

  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={error} onRetry={onRetry} />;
  if (!activities || activities.length === 0) return <Empty text="ไม่พบกิจกรรม ลองคำอื่นดู" />;

  const upcoming = activities.filter(a => activityStatus(a) !== 'started');
  const started = activities.filter(a => activityStatus(a) === 'started');
  const startedOpen = showStarted || searching;
  return (
    <div className="space-y-10">
      {upcoming.length > 0 && <Section id="upcoming" title="กำลังจะมาถึง" list={upcoming} />}
      {upcoming.length === 0 && !searching && (
        <p className="text-ink-soft">ตอนนี้ยังไม่มีกิจกรรมที่กำลังจะมาถึง</p>
      )}
      {started.length > 0 && !startedOpen && (
        <div className="text-center">
          <button onClick={() => setShowStarted(true)} aria-expanded="false" className={btnGhost}>
            ดูกิจกรรมที่เริ่มไปแล้ว ({started.length})
          </button>
        </div>
      )}
      {started.length > 0 && startedOpen && <Section id="started" title="เริ่มไปแล้ว" list={started} />}
    </div>
  );
}

export default ActivityGrid;
