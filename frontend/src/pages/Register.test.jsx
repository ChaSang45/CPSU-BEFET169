import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import Register from './Register';
import { register, login } from '../api/backend';

jest.mock('../api/backend');

function renderRegister() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<h1>หน้าแรก</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

async function fillAndSubmit(user) {
  await user.type(screen.getByPlaceholderText('ชื่อที่แสดง'), 'สมชาย');
  await user.type(screen.getByPlaceholderText('อีเมล'), 'a@su.ac.th');
  await user.type(screen.getByPlaceholderText(/รหัสผ่าน/), 'secret1');
  await user.click(screen.getByRole('button', { name: 'สมัครสมาชิก' }));
}

beforeEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
});

test('สมัครสำเร็จ: ส่งข้อมูลครบ แล้ว login ให้อัตโนมัติและไปหน้าแรก', async () => {
  const user = userEvent.setup();
  register.mockResolvedValue({ id: 1 });
  login.mockResolvedValue({ token: 'new.token', member: { id: 1, displayName: 'สมชาย', role: 'member' } });
  renderRegister();

  await fillAndSubmit(user);

  expect(register).toHaveBeenCalledWith('a@su.ac.th', 'secret1', 'สมชาย');
  expect(login).toHaveBeenCalledWith('a@su.ac.th', 'secret1');
  expect(await screen.findByRole('heading', { name: 'หน้าแรก' })).toBeInTheDocument();
  expect(localStorage.getItem('activities.token')).toBe('new.token');
});

test('อีเมลซ้ำ (409): เห็นข้อความ อยู่หน้าเดิม ไม่ login', async () => {
  const user = userEvent.setup();
  register.mockRejectedValue(new Error('อีเมลนี้ถูกใช้แล้ว'));
  renderRegister();

  await fillAndSubmit(user);

  expect(await screen.findByText('อีเมลนี้ถูกใช้แล้ว')).toBeInTheDocument();
  expect(login).not.toHaveBeenCalled();
  expect(screen.getByRole('heading', { name: 'สมัครสมาชิก' })).toBeInTheDocument();
});
