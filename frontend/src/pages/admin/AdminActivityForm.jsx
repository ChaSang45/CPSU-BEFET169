// เจ้าของ: ChaSang45 — ฟอร์มเพิ่ม / แก้ไขกิจกรรม (มี :id ใน URL = แก้ไข, ไม่มี = เพิ่มใหม่)
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getActivity, createActivity, updateActivity } from '../../api/backend';
import { ErrorBox, Loading, btnPrimary, btnGhost, inputClass } from '../../components/States';

const EMPTY = { title: '', description: '', location: '', startAt: '', capacity: 30 };

// แปลงเวลา ISO จาก server เป็นรูปแบบที่ <input type="datetime-local"> ต้องการ (เวลาเครื่องผู้ใช้)
function toInputValue(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function AdminActivityForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState(isEdit ? 'loading' : 'success');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // โหมดแก้ไข: โหลดข้อมูลเดิมมาใส่ฟอร์ม
  useEffect(() => {
    if (!isEdit) {
      setForm(EMPTY);
      setStatus('success');
      return;
    }
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const a = await getActivity(id);
        if (!ignore) {
          setForm({ title: a.title, description: a.description, location: a.location,
                    startAt: toInputValue(a.startAt), capacity: a.capacity });
          setStatus('success');
        }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [id, isEdit]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });   // copy object เดิมแล้วแก้แค่ช่องเดียว
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    const fields = {
      ...form,
      startAt: new Date(form.startAt).toISOString(),   // เวลาเครื่อง → ISO (UTC) ให้ Go อ่านเป็น time.Time ได้
      capacity: Number(form.capacity),                 // ช่อง input ให้ค่าเป็นข้อความ ต้องแปลงเป็นตัวเลข
    };
    try {
      if (isEdit) await updateActivity(id, fields, token);
      else await createActivity(fields, token);
      navigate('/admin');
    } catch (err) {
      setSaveError(err.message);                       // เช่น 400 จำนวนรับน้อยกว่าคนที่สมัครแล้ว
      setSaving(false);
    }
  }

  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={error} />;

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-3 rounded-xl border border-indigo-100 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">{isEdit ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรม'}</h2>
      <label className="block text-sm text-slate-600">ชื่อกิจกรรม
        <input name="title" required value={form.title} onChange={handleChange} className={inputClass} />
      </label>
      <label className="block text-sm text-slate-600">รายละเอียด
        <textarea name="description" rows={4} value={form.description} onChange={handleChange} className={inputClass} />
      </label>
      <label className="block text-sm text-slate-600">สถานที่
        <input name="location" value={form.location} onChange={handleChange} className={inputClass} />
      </label>
      <label className="block text-sm text-slate-600">วันเวลาเริ่ม
        <input name="startAt" type="datetime-local" required value={form.startAt} onChange={handleChange} className={inputClass} />
      </label>
      <label className="block text-sm text-slate-600">จำนวนรับ
        <input name="capacity" type="number" min={1} required value={form.capacity} onChange={handleChange} className={inputClass} />
      </label>
      {saveError && <p className="text-sm text-red-600">{saveError}</p>}
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
        <button type="button" onClick={() => navigate('/admin')} className={btnGhost}>ยกเลิก</button>
      </div>
    </form>
  );
}

export default AdminActivityForm;
