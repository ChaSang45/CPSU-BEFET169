import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import { getActivities } from '../api/backend';

// แทนทั้งไฟล์ backend.js ด้วยของปลอม: ทุกฟังก์ชันกลายเป็น jest.fn() ที่เรากำหนดคำตอบได้
jest.mock('../api/backend');

const FAKE = [
  { id: 1, title: 'กีฬาสีคณะ', location: 'สนามกีฬา', startAt: '2099-12-05T01:00:00Z', capacity: 500, registered: 10 },
  { id: 2, title: 'Workshop React', location: 'ห้องแล็บ 1', startAt: '2099-11-25T06:00:00Z', capacity: 30, registered: 30 },
];

function renderHome() {
  return render(<MemoryRouter><Home /></MemoryRouter>);   // มี Link ข้างใน ต้องมี Router ครอบ
}

test('โหลดสำเร็จ ต้องเห็นการ์ดครบ และกิจกรรมที่เต็มต้องบอกว่าเต็ม', async () => {
  getActivities.mockResolvedValue(FAKE);
  renderHome();

  expect(await screen.findByText('กีฬาสีคณะ')).toBeInTheDocument();   // findBy = รอจน useEffect โหลดเสร็จ
  expect(screen.getAllByRole('link')).toHaveLength(2);
  expect(screen.getByText('เต็ม')).toBeInTheDocument();     // ป้ายสถานะของกิจกรรม 30/30
  expect(screen.getByText('เปิดรับสมัคร')).toBeInTheDocument();
});

test('พิมพ์ค้นหา ต้องกรองในเครื่องโดยไม่เรียก backend ซ้ำ', async () => {
  const user = userEvent.setup();
  getActivities.mockResolvedValue(FAKE);
  renderHome();
  await screen.findByText('กีฬาสีคณะ');

  await user.type(screen.getByPlaceholderText(/พิมพ์ชื่อกิจกรรม/), 'react');

  expect(screen.getAllByRole('link')).toHaveLength(1);
  expect(screen.getByText('Workshop React')).toBeInTheDocument();
  expect(getActivities).toHaveBeenCalledTimes(1);
});

test('กิจกรรมเยอะ แสดงทีละ 10 ใบ กด "แสดงเพิ่ม" ถึงเห็นที่เหลือ', async () => {
  const user = userEvent.setup();
  getActivities.mockResolvedValue(
    Array.from({ length: 12 }, (_, i) => ({
      id: i + 1, title: `งานที่ ${i + 1}`, location: 'A',
      startAt: `2099-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`, capacity: 10, registered: 1,
    }))
  );
  renderHome();
  await screen.findByText('งานที่ 1');
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(10);

  await user.click(screen.getByRole('button', { name: /แสดงเพิ่ม \(เหลืออีก 2\)/ }));
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(12);
  expect(screen.queryByRole('button', { name: /แสดงเพิ่ม/ })).not.toBeInTheDocument();
});

test('ค้นหา ต้องกางกลุ่ม "เริ่มไปแล้ว" ให้เห็นผลด้วย', async () => {
  const user = userEvent.setup();
  getActivities.mockResolvedValue([
    { id: 9, title: 'งานเก่า', location: 'A', startAt: '2000-01-01T00:00:00Z', capacity: 10, registered: 1 },
    { id: 8, title: 'งานไกล', location: 'B', startAt: '2099-12-01T00:00:00Z', capacity: 10, registered: 1 },
  ]);
  renderHome();
  await screen.findByText('งานไกล');
  expect(screen.queryByText('งานเก่า')).not.toBeInTheDocument();   // พับไว้ก่อน

  await user.type(screen.getByPlaceholderText(/พิมพ์ชื่อกิจกรรม/), 'เก่า');
  expect(screen.getByText('งานเก่า')).toBeInTheDocument();
});

test('ไม่มีกิจกรรม ต้องเห็นข้อความว่าง', async () => {
  getActivities.mockResolvedValue([]);
  renderHome();
  expect(await screen.findByText(/ไม่พบกิจกรรม/)).toBeInTheDocument();
});

test('backend ล่ม ต้องเห็น error และปุ่มลองใหม่ที่โหลดอีกครั้งได้', async () => {
  const user = userEvent.setup();
  getActivities
    .mockRejectedValueOnce(new Error('server ไม่ได้ตอบเป็น JSON'))
    .mockResolvedValueOnce(FAKE);
  renderHome();

  expect(await screen.findByText('โหลดข้อมูลไม่สำเร็จ')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'ลองใหม่' }));

  expect(await screen.findByText('กีฬาสีคณะ')).toBeInTheDocument();
  expect(getActivities).toHaveBeenCalledTimes(2);
});

test('เรียงกิจกรรมที่ยังไม่เริ่มก่อน และกิจกรรมที่เริ่มไปแล้วไว้ท้าย พร้อมป้าย "เริ่มแล้ว"', async () => {
  getActivities.mockResolvedValue([
    { id: 9, title: 'งานเก่า', location: 'A', startAt: '2000-01-01T00:00:00Z', capacity: 10, registered: 1 },
    { id: 8, title: 'งานไกล', location: 'B', startAt: '2099-12-01T00:00:00Z', capacity: 10, registered: 1 },
    { id: 7, title: 'งานใกล้', location: 'C', startAt: '2099-01-01T00:00:00Z', capacity: 10, registered: 1 },
  ]);
  const user = userEvent.setup();
  renderHome();
  await user.click(await screen.findByRole('button', { name: /ดูกิจกรรมที่เริ่มไปแล้ว \(1\)/ }));   // กลุ่มนี้พับไว้ก่อน
  await screen.findByText('งานเก่า');

  const titles = screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent);
  expect(titles).toEqual(['งานใกล้', 'งานไกล', 'งานเก่า']);
  expect(screen.getByText('เริ่มแล้ว')).toBeInTheDocument();
});
