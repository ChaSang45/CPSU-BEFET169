// เจ้าของ: Matika
import ActivityCard from './ActivityCard';
import { Empty, ErrorBox, Loading } from './States';

// วาดรายการกิจกรรมตาม "สถานะ" 3 แบบ: loading | error | success (สำเร็จแต่ว่างเปล่าก็เป็น success)
function ActivityGrid({ activities, status, error, onRetry }) {
  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={error} onRetry={onRetry} />;
  if (!activities || activities.length === 0) return <Empty text="ไม่พบกิจกรรม ลองคำอื่นดู" />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {activities.map(a => <ActivityCard key={a.id} activity={a} />)}
    </div>
  );
}

export default ActivityGrid;
