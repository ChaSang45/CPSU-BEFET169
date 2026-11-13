-- รันไฟล์นี้ใน Supabase > SQL Editor ครั้งเดียว

CREATE TABLE IF NOT EXISTS members (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(100) NOT NULL,
    role          VARCHAR(10)  NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
-- อีเมลห้ามซ้ำ ไม่สนตัวพิมพ์เล็กใหญ่
CREATE UNIQUE INDEX IF NOT EXISTS uq_members_email ON members (lower(email));

CREATE TABLE IF NOT EXISTS activities (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    location    VARCHAR(200) NOT NULL DEFAULT '',
    start_at    TIMESTAMPTZ NOT NULL,
    capacity    INT NOT NULL CHECK (capacity > 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- สมาชิก 1 คนสมัคร 1 กิจกรรมได้ครั้งเดียว (PRIMARY KEY คู่)
-- ลบกิจกรรมหรือสมาชิก การสมัครที่เกี่ยวข้องหายตาม (ON DELETE CASCADE)
CREATE TABLE IF NOT EXISTS registrations (
    member_id   BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    activity_id BIGINT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (member_id, activity_id)
);

-- สำคัญ: Supabase เปิดตารางใน public ให้อ่านผ่าน REST API ด้วย anon key ได้
-- เปิด RLS (ไม่ใส่ policy) = ปิดทางนั้น ส่วน Go ต่อด้วย user postgres จึงใช้งานได้ปกติ
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- ข้อมูลตัวอย่าง
INSERT INTO activities (title, description, location, start_at, capacity) VALUES
('ปฐมนิเทศนักศึกษาใหม่', 'แนะนำคณะ อาจารย์ และรุ่นพี่', 'หอประชุมคณะ', '2026-11-20 09:00:00+07', 200),
('Workshop React เบื้องต้น', 'ลงมือทำเว็บแรกด้วย React', 'ห้องแล็บ 1', '2026-11-25 13:00:00+07', 30),
('กีฬาสีคณะ', 'แข่งกีฬาระหว่างสี', 'สนามกีฬามหาวิทยาลัย', '2026-12-05 08:00:00+07', 500);

-- ตั้งแอดมิน: สมัครสมาชิกผ่านหน้าเว็บก่อน แล้วรันคำสั่งนี้ (เปลี่ยนอีเมล) จากนั้น logout แล้ว login ใหม่
-- UPDATE members SET role = 'admin' WHERE lower(email) = lower('admin@example.com');
