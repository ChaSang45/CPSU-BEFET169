import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { TicketIcon } from './Icons';

// ลิงก์เมนู: ตัวที่เปิดอยู่มีเส้นใต้สีเหลือง (ไม่พึ่งสีตัวอักษรอย่างเดียว) และสูง 44px ให้กดง่าย
const linkClass = ({ isActive }) =>
  'on-dark inline-flex min-h-[44px] items-center border-b-2 px-3 text-sm font-medium transition-colors '
  + (isActive ? 'border-signal text-white' : 'border-transparent text-white/80 hover:text-white');

function Navbar() {
  const { isLoggedIn, isAdmin, member, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav aria-label="เมนูหลัก" className="bg-ink text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-1 px-4 py-1 md:px-6">
        <Link to="/" className="on-dark mr-3 inline-flex min-h-[44px] items-center gap-2 text-lg font-bold">
          <TicketIcon className="h-6 w-6 text-signal" />
          กิจกรรมคณะ
        </Link>
        <NavLink to="/" end className={linkClass}>กิจกรรมทั้งหมด</NavLink>
        {isLoggedIn && <NavLink to="/me/activities" className={linkClass}>กิจกรรมของฉัน</NavLink>}
        {isAdmin && <NavLink to="/admin" className={linkClass}>หลังบ้าน</NavLink>}
        <div className="flex-1" />
        {isLoggedIn ? (
          <>
            <NavLink to="/me/profile" className={linkClass}>{member?.displayName}</NavLink>
            <button onClick={handleLogout}
                    className="on-dark ml-1 inline-flex min-h-[44px] items-center rounded-md border border-white/30 px-3 text-sm font-medium hover:bg-white/10">
              ออกจากระบบ
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={linkClass}>เข้าสู่ระบบ</NavLink>
            <Link to="/register"
                  className="on-dark ml-1 inline-flex min-h-[44px] items-center rounded-md bg-signal px-4 text-sm font-semibold text-ink hover:brightness-95">
              สมัครสมาชิก
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
