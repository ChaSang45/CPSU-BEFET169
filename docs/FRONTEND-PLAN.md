# แผนงาน Frontend (ปรับปรุงให้สมบูรณ์และดูดี)

> บันทึกเมื่อ 13 พ.ย. 2569 (กำหนดส่ง 14 พ.ย.) ที่มา: ผู้ใช้ (ChaSang45) ตกลงกับทีมว่า **ไฟล์ Frontend ทุกไฟล์ ChaSang45 แก้และลบได้ทั้งหมด**
> รวมไฟล์ที่ `AGENTS.md` เคยระบุว่าเป็นของ Matika (`Home.jsx`, `ActivityCard.jsx`, `ActivityGrid.jsx`, `pages/admin/*`)
> เหตุผล (ผู้ใช้ยืนยัน): งานที่เพื่อนส่งมามอบ Frontend ให้ ChaSang45 ทั้งหมด ส่วนโค้ด Frontend ใน PR #1 เป็นโค้ดที่เพื่อนลองทำไว้ ChaSang45 ให้ push เข้ามาเพื่อปรับแก้และต่อยอด
> (ยังไม่ได้ปรับตารางใน `AGENTS.md` ให้ตรงกัน และคอมเมนต์ "เจ้าของ: Matika" ในไฟล์ `ActivityGrid.jsx`, `pages/admin/*` ยังไม่ได้แก้)

## ความคืบหน้า (13 พ.ย. ทำในเครื่อง ยังไม่ commit)

| # | สถานะ | หลักฐาน |
|---|---|---|
| A1 | ทำแล้ว | `apiFetch` เรียก handler เมื่อ 401 ตอนแนบ token → `AuthProvider` ล้าง login + `sessionExpired` → Login โชว์ข้อความ ทดสอบในเบราว์เซอร์กับ Backend จริง: token เสียแล้วเปิด `/me/activities` ถูกพาไป `/login` พร้อมข้อความ |
| A2 | ทำแล้ว | token เสียแล้วเปิด `/activities/2` เห็นกิจกรรมแบบ Guest ไม่ขึ้น error |
| A3 | ทำแล้ว | `components/ActivityStatus.jsx` (ป้ายสถานะ + เรียงลำดับ) ใช้ในการ์ดและหน้ารายละเอียด ดูในเบราว์เซอร์แล้ว |
| A4 | ทำแล้ว | เทสต์เพิ่มจาก 13 เป็น 34 (ActivityDetail, MyActivities, Login, Register, AuthContext, backend 401, Home เรียงลำดับ) ผ่านทั้งหมด `npm run build` สะอาด |
| A5 | ตรวจแล้วบางส่วน | ไม่มีหน้าไหนล้นจอแนวนอนที่ 375px (วัดด้วย scrollWidth 5 หน้า) แต่ตาราง Admin แน่น ลิงก์ผู้สมัคร/แก้ไข/ลบ ขึ้นเป็นแถวซ้อนกัน ยังไม่ได้ปรับ |
| A6 | ทำแล้ว (13 พ.ย.) | ทดสอบด้วย Playwright กับ Backend จริง เขตเวลา Asia/Bangkok: login แอดมินผ่านหน้าเว็บ → สร้างกิจกรรม 14:30 → DB เก็บ 07:30 UTC ตรงกัน → หน้ารายการและฟอร์มแก้ไขแสดง 14:30 → แก้เป็น 09:15 สำเร็จ → ลดจำนวนรับต่ำกว่าคนที่สมัคร (2 คน) ถูกปฏิเสธพร้อมข้อความ → หน้าผู้สมัครแสดงรายชื่อ → กล่องยืนยันลบ: ยกเลิกแล้วรายการอยู่, ยืนยันแล้วลบพร้อมรายชื่อผู้สมัครใน DB หาย ไม่พบบั๊ก |
| B, C | ยังไม่ทำ | เพิ่มเติมที่เจอระหว่างทดสอบ: ไม่มี `favicon.ico` (เบราว์เซอร์ขึ้น 404 ใน console), ช่องรหัสผ่านใน Login/Register ควรใส่ `autocomplete` (`current-password` / `new-password`) |
> Backend ไม่อยู่ในแผนนี้

## สถานะที่ตรวจแล้ว (13 พ.ย.)

- **Backend:** รันกับ Postgres จริงในเครื่อง ยิง API ทดสอบ 55 รายการ ผ่านทั้งหมด (สมัคร/login/โปรไฟล์/เปลี่ยนรหัส/สมัครกิจกรรม/401-403/Admin CRUD/กดพร้อมกัน 8 คนในกิจกรรมรับ 1 คน)
- **Frontend:** `npm test` ผ่าน 13 เทสต์ (4 ไฟล์), `npm run build` ผ่าน, เปิดดูหน้าแรก/รายละเอียด/Admin กับ Backend จริงแล้วใช้งานได้
- **ยังไม่ได้ทำ:** Deploy (Supabase/Render/Vercel), ลองกดทุกหน้าผ่านเบราว์เซอร์, ดูบนมือถือ

## ข้อจำกัด (จากเกณฑ์ "ตามที่เรียนเท่านั้น")

- React (CRA) + React Router v6 + Tailwind CSS v3 + `fetch` ผ่าน `apiFetch` เท่านั้น
- ห้ามเพิ่มไลบรารี UI, ไอคอน, toast, state (เช่น MUI, React Query) ต้องเขียนเอง
- ทุกหน้าที่ดึงข้อมูลต้องมี Loading / Empty / Error ใช้ `status` ตัวเดียว (กติกาใน `AGENTS.md`)
- เปลี่ยน state หลัง server ตอบสำเร็จ และไม่ mutate state
- ทุกคนต้องอธิบายโค้ดที่ตัวเองแก้ได้ทุกบรรทัดในคลิป ให้เขียนแบบเรียบง่ายตามที่เรียน

## งานกลุ่ม A: ต้องแก้ก่อนส่ง

| # | งาน | ไฟล์ที่เกี่ยว | เสร็จเมื่อ |
|---|---|---|---|
| A1 | token หมดอายุหรือไม่ถูกต้อง (401 จาก API ที่แนบ token) → ล้าง login แล้วพาไปหน้า Login พร้อมข้อความ | `api/backend.js`, `auth/AuthContext.jsx` | แก้ localStorage ให้ token เสีย แล้วเปิดหน้าที่ต้อง login → ถูกพาไป `/login` ไม่ค้าง และมีเทสต์ |
| A2 | หน้ารายละเอียดกิจกรรมไม่พังทั้งหน้าเมื่อเช็ก "สมัครแล้วหรือยัง" ล้มเหลว (ข้อมูลกิจกรรมเป็นข้อมูลสาธารณะ) | `pages/ActivityDetail.jsx` | ใช้ token เสียเปิดหน้ารายละเอียด → ยังเห็นกิจกรรม |
| A3 | ป้ายสถานะ เปิดรับ / เต็ม / จบแล้ว บนการ์ดและหน้ารายละเอียด และเรียงกิจกรรมที่ยังไม่เริ่มขึ้นก่อน | `components/ActivityCard.jsx`, `pages/Home.jsx`, `pages/ActivityDetail.jsx` | หน้าแรกแยกกิจกรรมจบแล้วออกจากกิจกรรมใหม่ได้ชัด |
| A4 | เพิ่ม React Unit Test ของพฤติกรรมหลัก: ปุ่มสมัคร/ยกเลิก (สมัครได้, เต็ม, เริ่มแล้ว, ยังไม่ login), `MyActivities` (ว่าง/ยกเลิก), `Login`/`Register` (สำเร็จ/error) | `*.test.jsx` ใกล้ไฟล์ที่ทดสอบ | `npm test -- --watchAll=false` ผ่านทั้งหมด และ assertion ตรวจผลที่ผู้ใช้เห็น |
| A5 | ทดสอบหน้าจอมือถือ (375px) Navbar และตาราง Admin | `components/Navbar.jsx`, `pages/admin/*` | ไม่มีเนื้อหาล้นจอ ปุ่มกดได้ |
| A6 | ตรวจ `AdminActivityForm` ส่วนท้าย (แปลงวันเวลา `datetime-local` ก่อนส่ง) และลองสร้าง/แก้กิจกรรมผ่านหน้าเว็บจริง | `pages/admin/AdminActivityForm.jsx` | เวลาที่กรอกกับเวลาที่แสดงหลังบันทึกตรงกัน |

## งานกลุ่ม B: ทำให้ดูดี (ถ้ามีเวลา)

- ข้อความแจ้งผลหลังสมัคร/ยกเลิก (component เอง) และปุ่ม "สมัครแล้ว ✓"
- ส่วนหัวหน้าแรกเล็ก ๆ, Footer
- Skeleton แทนข้อความ "กำลังโหลด...", Empty state ที่มีข้อความชวนทำ
- ชื่อแท็บเบราว์เซอร์ต่อหน้า, สีป้ายสถานะให้สม่ำเสมอ

## งานกลุ่ม C: คุณภาพ/การเข้าถึง (ทำเมื่อว่าง)

- ช่องกรอกใน Login/Register/Profile ใส่ `<label>` (ตอนนี้มีแค่ placeholder)
- กล่อง `ConfirmBox` ปิดด้วย Escape ได้ และจัดการ focus

## ลำดับทำงาน

1. A1 + A2 (บั๊กจริง) → PR เดียว
2. A4 เทสต์ปุ่มสมัคร/ยกเลิก (ต้องทำก่อนแก้ A3 เพื่อกันถอยหลัง)
3. A3, A6, A5
4. กลุ่ม B ตามเวลาที่เหลือ
5. **Deploy ทำคู่ขนาน ไม่รอให้ Frontend สวยก่อน** (ดู `docs/DEPLOY.md` และ `SCOPE.md` หัวข้อ 6)

ทุกงานทำบน branch แล้วเปิด PR เข้า `main` ตามกติกาใน `AGENTS.md`

## วิธีรันทดสอบในเครื่อง (ที่ลองแล้วได้ผล)

Backend + ฐานข้อมูล (ต้องเปิด Docker Desktop ก่อน ใช้พอร์ต 55432 กันชนกับ Postgres อื่น):

```bash
docker run -d --name cpsu-pg -e POSTGRES_PASSWORD=localtest -p 55432:5432 postgres:16
docker exec -i cpsu-pg psql -U postgres -v ON_ERROR_STOP=1 < backend/schema.sql
```

รัน Go โดยตั้ง env ในคำสั่ง (ไม่ต้องสร้างไฟล์ `.env`): `DATABASE_URL`, `JWT_SECRET` (ยาว ≥ 32 ตัว), `FRONTEND_ORIGIN=http://localhost:3000`, `PORT=8080` แล้ว `go run .` ใน `backend/`

Frontend: `npm start` ในเครื่องที่ทดสอบ **เปิดไม่ติด** (error `options.allowedHosts[0] should be a non-empty string` ตอนมี `"proxy"` ใน `package.json` ยังไม่ทราบสาเหตุแน่ชัด) วิธีที่ใช้ได้แทน:

```bash
cd frontend
REACT_APP_API_URL=http://localhost:8080 npm run build
cd build && python -m http.server 3000
```

ข้อจำกัดของวิธีนี้: เปิดหน้าอื่นด้วยการพิมพ์ URL ตรง ๆ ไม่ได้ (ไม่มี fallback ไป `index.html`) ให้เปิดจาก `/` แล้วกดลิงก์ในแอป

ตั้งแอดมินในฐานข้อมูลเครื่อง: `UPDATE members SET role='admin' WHERE lower(email)=lower('...');` แล้ว login ใหม่ (role อยู่ใน token)

## ยังไม่ยืนยัน

- ความเห็นของ Matika ต่อการย้ายความเป็นเจ้าของไฟล์ Frontend ทั้งหมด (บันทึกตามคำของผู้ใช้)
- บั๊ก A1/A2 ฉันอ่านโค้ดแล้วคาดว่าเกิดจริง แต่ยังไม่ได้รันให้เห็นผล
- ยังไม่ได้ดูหน้า Login, Register, Profile, MyActivities, ฟอร์ม Admin ผ่านเบราว์เซอร์
