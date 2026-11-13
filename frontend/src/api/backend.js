// ชั้นกลางสำหรับคุยกับ Backend Go ของเรา ทุกหน้าเรียกผ่านไฟล์นี้ ไม่เรียก fetch เอง

// '' = origin เดียวกับหน้าเว็บ ในเครื่อง CRA จะ proxy /api ไปที่ http://localhost:8080 ให้ (ตั้งใน package.json)
// บน Vercel ตั้ง REACT_APP_API_URL=https://xxx.onrender.com
const BASE = process.env.REACT_APP_API_URL || '';

// ฟังก์ชันเดียวที่ fetch จริง ทุกฟังก์ชันด้านล่างเรียกผ่านตัวนี้
export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };   // 1) บอก server ว่า body เป็น JSON
  if (token) headers.Authorization = `Bearer ${token}`;      //    และแนบตั๋วถ้ามี

  const res = await fetch(BASE + path, {                     // 2) ยิงจริง
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,           //    object ต้องแปลงเป็นข้อความก่อนส่ง
  });

  if (res.status === 204) return null;                       // 3) สำเร็จแต่ไม่มี body ให้อ่าน

  const data = await res.json()                              //    อ่านคำตอบเป็น JSON
    .catch(() => ({ error: 'server ไม่ได้ตอบเป็น JSON (backend ยังไม่พร้อม?)' }));
  if (!res.ok) {                                             // 4) 400 / 401 / 403 / 404 / 409 มาลงตรงนี้
    const err = new Error(data.error?.message ?? data.error ?? `server ตอบกลับ ${res.status}`);
    err.status = res.status;                                 //    แนบเลขไว้ให้หน้าเว็บใช้ต่อ
    throw err;
  }
  return data;
}

// ---------- สมาชิก (ChaSang45) ----------
export function register(email, password, displayName) {
  return apiFetch('/api/auth/register', { method: 'POST', body: { email, password, displayName } });
}
export function login(email, password) {
  return apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });   // ได้ { token, member }
}
export function getMe(token) {
  return apiFetch('/api/me', { token });
}
export function updateMe(displayName, token) {
  return apiFetch('/api/me', { method: 'PUT', body: { displayName }, token });         // ได้ member ใหม่
}
export function changePassword(currentPassword, newPassword, token) {
  return apiFetch('/api/me/password', { method: 'PUT', body: { currentPassword, newPassword }, token });
}

// ---------- กิจกรรม สาธารณะ (Matika) ----------
export async function getActivities() {
  const data = await apiFetch('/api/activities');
  return data.items;
}
export function getActivity(id) {
  return apiFetch(`/api/activities/${id}`);
}

// ---------- กิจกรรมของฉัน ต้อง login (ChaSang45) ----------
export async function getMyActivities(token) {
  const data = await apiFetch('/api/me/activities', { token });
  return data.items;
}
export function joinActivity(id, token) {
  return apiFetch(`/api/me/activities/${id}`, { method: 'PUT', token });               // 204 ได้ null
}
export function cancelActivity(id, token) {
  return apiFetch(`/api/me/activities/${id}`, { method: 'DELETE', token });            // 204 ได้ null
}

// ---------- หลังบ้าน ทุกตัวต้องแนบ token ของ admin ถ้าเป็น member Go ตอบ 403 (Matika) ----------
export function createActivity(fields, token) {
  return apiFetch('/api/admin/activities', { method: 'POST', body: fields, token });
}
export function updateActivity(id, fields, token) {
  return apiFetch(`/api/admin/activities/${id}`, { method: 'PUT', body: fields, token });
}
export function deleteActivity(id, token) {
  return apiFetch(`/api/admin/activities/${id}`, { method: 'DELETE', token });
}
export function getParticipants(id, token) {
  return apiFetch(`/api/admin/activities/${id}/participants`, { token });              // ได้ { activity, items }
}
