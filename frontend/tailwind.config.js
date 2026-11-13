/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // สีทั้งหมดของแนว "ตั๋ว" อยู่ที่นี่ที่เดียว ใช้ชื่อสีใน className เช่น bg-ink, text-seat
      colors: {
        ink: '#14213D',        // กรมท่าเข้ม: ตัวอักษรหลัก แถบเมนู ปุ่มหลัก
        'ink-soft': '#475473', // ตัวอักษรรอง (ตัดกับพื้นขาว/พื้นกระดาษ > 4.5:1)
        paper: '#F6F7FB',      // พื้นหลังหน้า
        line: '#C9D1E3',       // เส้นขอบและเส้นปรุของตั๋ว
        signal: '#FFC145',     // เหลืองสัญญาณ: ใช้กับบล็อกวันที่และไฮไลต์เท่านั้น
        seat: '#177548',       // เขียว: ที่นั่งว่าง
        alert: '#C8372D',      // แดง: เต็ม / ผิดพลาด / ลบ
      },
      fontFamily: { sans: ['"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
