# คู่มือรันในเครื่อง + Deploy (ทำตามลำดับ)

## 1. Supabase (ฐานข้อมูล)
1. supabase.com → New project (Region: Southeast Asia (Singapore)) จดรหัสผ่าน DB ไว้
2. เมนู **SQL Editor** → วางเนื้อหา `backend/schema.sql` ทั้งไฟล์ → Run
3. ปุ่ม **Connect** ด้านบน → เลือก **Session pooler** → คัดลอก URI แล้วแทน `[YOUR-PASSWORD]` ด้วยรหัสจริง
   - ⚠️ อย่าใช้ "Direct connection" (Render ต่อไม่ได้ เพราะเป็น IPv6) และอย่าใช้ "Transaction pooler" (พอร์ต 6543 ทำให้ pgx error เรื่อง prepared statement)
   - ⚠️ ถ้ารหัสผ่านมีอักขระพิเศษ เช่น `@ # /` ต้องแปลงเป็น URL encoding หรือเปลี่ยนรหัสให้เป็นตัวอักษร/ตัวเลขล้วน

## 2. รัน Backend ในเครื่อง
```
cd backend
copy .env.example .env      (Mac/Linux: cp .env.example .env) แล้วแก้ค่าใน .env
go mod tidy                 (ครั้งแรก — ดาวน์โหลดไลบรารี และสร้าง go.sum)
go test ./...
go run .
```
เปิด http://localhost:8080/api/activities ต้องเห็นกิจกรรมตัวอย่าง 3 อัน

## 3. รัน Frontend ในเครื่อง (อีก terminal ให้ Go รันค้างไว้)
```
cd frontend
npm install                 (ในเครื่องไม่ต้องสร้าง .env — CRA proxy /api ไป localhost:8080 ให้เอง)
npm test -- --watchAll=false
npm start
```

## 4. ตั้งแอดมิน
สมัครสมาชิกผ่านหน้าเว็บ แล้วใน Supabase SQL Editor รัน
`UPDATE members SET role = 'admin' WHERE lower(email) = lower('อีเมลที่สมัคร');`
จากนั้น **ออกจากระบบแล้วเข้าใหม่** (role อยู่ใน token ต้องได้ token ใหม่)

## 5. Render (Backend) — เชื่อมกับ Repo
New → Web Service → เลือก repo
- Root Directory: `backend`
- Runtime: Go
- Build Command: `go mod tidy && go build -o app .`
- Start Command: `./app`
- Environment: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_ORIGIN` (ใส่ URL Vercel ทีหลังได้)
- ทดสอบ: `https://<ชื่อ>.onrender.com/api/health` ต้องตอบ `ok`
- ⚠️ Render ฟรีจะหลับเมื่อไม่มีคนใช้ ~15 นาที ครั้งแรกโหลดช้า ~1 นาที ก่อนอัดคลิปให้เปิด /api/health ปลุกไว้ก่อน

## 6. Vercel (Frontend)
Add New → Project → เลือก repo
- Root Directory: `frontend` (Framework: Create React App)
- Environment Variable: `REACT_APP_API_URL` = URL ของ Render (ไม่มี `/` ปิดท้าย)
- Deploy เสร็จ → เอา URL Vercel ไปใส่ `FRONTEND_ORIGIN` บน Render (ไม่มี `/` ปิดท้าย) → Render จะ redeploy
- ⚠️ Vercel build แบบ CI: ถ้ามี ESLint warning จะ build fail — แก้ warning ตามที่ log บอก อย่าปิด CI เฉย ๆ
- ⚠️ แก้ env บน Vercel แล้วต้อง Redeploy ค่า `REACT_APP_*` ถึงจะเปลี่ยน
