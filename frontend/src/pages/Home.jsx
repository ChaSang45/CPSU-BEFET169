// เจ้าของ: Matika — หน้าแรก: รายการกิจกรรม + ค้นหา (Guest ดูได้ ไม่ต้อง login)
import { useEffect, useState } from 'react';
import ActivityGrid from '../components/ActivityGrid';
import { inputClass } from '../components/States';
import { getActivities } from '../api/backend';

function Home() {
  const [activities, setActivities] = useState([]);
  const [status, setStatus] = useState('loading');    // 'loading' | 'error' | 'success'
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [reloadKey, setReloadKey] = useState(0);      // เปลี่ยนค่า = สั่งโหลดใหม่ (ปุ่มลองใหม่)

  useEffect(() => {
    let ignore = false;                                // กันคำตอบเก่ามาทับ ถ้า component ถูกปิดไปก่อน
    async function load() {
      setStatus('loading');
      try {
        const list = await getActivities();
        if (!ignore) { setActivities(list); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [reloadKey]);

  // ค้นหาในเครื่องจากข้อมูลที่โหลดมาแล้ว ไม่ต้องเรียก backend ซ้ำทุกตัวอักษร
  const q = query.trim().toLowerCase();
  const shown = activities.filter(a =>
    q === '' || a.title.toLowerCase().includes(q) || a.location.toLowerCase().includes(q)
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-slate-900">กิจกรรมคณะ</h1>
      <p className="mb-6 text-sm text-slate-500">ดูกิจกรรมทั้งหมด สมัครสมาชิกเพื่อกดเข้าร่วม</p>
      <input value={query} onChange={(e) => setQuery(e.target.value)}
             placeholder="พิมพ์ชื่อกิจกรรมหรือสถานที่" className={inputClass + ' mb-6'} />
      <ActivityGrid activities={shown} status={status} error={error}
                    onRetry={() => setReloadKey(k => k + 1)} />
    </div>
  );
}

export default Home;
