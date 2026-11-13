// ไอคอน SVG ที่เขียนเอง (ไม่ใช้ไลบรารีไอคอน) ทุกตัวเป็นของประดับ ซ่อนจากโปรแกรมอ่านหน้าจอด้วย aria-hidden
// ข้อมูลสำคัญต้องมีข้อความกำกับข้าง ๆ เสมอ ไม่พึ่งไอคอนอย่างเดียว

function Svg({ className = 'h-4 w-4', children }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
         strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export function PinIcon(props) {
  return <Svg {...props}><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></Svg>;
}

export function ClockIcon(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>;
}

export function UsersIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18 14.2a6.5 6.5 0 0 1 3.5 5.8" />
    </Svg>
  );
}

export function CheckIcon(props) {
  return <Svg {...props}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>;
}

export function SearchIcon(props) {
  return <Svg {...props}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></Svg>;
}

// ตั๋วขนาดเล็กใช้เป็นโลโก้ใน Navbar
export function TicketIcon(props) {
  return <Svg {...props}><path d="M4 8h16v3a1.8 1.8 0 0 0 0 3.6V17H4v-2.4A1.8 1.8 0 0 0 4 11z" /><path d="M14 8v9" strokeDasharray="1.5 2.5" /></Svg>;
}
