import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import { getActivities } from '../api/backend';

// แทนทั้งไฟล์ backend.js ด้วยของปลอม: ทุกฟังก์ชันกลายเป็น jest.fn() ที่เรากำหนดคำตอบได้
jest.mock('../api/backend');

const FAKE = [
  { id: 1, title: 'กีฬาสีคณะ', location: 'สนามกีฬา', startAt: '2026-12-05T01:00:00Z', capacity: 500, registered: 10 },
  { id: 2, title: 'Workshop React', location: 'ห้องแล็บ 1', startAt: '2026-11-25T06:00:00Z', capacity: 30, registered: 30 },
];

function renderHome() {
  return render(<MemoryRouter><Home /></MemoryRouter>);   // มี Link ข้างใน ต้องมี Router ครอบ
}

test('โหลดสำเร็จ ต้องเห็นการ์ดครบ และกิจกรรมที่เต็มต้องบอกว่าเต็ม', async () => {
  getActivities.mockResolvedValue(FAKE);
  renderHome();

  expect(await screen.findByText('กีฬาสีคณะ')).toBeInTheDocument();   // findBy = รอจน useEffect โหลดเสร็จ
  expect(screen.getAllByRole('link')).toHaveLength(2);
  expect(screen.getByText(/30\/30/)).toHaveTextContent('(เต็ม)');
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
