// เจ้าของ: ChaSang45 — กรอบหน้าหลังบ้าน หน้าลูกจะแสดงตรง <Outlet />
import { NavLink, Outlet } from 'react-router-dom';

const tabClass = ({ isActive }) =>
  'rounded-full px-4 py-1.5 text-sm transition ' +
  (isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-indigo-50');

function AdminLayout() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-indigo-100 pb-4">
        <h1 className="mr-2 text-xl font-semibold text-slate-900">หลังบ้าน</h1>
        <nav className="flex flex-wrap gap-1">
          <NavLink to="/admin" end className={tabClass}>กิจกรรม</NavLink>
          <NavLink to="/admin/activities/new" className={tabClass}>+ เพิ่มกิจกรรม</NavLink>
        </nav>
      </div>
      <Outlet />
    </div>
  );
}

export default AdminLayout;
