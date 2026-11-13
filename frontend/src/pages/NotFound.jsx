import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="px-4 py-24 text-center">
      <p className="text-5xl font-semibold text-ink-soft">404</p>
      <h1 className="mt-2 text-xl font-semibold text-ink">ไม่พบหน้านี้</h1>
      <Link to="/" className="mt-4 inline-flex min-h-[44px] items-center text-sm font-medium text-ink underline decoration-signal decoration-2 underline-offset-4 hover:bg-signal/30">กลับหน้าแรก</Link>
    </div>
  );
}

export default NotFound;
