import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import MyActivities from './MyActivities';
import { getMyActivities, cancelActivity } from '../api/backend';

jest.mock('../api/backend');

const MINE = [
  { id: 1, title: 'กีฬาสีคณะ', location: 'สนามกีฬา', startAt: '2099-12-05T01:00:00Z', capacity: 500, registered: 10 },
  { id: 2, title: 'Workshop React', location: 'ห้องแล็บ 1', startAt: '2099-11-25T06:00:00Z', capacity: 30, registered: 5 },
];

function renderPage() {
  localStorage.setItem('activities.token', 'fake.token');
  localStorage.setItem('activities.member', JSON.stringify({ id: 1, displayName: 'นักศึกษา', role: 'member' }));
  return render(<AuthProvider><MemoryRouter><MyActivities /></MemoryRouter></AuthProvider>);
}

beforeEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
});

test('แนบ token ไปโหลดกิจกรรมของฉัน และแสดงรายการ', async () => {
  getMyActivities.mockResolvedValue(MINE);
  renderPage();
  expect(await screen.findByText('กีฬาสีคณะ')).toBeInTheDocument();
  expect(screen.getByText('Workshop React')).toBeInTheDocument();
  expect(getMyActivities).toHaveBeenCalledWith('fake.token');
});

test('ยังไม่ได้สมัครอะไร ต้องเห็นข้อความว่าง', async () => {
  getMyActivities.mockResolvedValue([]);
  renderPage();
  expect(await screen.findByText('ยังไม่ได้สมัครกิจกรรมใด')).toBeInTheDocument();
});

test('โหลดไม่สำเร็จ ต้องเห็น error และลองใหม่ได้', async () => {
  const user = userEvent.setup();
  getMyActivities.mockRejectedValueOnce(new Error('เกิดข้อผิดพลาดที่เซิร์ฟเวอร์')).mockResolvedValueOnce(MINE);
  renderPage();

  expect(await screen.findByText('โหลดข้อมูลไม่สำเร็จ')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'ลองใหม่' }));

  expect(await screen.findByText('กีฬาสีคณะ')).toBeInTheDocument();
});

test('ยกเลิก: ต้องยืนยันก่อน แล้วเอารายการออกหลัง server ตอบสำเร็จ', async () => {
  const user = userEvent.setup();
  getMyActivities.mockResolvedValue(MINE);
  cancelActivity.mockResolvedValue(null);
  renderPage();
  await screen.findByText('กีฬาสีคณะ');

  await user.click(screen.getAllByRole('button', { name: 'ยกเลิก' })[0]);     // เปิดกล่องยืนยัน ยังไม่เรียก API
  expect(cancelActivity).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'ยกเลิกการสมัคร' }));   // ยืนยันจริง

  expect(cancelActivity).toHaveBeenCalledWith(1, 'fake.token');
  expect(screen.queryByText('กีฬาสีคณะ')).not.toBeInTheDocument();
  expect(screen.getByText('Workshop React')).toBeInTheDocument();
});

test('ยกเลิกไม่สำเร็จ รายการต้องยังอยู่และเห็นข้อความ error', async () => {
  const user = userEvent.setup();
  getMyActivities.mockResolvedValue(MINE);
  cancelActivity.mockRejectedValue(new Error('คุณยังไม่ได้สมัครกิจกรรมนี้'));
  renderPage();
  await screen.findByText('กีฬาสีคณะ');

  await user.click(screen.getAllByRole('button', { name: 'ยกเลิก' })[0]);
  await user.click(screen.getByRole('button', { name: 'ยกเลิกการสมัคร' }));

  expect(await screen.findByText('คุณยังไม่ได้สมัครกิจกรรมนี้')).toBeInTheDocument();
  expect(screen.getByText('กีฬาสีคณะ')).toBeInTheDocument();
});
