# CPSU-BEFET169 Term Project

Term Project วิชา BE-FE (Client Side 520 341 + Server Side 520 342) ทีม 2 คน

> หัวข้อโปรเจกต์: **เว็บรวบรวมกิจกรรมคณะ**
>
> - **Guest** ดูและค้นหากิจกรรม
> - **Member** สมัคร/ยกเลิก/ดูกิจกรรมของฉัน แก้โปรไฟล์ เปลี่ยนรหัสผ่าน
> - **Admin** เพิ่ม/แก้/ลบกิจกรรม และดูรายชื่อผู้สมัคร

## ระบบจริง (Deploy)

| ส่วน | บริการ | URL |
|---|---|---|
| Frontend | Vercel | https://cpsu-befet-169.vercel.app |
| Backend | Render | https://cpsu-befet169.onrender.com (ตรวจสถานะที่ `/api/health`) |
| Database | Supabase (PostgreSQL) | ใช้ภายใน Backend ไม่เปิดให้เข้าตรง |

หมายเหตุ: Render ฟรีจะหลับหลังไม่มีคนใช้ ~15 นาที เปิดหน้า health check ปลุกก่อนใช้งาน

## Tech Stack

React (Create React App) + React Router v6 + Tailwind CSS v3 / Go `net/http` + pgx / PostgreSQL (Supabase)

## เอกสารในทีม

- [AGENTS.md](AGENTS.md) กติการ่วมของทีมและ AI (อ่านก่อนเริ่มงาน)
- [docs/SCOPE.md](docs/SCOPE.md) ขอบเขตงานและเกณฑ์
- [docs/api.md](docs/api.md) สัญญา API
- [docs/ADMIN.md](docs/ADMIN.md) วิธีตั้งแอดมินและตรวจสิทธิ์

## วิธีรันในเครื่อง

ดูขั้นตอนเต็มใน [docs/DEPLOY.md](docs/DEPLOY.md) (ต้องมี Postgres เช่น Supabase หรือ Docker ในเครื่อง)

- Backend: `cd backend` → ตั้งค่า `.env` ตาม `.env.example` → `go test ./...` → `go run .`
- Frontend: `cd frontend` → `npm install` → `npm test -- --watchAll=false` → `npm start`
- ตั้งแอดมิน: [docs/ADMIN.md](docs/ADMIN.md)

## ผู้จัดทำ

| ชื่อ (GitHub) | ส่วนที่รับผิดชอบ |
|---|---|
| ChaSang45 | Frontend ทั้งหมด, Deploy Vercel, สมาชิก/เข้าร่วมกิจกรรม (ฝั่ง Backend) |
| Matika-Tana | Backend กิจกรรมและหลังบ้าน, Deploy Supabase + Render |

รายละเอียดรายไฟล์ดูตารางใน [AGENTS.md](AGENTS.md)
