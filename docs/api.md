# สัญญา API — เว็บรวบรวมกิจกรรมคณะ

Base URL: ในเครื่องใช้ `''` (CRA proxy ไป `http://localhost:8080`) / จริง = URL ของ Render
Error ทุกอันตอบรูปแบบ `{ "error": "ข้อความภาษาไทย" }`
🔒 = ต้อง login ส่ง header `Authorization: Bearer <token>` — Go อ่าน `member_id` จากตั๋วเอง **ห้ามรับ member_id จาก body หรือ URL**

| Method | Path | สิทธิ์ | Body | ตอบกลับ |
|---|---|---|---|---|
| GET | `/api/activities` | Guest | - | `{ items: [Activity] }` |
| GET | `/api/activities/{id}` | Guest | - | `Activity` / 404 |
| POST | `/api/auth/register` | Guest | `{ email, password, displayName }` | 201 `Member` / 400 / 409 อีเมลซ้ำ |
| POST | `/api/auth/login` | Guest | `{ email, password }` | `{ token, member }` / 401 |
| GET | `/api/me` | 🔒 Member | - | `Member` (โปรไฟล์) |
| PUT | `/api/me` | 🔒 Member | `{ displayName }` | `Member` / 400 |
| PUT | `/api/me/password` | 🔒 Member | `{ currentPassword, newPassword }` | 204 / 400 รหัสเดิมผิด |
| GET | `/api/me/activities` | 🔒 Member | - | `{ items: [Activity] }` |
| PUT | `/api/me/activities/{id}` | 🔒 Member | - | 204 สมัครแล้ว / 404 / 409 เต็มหรือสมัครซ้ำ / 400 เริ่มไปแล้ว |
| DELETE | `/api/me/activities/{id}` | 🔒 Member | - | 204 / 404 |
| POST | `/api/admin/activities` | 🔒 Admin | `ActivityInput` | 201 `{ id }` / 400 |
| PUT | `/api/admin/activities/{id}` | 🔒 Admin | `ActivityInput` | 200 / 400 / 404 |
| DELETE | `/api/admin/activities/{id}` | 🔒 Admin | - | 204 / 404 |
| GET | `/api/admin/activities/{id}/participants` | 🔒 Admin | - | `{ activity, items: [Participant] }` |

ไม่ login → **401**, login แล้วแต่ไม่ใช่ admin → **403**

```
Member        { id, email, displayName, role: "member" | "admin", createdAt }
Activity      { id, title, description, location, startAt (ISO), capacity, registered }
ActivityInput { title, description, location, startAt (ISO), capacity }
Participant   { memberId, displayName, email, registeredAt (ISO) }
```

## ตาราง (backend/schema.sql)
- `members` (id, email ไม่ซ้ำแบบไม่สนตัวพิมพ์, password_hash เป็น bcrypt, display_name, role, created_at)
- `activities` (id, title, description, location, start_at, capacity, created_at)
- `registrations` (member_id, activity_id) PK คู่ = สมัครซ้ำไม่ได้, ON DELETE CASCADE
