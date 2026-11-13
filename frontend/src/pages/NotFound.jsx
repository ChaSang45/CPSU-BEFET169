import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="px-4 py-24 text-center">
      <p className="text-5xl font-semibold text-line">404</p>
      <p className="mt-2 text-ink-soft">ไม่พบหน้านี้</p>
      <Link to="/" className="mt-4 inline-block text-sm font-medium text-ink underline decoration-signal decoration-2 underline-offset-4 hover:bg-signal/30">กลับหน้าแรก</Link>
    </div>
  );
}

export default NotFound;
