import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const linkClass = ({ isActive }) =>
  'rounded-full px-3 py-1 text-sm ' + (isActive ? 'bg-white/20' : 'hover:bg-white/10');

function Navbar() {
  const { isLoggedIn, isAdmin, member, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="bg-indigo-700 text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3 md:px-6">
        <Link to="/" className="mr-4 text-lg font-semibold">กิจกรรมคณะ</Link>
        <NavLink to="/" end className={linkClass}>กิจกรรมทั้งหมด</NavLink>
        {isLoggedIn && <NavLink to="/me/activities" className={linkClass}>กิจกรรมของฉัน</NavLink>}
        {isAdmin && <NavLink to="/admin" className={linkClass}>หลังบ้าน</NavLink>}
        <div className="flex-1" />
        {isLoggedIn ? (
          <>
            <NavLink to="/me/profile" className={linkClass}>👤 {member?.displayName}</NavLink>
            <button onClick={handleLogout} className="rounded-full bg-white/20 px-3 py-1 text-sm hover:bg-white/30">
              ออกจากระบบ
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={linkClass}>เข้าสู่ระบบ</NavLink>
            <Link to="/register" className="rounded-full bg-white px-3 py-1 text-sm text-indigo-700">สมัครสมาชิก</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
