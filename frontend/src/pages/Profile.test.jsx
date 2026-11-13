import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import Profile from './Profile';
import { getMe, changePassword } from '../api/backend';

jest.mock('../api/backend');

const ME = { id: 1, email: 'a@su.ac.th', displayName: 'นักศึกษา', role: 'member', createdAt: '2026-11-01T00:00:00Z' };

function renderProfile() {
  localStorage.setItem('activities.token', 'fake.token');
  localStorage.setItem('activities.member', JSON.stringify(ME));
  return render(<AuthProvider><MemoryRouter><Profile /></MemoryRouter></AuthProvider>);
}

beforeEach(() => localStorage.clear());

test('โหลดโปรไฟล์จาก server แล้วแสดงอีเมล', async () => {
  getMe.mockResolvedValue(ME);
  renderProfile();
  expect(await screen.findByText('a@su.ac.th')).toBeInTheDocument();
  expect(getMe).toHaveBeenCalledWith('fake.token');            // ต้องแนบ token ไปด้วย
});

test('รหัสผ่านใหม่สองช่องไม่ตรงกัน ต้องเตือนและไม่ยิง server', async () => {
  const user = userEvent.setup();
  getMe.mockResolvedValue(ME);
  renderProfile();
  await screen.findByText('a@su.ac.th');

  await user.type(screen.getByLabelText('รหัสผ่านเดิม'), 'old123');
  await user.type(screen.getByLabelText('รหัสผ่านใหม่'), 'new123');
  await user.type(screen.getByLabelText('ยืนยันรหัสผ่านใหม่'), 'new999');
  await user.click(screen.getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }));

  expect(screen.getByText('รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน')).toBeInTheDocument();
  expect(changePassword).not.toHaveBeenCalled();
});

test('รหัสเดิมผิด ต้องแสดงข้อความจาก server', async () => {
  const user = userEvent.setup();
  getMe.mockResolvedValue(ME);
  changePassword.mockRejectedValue(new Error('รหัสผ่านเดิมไม่ถูกต้อง'));
  renderProfile();
  await screen.findByText('a@su.ac.th');

  await user.type(screen.getByLabelText('รหัสผ่านเดิม'), 'wrong1');
  await user.type(screen.getByLabelText('รหัสผ่านใหม่'), 'new123');
  await user.type(screen.getByLabelText('ยืนยันรหัสผ่านใหม่'), 'new123');
  await user.click(screen.getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }));

  expect(await screen.findByText('รหัสผ่านเดิมไม่ถูกต้อง')).toBeInTheDocument();
  expect(changePassword).toHaveBeenCalledWith('wrong1', 'new123', 'fake.token');
});
