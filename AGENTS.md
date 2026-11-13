# AGENTS.md — กติการ่วมของทีม (คน 2 คน + AI ของแต่ละคน)

ไฟล์นี้คือกติกากลางที่ AI ทุกตัวในทีมต้องอ่านก่อนทำงาน (Claude Code อ่านผ่าน `CLAUDE.md` ที่ชี้มาที่ไฟล์นี้)
โปรเจกต์: Term Project วิชา BE-FE (CPSU-BEFET169) React + Go + PostgreSQL ผู้ใช้ตอบเป็นภาษาไทย

## เอกสารอ้างอิง (อ่านตามเงื่อนไข)

- ก่อนเริ่มงานทุกชิ้น: [docs/SCOPE.md](docs/SCOPE.md) ขอบเขต, tech stack ที่ใช้ได้, ป้ายที่มา [จารย์]/[วิชา]/[เสนอ]
- เมื่อต้องตีความเกณฑ์คะแนนหรือข้อบังคับ: `docs/INSTRUCTOR-REQUIREMENTS.md` (ฉบับคัดลอกตรงจากอาจารย์ ห้ามแก้ **เก็บไว้ในเครื่องเท่านั้น ไม่ขึ้น GitHub** ขอไฟล์จากเพื่อนร่วมทีมถ้าไม่มี)
- เมื่อแตะ API: `docs/api.md` (สัญญา API — เปลี่ยน endpoint ต้องแก้ไฟล์นี้และบอกอีกคนก่อน)

## ลำดับความสำคัญเมื่อข้อมูลขัดกัน

1. ข้อกำหนดอาจารย์ → 2. วิชา Client (520 341) → 3. วิชา Server (520 342)
ทำข้อกำหนดอาจารย์ให้ครบก่อน แล้วค่อยเพิ่มส่วนเสริมจากเนื้อหาที่เรียน

## Tech stack (ใช้เฉพาะที่เรียน)

- FE: Create React App, React Router v6, Tailwind CSS v3, `fetch` ผ่าน `apiFetch`, Jest + React Testing Library
- BE: Go `net/http` (ไม่ใช้ Gin), pgx/v5, bcrypt, golang-jwt/v5, godotenv
- Deploy: Vercel (FE), Render (BE เชื่อม Repo), Supabase (DB)
- ต้องการไลบรารี/เครื่องมือนอกรายการนี้ → หยุดแล้วถามคนในทีมก่อน เพราะเกณฑ์ระบุ "ตามที่เรียนเท่านั้น"

## กติกา Git

- งานทุกชิ้นทำบน branch ของตัวเอง ตั้งชื่อ `<ชื่อคน>/<งาน>` แล้วเปิด Pull Request เข้า `main` อีกคนรีวิวก่อน merge
- commit เล็ก ข้อความบอกว่าทำอะไร
- commit/push เฉพาะเมื่อเจ้าของเครื่องสั่ง AI ให้ทำ
- ห้ามนำเนื้อหาของอาจารย์ขึ้น repo (`เนื้อหาที่เรียน(ต้องใส่ .gitignore)/` อยู่ใน `.gitignore`)
- ห้าม commit ค่าลับ (`.env`, `JWT_SECRET`, รหัสฐานข้อมูล) ใช้ `.env` ในเครื่อง และ env บน Render/Vercel

## แบ่งงานไม่ชนกัน

- แต่ละคนเป็นเจ้าของโฟลเดอร์/ฟีเจอร์ของตัวเอง ตามตารางด้านล่าง AI ของใครก็แก้เฉพาะส่วนของเจ้าของที่สั่งงาน
- ต้องแก้ไฟล์ของอีกคน → บอกอีกคนก่อน หรือเปิด PR แยกเล็ก ๆ
- ไฟล์กลางที่ชนกันง่าย (`package.json`, `go.mod`, `docs/api.md`, route หลัก) แก้แล้ว merge ทันที อย่าค้างไว้นาน

| ส่วนงาน | เจ้าของ |
|---|---|
| **Frontend ทั้งหมด** (`frontend/`: `pages/`, `components/`, `auth/`, `api/` ฯลฯ) ยกเว้นไฟล์กลางด้านล่าง — หน้าตา, การออกแบบ, ฟอร์ม, ยืนยัน popup, React test | ChaSang45 |
| BE กิจกรรม: ดู/ค้นหา/รายละเอียด — `handler/activities.go`, `store/activities.go` | Matika-Tana |
| BE หลังบ้าน: เพิ่ม/แก้/ลบ/ดูผู้สมัคร — `handler/admin.go` | Matika-Tana |
| BE สมาชิก: สมัคร/ล็อกอิน/โปรไฟล์/เปลี่ยนรหัสผ่าน/JWT/401-403 — `handler/auth.go`, `store/members.go`, `mw/auth.go` | ChaSang45 |
| BE เข้าร่วมกิจกรรม: สมัคร/ยกเลิก/กิจกรรมของฉัน — `handler/registrations.go`, `store/registrations.go` | ChaSang45 |
| Deploy: Supabase + Render (ตั้งค่า, env, ตั้งแอดมินด้วย SQL) | Matika-Tana |
| Deploy: Vercel (frontend) | ChaSang45 |
| ไฟล์กลาง: `main.go`, `handler/handler.go` (Routes), `mw/mw.go`, `store/store.go`, `schema.sql`, `api/backend.js`, `App.jsx`, `components/States.jsx`, `components/Navbar.jsx` | ทั้งคู่ (แก้แล้วบอกกัน) |

หมายเหตุ: Frontend เป็นของ ChaSang45 ทั้งหมด (ไฟล์ที่ Matika-Tana ส่งมาตอนแรกเป็นโค้ดทดลอง ChaSang45 รับไปปรับและต่อยอดแล้ว) ถ้า Matika-Tana ต้องแก้ไฟล์ใน `frontend/` ให้บอกก่อนหรือเปิด PR แยกเล็ก ๆ

## กติกาใช้ AI (ข้อสำคัญที่สุด)

- เกณฑ์คลิป 5 จาก 20 คะแนนตัดสินรายบุคคล: **ทุกคนต้องอธิบายโค้ดที่ตัวเองรับผิดชอบได้ทุกบรรทัด** และชี้เส้นทาง กดปุ่ม → React → `apiFetch` → Go → DB → กลับมา
- AI เขียนโค้ดแล้ว คนที่ commit ต้องอ่านและเข้าใจก่อน commit ถ้าไม่เข้าใจให้ให้ AI อธิบายจนเข้าใจ หรือเขียนให้ง่ายลง
- ให้ AI เขียนแบบเรียบง่ายตามรูปแบบที่เรียนในคลาส ไม่ใช้เทคนิคที่เกินเนื้อหา
- จดปัญหาที่เจอและวิธีแก้ลง `docs/PROBLEMS.md` ระหว่างทำ (ใช้เป็นหลักฐานในคลิปข้อ "เหตุผลและการแก้ปัญหา")
- AI ต้องแยก "ยืนยันแล้ว" ออกจาก "เดา" และไม่ยืนยันว่าเสร็จจนกว่าจะรัน test/build/curl จริง

## กติกาโค้ดที่เกณฑ์ตรวจ

- Backend ตรวจสิทธิ์เสมอ: ไม่ล็อกอิน = 401, ล็อกอินแล้วไม่มีสิทธิ์ = 403 ซ่อนปุ่มใน React ไม่นับเป็นการป้องกัน
- Backend อ่านตัวตนจาก token เท่านั้น ห้ามรับ `memberId` จาก body/URL และตรวจข้อมูลซ้ำเสมอ
- ทุกหน้าที่ดึงข้อมูลต้องมี Loading / Empty / Error (ใช้ `status` ตัวเดียว)
- เปลี่ยน state ใน React หลัง server ตอบสำเร็จ และไม่ mutate state
- SQL ใช้ `$1` เสมอ ห้ามต่อสตริง
- ไม่ตั้งชื่อโฟลเดอร์เอง ใช้ตามที่เรียน: FE `src/components`, `src/pages`, `src/api`, `src/auth`; BE `store/`, `handler/`, `mw/`
- แก้ไฟล์แล้วต้องรัน test ที่เกี่ยวข้องก่อนส่งต่อ (`npm test -- --watchAll=false`, `go test ./...`)

## สถานะ ณ ตอนนี้ (อัปเดตเมื่อเปลี่ยน)

- หัวข้อโปรเจกต์: เว็บรวบรวมกิจกรรมคณะ (Guest ดู/ค้นหา, Member สมัคร/ยกเลิก/กิจกรรมของฉัน, Admin จัดการกิจกรรม+ดูผู้สมัคร)
- โครงสร้าง repo: repo เดียว `frontend/` + `backend/` (Render/Vercel ตั้ง Root Directory)
- สัญญา API: `docs/api.md` / วิธีรันและ deploy: `docs/DEPLOY.md` / เทียบกับที่เรียน: `docs/CLASS-CHECK.md`
- รูปแบบโค้ดยึดตาม repo คลาส: moviehub (FE) และ backend-week8-lab (Go)
- Backend: ทดสอบกับ Postgres จริงในเครื่องแล้ว (API ผ่าน 55 รายการ) / Frontend: ออกแบบใหม่แนวตั๋วแล้ว, `npm test` ผ่าน 35 ข้อ, ตรวจ Guest/Member/Admin ด้วย Playwright กับ API จำลอง
- ยังไม่ได้ทดสอบ frontend ใหม่กับ backend จริง และ Deploy กำลังทำ (Supabase/Render โดย Matika-Tana, Vercel โดย ChaSang45)
- กำหนดส่ง: 8–14 พ.ย. 2569
