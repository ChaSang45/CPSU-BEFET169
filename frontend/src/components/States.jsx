import { useEffect, useRef } from 'react';

// ชิ้นส่วนเล็ก ๆ ที่หลายหน้าใช้ซ้ำ: กล่อง error, ข้อความกำลังโหลด, คลาสปุ่ม/ช่องกรอก, กล่องยืนยัน, รูปแบบวันเวลา

export function ErrorBox({ error, onRetry }) {
  return (
    <div role="alert" className="rounded-lg border border-alert/30 bg-white p-6 text-center">
      <p className="font-semibold text-alert">โหลดข้อมูลไม่สำเร็จ</p>
      <p className="mt-1 text-sm text-ink-soft">{error?.message}</p>
      {onRetry && (
        <button onClick={onRetry} className={btnGhost + ' mt-4'}>
          ลองใหม่
        </button>
      )}
    </div>
  );
}

export function Loading({ text = 'กำลังโหลด...' }) {
  return <p role="status" className="py-12 text-center text-ink-soft">{text}</p>;
}

export function Empty({ text }) {
  return <p className="py-16 text-center text-ink-soft">{text}</p>;
}

// ปุ่มสูงอย่างน้อย 44px ให้นิ้วกดง่ายบนมือถือ
const btnBase =
  'inline-flex min-h-[44px] items-center justify-center rounded-md px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed';

export const btnPrimary = btnBase + ' bg-ink text-white hover:bg-ink/90 disabled:bg-line disabled:text-ink-soft';
export const btnGhost = btnBase + ' border border-line bg-white text-ink hover:bg-paper disabled:text-ink-soft';
export const btnDanger = btnBase + ' border border-alert/40 bg-white text-alert hover:bg-alert/10 disabled:text-ink-soft';

export const inputClass =
  'w-full min-h-[44px] rounded-md border border-line bg-white px-3 py-2 text-ink placeholder:text-[#66728F] focus:border-ink';
export const labelClass = 'mb-1 block text-sm font-medium text-ink';

// ลิงก์ในเนื้อหา: ขีดเส้นใต้สีเหลืองให้รู้ว่ากดได้ ไม่พึ่งสีตัวอักษรอย่างเดียว
export const linkClass =
  'font-medium text-ink underline decoration-signal decoration-2 underline-offset-4 hover:bg-signal/30';

// กล่องยืนยันก่อนทำสิ่งที่ย้อนกลับไม่ได้ (ลบ, ยกเลิกการสมัคร) ไม่ต้องลงไลบรารี
// เปิดแล้วโฟกัสไปที่ปุ่มปลอดภัย (ไม่ทำ) / Tab วนอยู่ในกล่อง / กด Esc ปิดได้ / ปิดแล้วโฟกัสกลับไปที่ปุ่มที่กดเปิด
export function ConfirmBox({ open, title, children, confirmText = 'ยืนยัน', cancelText = 'ยกเลิก', busy, onConfirm, onCancel }) {
  const boxRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement;            // จำปุ่มที่กดเปิดไว้
    cancelRef.current?.focus();
    function onKey(e) {
      if (e.key === 'Escape' && !busy) { onCancel(); return; }
      if (e.key !== 'Tab') return;
      const items = boxRef.current.querySelectorAll('button:not(:disabled)');
      if (items.length === 0) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (opener && document.contains(opener)) opener.focus();   // ปิดแล้วกลับมาที่เดิม
    };
  }, [open, busy, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 px-4">
      <div ref={boxRef} role="dialog" aria-modal="true" aria-labelledby="confirm-title"
           className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-xl">
        <h2 id="confirm-title" className="text-lg font-semibold text-ink">{title}</h2>
        <div className="mt-2 text-sm text-ink-soft">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button ref={cancelRef} onClick={onCancel} disabled={busy} className={btnGhost}>{cancelText}</button>
          <button onClick={onConfirm} disabled={busy} className={btnDanger}>
            {busy ? 'กำลังทำ...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}


// วันเวลาแบบไทย เช่น "20 พ.ย. 2569 09:00"
export const dateTimeTH = (iso) =>
  new Date(iso).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });

// แยกส่วนวันเวลา ใช้วาดบล็อกวันที่บนตั๋ว: { day: '20', month: 'พ.ย.', year: '2569', time: '09:00' }
export function dateParts(iso) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString('th-TH', { day: 'numeric' }),
    month: d.toLocaleDateString('th-TH', { month: 'short' }),
    year: d.toLocaleDateString('th-TH', { year: 'numeric' }),
    time: d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false }),
  };
}
