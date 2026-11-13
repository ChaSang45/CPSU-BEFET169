# เทียบกับเนื้อหาที่เรียน

เทียบกับ repo ที่ทำในคลาส: `moviehub-670710733` (FE สัปดาห์ 8–12) และ `backend-week8-lab` (Go)

## ไลบรารี: อยู่ในรายการที่เรียนครบ ไม่มีตัวนอกรายการ
- FE: react, react-dom, react-router-dom v6, react-scripts 5 (CRA), tailwindcss v3 + postcss + autoprefixer, Testing Library (+ user-event) — เวอร์ชันเดียวกับ moviehub
- BE: Go `net/http` (ไม่ใช้ Gin), pgx/v5, bcrypt (`golang.org/x/crypto`), golang-jwt/v5, godotenv

## รูปแบบที่ตามคลาส
| เรื่อง | ไฟล์ในงานเรา | ตามแบบในคลาส |
|---|---|---|
| `apiFetch(path, { method, body, token })` + ฟังก์ชันต่อ endpoint | `src/api/backend.js` | moviehub `src/api/backend.js` |
| AuthContext เก็บ token+member ใน localStorage, `isLoggedIn`, `isAdmin` | `src/auth/AuthContext.jsx` | moviehub เหมือนกัน |
| `ProtectedRoute`, `RequireRole` (หน้า 403) | `src/components/` | moviehub เหมือนกัน |
| หลังบ้าน nested route + `AdminLayout` + `<Outlet />` | `App.jsx`, `pages/admin/` | moviehub เหมือนกัน |
| `status` ตัวเดียว + `ignore` + `reloadKey` + ปุ่มลองใหม่ | ทุกหน้าที่โหลดข้อมูล | moviehub `AdminMembers`, `Wishlist` |
| `ErrorBox`, `Loading`, `ConfirmBox`, คลาสปุ่ม | `src/components/States.jsx` | moviehub `AdminStates.jsx` |
| ค้นหากรองในเครื่อง | `pages/Home.jsx` | moviehub `Movies` |
| test: `jest.mock('../api/backend')`, `findBy`, `userEvent` | `*.test.js(x)` | moviehub tests |
| GitHub Actions รัน test + build | `.github/workflows/test.yml` | moviehub เหมือนกัน |
| `mux.HandleFunc("GET /path/{id}")`, `r.PathValue` | `handler/handler.go` `Routes()` | backend-week8-lab |
| middleware `Logging`, `Recovery`, `CORS`, `TimeoutHandler`, graceful shutdown | `mw/mw.go`, `main.go` | backend-week8-lab |
| `writeJSON` / `writeError`, `errors.Is(err, store.ErrNotFound)` | `handler/` | backend-week8-lab |
| ตาราง `members`, `display_name`, `lower(email)`, ตอบ `{ token, member }`, `{ items }`, ห้ามรับ member_id จาก body | ทั้ง BE | moviehub `docs/db-schema.md` |

## จุดที่ไม่มีใน repo ที่เห็น (ต้องอธิบายได้ / ถามอาจารย์ถ้าไม่แน่ใจ)
- **โค้ด Go ส่วน pgx + JWT** ไม่อยู่ใน repo ที่ตรวจ (lab สัปดาห์ 8 ยังเป็น memory store) จึงเทียบรูปแบบตรง ๆ ไม่ได้ ถ้ามีโค้ดตัวอย่างของอาจารย์สัปดาห์ต่อมา ให้เทียบ `store/` กับ `mw/auth.go` อีกรอบ
- **transaction + `SELECT ... FOR UPDATE`** ใน `store/registrations.go` (กันสมัครเกินจำนวนรับตอนกดพร้อมกัน) — db-schema.md ของคลาสพูดถึง transaction แต่ไม่มี `FOR UPDATE` เป็นจุดเด่นที่เอาไปเล่าในคลิปข้อ "แก้ปัญหา" ได้
- **RLS ใน Supabase** (`schema.sql`) — ตั้งค่าความปลอดภัยของ Supabase ไม่ใช่โค้ด
