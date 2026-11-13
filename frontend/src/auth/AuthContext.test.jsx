import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import { getMyActivities } from '../api/backend';

// ใช้ backend.js ตัวจริง แต่แทน fetch ด้วยของปลอมที่ตอบ 401 เพื่อดูว่า login ถูกล้างจริงไหม
function Probe() {
  const { token, isLoggedIn, sessionExpired } = useAuth();
  return (
    <div>
      <p>{isLoggedIn ? 'login อยู่' : 'ยังไม่ login'}</p>
      <p>{sessionExpired ? 'หมดอายุ' : 'ปกติ'}</p>
      <button onClick={() => getMyActivities(token).catch(() => {})}>เรียก API</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('activities.token', 'old.token');
  localStorage.setItem('activities.member', JSON.stringify({ id: 1, displayName: 'นักศึกษา', role: 'member' }));
  global.fetch = jest.fn().mockResolvedValue({
    ok: false, status: 401, json: () => Promise.resolve({ error: 'ตั๋วไม่ถูกต้องหรือหมดอายุ' }),
  });
});

test('server ตอบ 401 ตอนแนบ token ต้องล้าง login, localStorage และบอกว่าหมดอายุ', async () => {
  const user = userEvent.setup();
  render(<AuthProvider><Probe /></AuthProvider>);
  expect(screen.getByText('login อยู่')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'เรียก API' }));

  expect(await screen.findByText('ยังไม่ login')).toBeInTheDocument();
  expect(screen.getByText('หมดอายุ')).toBeInTheDocument();
  expect(localStorage.getItem('activities.token')).toBeNull();
  expect(localStorage.getItem('activities.member')).toBeNull();
});
