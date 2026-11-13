// เจ้าของ: ChaSang45
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// ครอบหน้าหลังบ้าน: ยังไม่ login → ไปหน้า login / login แล้วแต่ role ไม่ตรง → หน้า 403
function RequireRole({ role, children }) {
  const { isLoggedIn, member } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (member?.role !== role) {
    return (
      <div className="px-4 py-24 text-center">
        <p className="text-5xl font-semibold text-line">403</p>
        <p className="mt-2 text-ink-soft">หน้านี้สำหรับ {role} เท่านั้น บัญชีของคุณเป็น {member?.role ?? 'member'}</p>
        <p className="mt-1 text-sm text-ink-soft">ถ้าเพิ่งได้รับสิทธิ์ ให้ออกจากระบบแล้วเข้าใหม่ เพราะตั๋วใบเดิมยังเป็นบทบาทเก่า</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-ink underline decoration-signal decoration-2 underline-offset-4 hover:bg-signal/30">กลับหน้าแรก</Link>
      </div>
    );
  }
  return children;
}

export default RequireRole;
