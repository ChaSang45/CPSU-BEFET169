import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import Login from './Login';
import { login } from '../api/backend';

jest.mock('../api/backend');

function renderLogin(from) {
  const entry = from ? { pathname: '/login', state: { from } } : '/login';
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<h1>หน้าแรก</h1>} />
          <Route path="/me/activities" element={<h1>กิจกรรมของฉัน</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

async function fillAndSubmit(user) {
  await user.type(screen.getByLabelText('อีเมล'), 'a@su.ac.th');
  await user.type(screen.getByLabelText('รหัสผ่าน'), 'secret1');
  await user.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));
}

beforeEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
});

test('login สำเร็จ: เก็บ token แล้วกลับหน้าเดิมที่ตั้งใจจะไป', async () => {
  const user = userEvent.setup();
  login.mockResolvedValue({ token: 'new.token', member: { id: 1, displayName: 'นักศึกษา', role: 'member' } });
  renderLogin('/me/activities');

  await fillAndSubmit(user);

  expect(login).toHaveBeenCalledWith('a@su.ac.th', 'secret1');
  expect(await screen.findByRole('heading', { name: 'กิจกรรมของฉัน' })).toBeInTheDocument();
  expect(localStorage.getItem('activities.token')).toBe('new.token');
});

test('login ผิด: เห็นข้อความจาก server อยู่หน้าเดิม และไม่เก็บ token', async () => {
  const user = userEvent.setup();
  login.mockRejectedValue(new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง'));
  renderLogin();

  await fillAndSubmit(user);

  expect(await screen.findByText('อีเมลหรือรหัสผ่านไม่ถูกต้อง')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeInTheDocument();
  expect(localStorage.getItem('activities.token')).toBeNull();
});
