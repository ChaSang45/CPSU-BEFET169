# สรุปโปรเจค: เว็บรวบรวมกิจกรรมคณะ

**Stack:** React (CRA + Router + Tailwind) → Go (net/http + pgx + JWT + bcrypt) → PostgreSQL บน Supabase
**Deploy:** Frontend บน Vercel, Backend บน Render (เชื่อมกับ repo), Database บน Supabase
**วิธีเขียน:** ยึดตาม moviehub กับ backend-week8-lab ของคลาส (เทียบไว้ใน `docs/CLASS-CHECK.md`)

## เว็บทำอะไรได้
- **Guest:** ดูกิจกรรมทั้งหมด, ค้นหา, ดูรายละเอียด
- **Member:** สมัครสมาชิก, login/logout, โปรไฟล์ (แก้ชื่อ), เปลี่ยนรหัสผ่าน, กดเข้าร่วมกิจกรรม, ยกเลิก, ดูหน้า "กิจกรรมของฉัน" (กิจกรรมที่เต็มแล้วหรือเริ่มไปแล้วจะสมัครไม่ได้)
- **Admin:** เพิ่ม / แก้ / ลบกิจกรรม, ดูรายชื่อคนที่สมัคร
- Backend ตรวจสิทธิ์ทุกครั้ง: ไม่ login ได้ 401, ไม่ใช่ admin ได้ 403

## แบ่งงาน (แต่ละคนต้องอธิบายโค้ดส่วนตัวเองในคลิปได้)
| คน | รับผิดชอบ |
|---|---|
| **Matika** | ดูและค้นหากิจกรรม + หลังบ้าน Admin ทั้งหมด (`handler/activities.go`, `handler/admin.go`, `store/activities.go`, `pages/Home`, `ActivityDetail`, `pages/admin/*`) |
| **ChaSang45** | ระบบสมาชิก + การเข้าร่วม (`handler/auth.go`, `handler/registrations.go`, `mw/auth.go`, `store/members.go`, `store/registrations.go`, `auth/AuthContext`, `Login`, `Register`, `Profile`, `MyActivities`) |
| ทั้งคู่ | ไฟล์กลาง `main.go`, `handler/handler.go`, `api/backend.js`, `App.jsx` |

## เทียบกับเกณฑ์อาจารย์ (20 คะแนน)
| เกณฑ์ | สถานะ |
|---|---|
| Tech Stack / Deploy (2) | ✅ stack ตรงตามที่เรียน ⏳ **ยังไม่ได้ deploy** |
| ระบบสมาชิก (2) | ✅ Register, Login/Logout, Profile, เปลี่ยน Password |
| Guest / Member / Admin (4) | ✅ ครบทั้ง 3 ส่วน + backend ตรวจสิทธิ์ |
| API / Database / UI (2) | ✅ fetch → Go → DB จริง ทุกหน้ามี Loading / Empty / Error |
| React Unit Test (1) | ✅ มี test 4 ไฟล์ ⏳ **ต้องรัน `npm test` ให้ผ่านจริง** |
| Project Structure (2) | ✅ แยก `frontend/` `backend/` โฟลเดอร์ตามที่เรียน ค่าตั้งค่าแยกไว้ใน `.env` |
| คลิป: สาธิตระบบจริง (2) | ⏳ ต้อง deploy ก่อน แล้วอัดตอนใช้งานจริง |
| คลิป: อธิบายโค้ด + เส้นทางข้อมูล (3/คน) | ⏳ แต่ละคนเล่า: กดปุ่ม → React → `apiFetch` → Go → DB → กลับมา |
| คลิป: เหตุผลและการแก้ปัญหา (2/คน) | ⏳ ใช้ `docs/PROBLEMS.md` (มีให้แล้ว 6 ข้อ) |

## ⚠️ ยังต้องทำ
1. รันในเครื่องให้ผ่าน: `go test ./...` และ `npm test -- --watchAll=false` (โค้ดยังไม่เคยรันจริง อาจเจอ error เล็ก ๆ)
2. Deploy ตาม `docs/DEPLOY.md`: Supabase → Render → Vercel
3. แต่ละคนอ่านโค้ดส่วนตัวเองให้เข้าใจทุกบรรทัด
4. อัดคลิปไม่เกิน 15 นาที ทุกคนบอกชื่อและอธิบายส่วนของตัวเอง

ห้าม commit ไฟล์ `.env` (มีรหัส database) ใช้แค่ `.env.example`
