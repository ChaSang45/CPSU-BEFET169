// เจ้าของ: ChaSang45 — หน้าแรก: รายการกิจกรรม + ค้นหา (Guest ดูได้ ไม่ต้อง login)
import { useEffect, useState } from 'react';
import ActivityGrid from '../components/ActivityGrid';
import { inputClass } from '../components/States';
import { SearchIcon } from '../components/Icons';
import { sortActivities } from '../components/ActivityStatus';
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
  const shown = sortActivities(activities.filter(a =>
    q === '' || a.title.toLowerCase().includes(q) || a.location.toLowerCase().includes(q)
  ));                                                  // กิจกรรมที่ยังไม่เริ่มขึ้นก่อน

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="text-3xl font-bold text-ink">กิจกรรมคณะ</h1>
      <p className="mb-6 mt-1 text-ink-soft">ดูกิจกรรมทั้งหมด สมัครสมาชิกเพื่อจองที่นั่ง</p>
      <div className="relative mb-8">
        <label htmlFor="search" className="sr-only">ค้นหากิจกรรม</label>
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
        <input id="search" value={query} onChange={(e) => setQuery(e.target.value)}
               placeholder="พิมพ์ชื่อกิจกรรมหรือสถานที่" className={inputClass + ' pl-10'} />
      </div>
      <ActivityGrid activities={shown} status={status} error={error} searching={q !== ''}
                    onRetry={() => setReloadKey(k => k + 1)} />
    </div>
  );
}

export default Home;
