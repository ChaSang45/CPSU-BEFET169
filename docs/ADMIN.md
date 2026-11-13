# วิธีตั้งแอดมินและตรวจสอบสิทธิ์

## หลักการ

- คนที่สมัครผ่านหน้าเว็บจะได้ `role = 'member'` เสมอ (ค่า default ใน `backend/schema.sql`) ไม่มีหน้าสมัครแอดมิน
- แอดมินต้องตั้งที่ฐานข้อมูลเอง
- `role` ถูกฝังใน token ตอน login (`mw.MakeToken` ใน `handler/auth.go`) ดังนั้นหลังเปลี่ยน role ต้อง **logout แล้ว login ใหม่** ไม่งั้น token เก่ายังเป็น member
- เมนู "หลังบ้าน" ใน React ซ่อน/โชว์ตาม role เพื่อความสะดวกเท่านั้น ตัวป้องกันจริงคือ `mw.RequireAdmin` ใน Go

## ขั้นตอนตั้งแอดมิน

1. สมัครสมาชิกผ่านหน้าเว็บตามปกติ
2. เปิด SQL Editor ของ Supabase (หรือ `psql` ถ้าทำในเครื่อง) แล้วรัน (เปลี่ยนอีเมล)

   ```sql
   UPDATE members SET role = 'admin' WHERE lower(email) = lower('อีเมลที่สมัคร');
   ```

3. ตรวจว่าแก้ถูกแถว

   ```sql
   SELECT id, email, role FROM members WHERE role = 'admin';
   ```

4. logout แล้ว login ใหม่ จะเห็นเมนู "หลังบ้าน"

## วิธีตรวจว่า backend ป้องกันสิทธิ์จริง

เกณฑ์อาจารย์ตรวจที่ backend ไม่ใช่ปุ่มใน React ให้ลองยิงตรง ๆ (ตัวอย่างใช้ endpoint ลบกิจกรรม; แทน `$API` ด้วย URL ของ backend)

| กรณี | คำสั่ง | ผลที่ต้องได้ |
|---|---|---|
| ไม่ล็อกอิน | `curl -i -X DELETE $API/api/admin/activities/1` | 401 |
| ล็อกอินเป็น member | เพิ่ม `-H "Authorization: Bearer <token ของ member>"` | 403 |
| ล็อกอินเป็น admin | เพิ่ม `-H "Authorization: Bearer <token ของ admin>"` | 2xx |

ขอ token ได้จาก

```bash
curl -s -X POST $API/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"...","password":"..."}'
```

ใช้ทดสอบกับ endpoint อื่นของหลังบ้านได้เหมือนกัน (`POST/PUT /api/admin/activities`, `GET /api/admin/activities/{id}/participants`) ควรได้ 401/403/2xx ตามตารางเดียวกัน

## ข้อควรระวัง

- เก็บรหัสผ่านและ token ไว้ในเครื่อง อย่าเขียนลง repo
- คำสั่ง `DELETE` ข้างบนจะลบกิจกรรมจริงถ้าใช้ token ของ admin ตอนทดสอบสิทธิ์ admin ให้ใช้ id ของกิจกรรมทดลอง
- ตอนทำคลิปส่งอาจารย์ แสดงผล 401/403 จาก curl หรือ DevTools ควบคู่กับหน้าเว็บ จะเป็นหลักฐานว่าป้องกันที่ backend
