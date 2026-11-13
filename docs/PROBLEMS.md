# ปัญหาที่เจอและวิธีแก้ (ใช้ในคลิปข้อ "เหตุผลและการแก้ปัญหา")

| # | ปัญหา | สาเหตุ | วิธีแก้ | ใคร |
|---|---|---|---|---|
| 1 | 2 คนกดสมัครพร้อมกันตอนเหลือที่เดียว อาจเกินจำนวนรับ | นับจำนวนแล้วค่อย INSERT มีช่องว่างระหว่างกัน | transaction + `SELECT ... FOR UPDATE` ล็อกแถวกิจกรรม (`store/registrations.go`) | ChaSang45 |
| 2 | ไม่มีข้อมูล Go ตอบ `null` แทน `[]` ทำให้ React `.filter` / `.map` พัง | slice ที่ยังไม่สร้างเป็น nil | เริ่มด้วย `list := []Activity{}` | Matika |
| 3 | Supabase เปิดตารางให้อ่านผ่าน REST API ด้วย anon key (รวม password_hash) | ค่าเริ่มต้นของ Supabase | `ENABLE ROW LEVEL SECURITY` ทุกตาราง (`schema.sql`) | ทั้งคู่ |
| 4 | รีเฟรชหน้า `/admin` บน Vercel แล้ว 404 | Vercel หาไฟล์ชื่อ admin ไม่เจอ | `vercel.json` rewrite ทุก path ไป `index.html` | Matika |
| 5 | ตั้งเป็น admin แล้วยังเข้าหลังบ้านไม่ได้ | role ฝังอยู่ในตั๋วใบเดิม | logout แล้ว login ใหม่ (หน้า 403 บอกผู้ใช้ไว้แล้ว) | ChaSang45 |
| 6 | เวลากิจกรรมเพี้ยน 7 ชั่วโมง | `datetime-local` ไม่มี timezone | หน้าเว็บแปลงเป็น ISO (UTC) ด้วย `toISOString()` ก่อนส่ง ตอนแสดงใช้ `toLocaleString('th-TH')` | Matika |
| | (เติมเพิ่มระหว่างทำ) | | | |
