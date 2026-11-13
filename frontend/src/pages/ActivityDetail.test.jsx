import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import ActivityDetail from './ActivityDetail';
import { getActivity, getMyActivities, joinActivity, cancelActivity } from '../api/backend';

jest.mock('../api/backend');

const OPEN = {
  id: 2, title: 'Workshop React', description: 'ลงมือทำเว็บแรก', location: 'ห้องแล็บ 1',
  startAt: '2099-01-01T00:00:00Z', capacity: 30, registered: 5,
};

function renderDetail({ loggedIn = true } = {}) {
  if (loggedIn) {
    localStorage.setItem('activities.token', 'fake.token');
    localStorage.setItem('activities.member', JSON.stringify({ id: 1, displayName: 'นักศึกษา', role: 'member' }));
  }
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/activities/2']}>
        <Routes><Route path="/activities/:id" element={<ActivityDetail />} /></Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
  getActivity.mockResolvedValue(OPEN);
  getMyActivities.mockResolvedValue([]);
});

test('Guest เห็นปุ่มไปเข้าสู่ระบบ และไม่เรียก API ของสมาชิก', async () => {
  renderDetail({ loggedIn: false });
  expect(await screen.findByRole('link', { name: 'เข้าสู่ระบบเพื่อสมัคร' })).toBeInTheDocument();
  expect(getMyActivities).not.toHaveBeenCalled();
});

test('กดสมัคร: เรียก API พร้อม token แล้วจำนวนเพิ่ม และปุ่มกลายเป็นยกเลิก', async () => {
  const user = userEvent.setup();
  joinActivity.mockResolvedValue(null);
  renderDetail();

  await user.click(await screen.findByRole('button', { name: 'สมัครเข้าร่วม' }));

  expect(joinActivity).toHaveBeenCalledWith('2', 'fake.token');
  expect(await screen.findByRole('button', { name: 'ยกเลิกการสมัคร' })).toBeInTheDocument();
  expect(screen.getByText(/สมัครแล้ว 6\/30/)).toBeInTheDocument();
});

test('server ปฏิเสธการสมัคร (409) ต้องเห็นข้อความ และจำนวนกับปุ่มไม่เปลี่ยน', async () => {
  const user = userEvent.setup();
  joinActivity.mockRejectedValue(new Error('กิจกรรมเต็มแล้ว'));
  renderDetail();

  await user.click(await screen.findByRole('button', { name: 'สมัครเข้าร่วม' }));

  expect(await screen.findByText('กิจกรรมเต็มแล้ว')).toBeInTheDocument();
  expect(screen.getByText(/สมัครแล้ว 5\/30/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'สมัครเข้าร่วม' })).toBeInTheDocument();
});

test('คนที่สมัครไว้แล้วเห็นปุ่มยกเลิก กดแล้วจำนวนลดและกลับมาสมัครได้', async () => {
  const user = userEvent.setup();
  getMyActivities.mockResolvedValue([{ id: 2 }]);
  cancelActivity.mockResolvedValue(null);
  renderDetail();

  await user.click(await screen.findByRole('button', { name: 'ยกเลิกการสมัคร' }));

  expect(cancelActivity).toHaveBeenCalledWith('2', 'fake.token');
  expect(await screen.findByRole('button', { name: 'สมัครเข้าร่วม' })).toBeInTheDocument();
  expect(screen.getByText(/สมัครแล้ว 4\/30/)).toBeInTheDocument();
});

test('กิจกรรมเต็ม ไม่มีปุ่มสมัคร', async () => {
  getActivity.mockResolvedValue({ ...OPEN, registered: 30 });
  renderDetail();
  expect(await screen.findByText('กิจกรรมเต็มแล้ว')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'สมัครเข้าร่วม' })).not.toBeInTheDocument();
});

test('กิจกรรมเริ่มไปแล้ว ไม่มีปุ่มสมัคร', async () => {
  getActivity.mockResolvedValue({ ...OPEN, startAt: '2000-01-01T00:00:00Z' });
  renderDetail();
  expect(await screen.findByText('กิจกรรมเริ่มไปแล้ว')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'สมัครเข้าร่วม' })).not.toBeInTheDocument();
});

test('เช็กว่าสมัครแล้วหรือยังไม่ได้ (token เสีย) หน้ายังแสดงกิจกรรมได้', async () => {
  getMyActivities.mockRejectedValue(new Error('ตั๋วไม่ถูกต้องหรือหมดอายุ'));
  renderDetail();
  expect(await screen.findByRole('heading', { name: 'Workshop React' })).toBeInTheDocument();
  expect(screen.queryByText('โหลดข้อมูลไม่สำเร็จ')).not.toBeInTheDocument();
});

test('ไม่พบกิจกรรม ต้องเห็น error ของหน้า', async () => {
  getActivity.mockRejectedValue(new Error('ไม่พบกิจกรรม'));
  renderDetail({ loggedIn: false });
  expect(await screen.findByText('โหลดข้อมูลไม่สำเร็จ')).toBeInTheDocument();
  expect(screen.getByText('ไม่พบกิจกรรม')).toBeInTheDocument();
});
