import { apiFetch, joinActivity } from './backend';

// ตัวช่วยสร้าง "คำตอบปลอม" ของ fetch: ใส่แค่ status กับ body ที่อยากให้ server ตอบ
function fakeResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  };
}

beforeEach(() => {
  global.fetch = jest.fn();   // แทน fetch จริงด้วยของปลอมที่เราควบคุมคำตอบได้
});

test('GET ธรรมดา: ไม่มี body ไม่มี Authorization', async () => {
  fetch.mockResolvedValue(fakeResponse(200, { items: [{ id: 1 }] }));

  const data = await apiFetch('/api/activities');

  expect(data).toEqual({ items: [{ id: 1 }] });
  const [url, options] = fetch.mock.calls[0];
  expect(url).toBe('/api/activities');
  expect(options.method).toBe('GET');
  expect(options.body).toBeUndefined();
  expect(options.headers.Authorization).toBeUndefined();
});

test('สมัครกิจกรรม: PUT พร้อมแนบ token แบบ Bearer และ 204 ได้ null', async () => {
  fetch.mockResolvedValue(fakeResponse(204, null));

  const data = await joinActivity(5, 'abc123');

  expect(data).toBeNull();
  const [url, options] = fetch.mock.calls[0];
  expect(url).toBe('/api/me/activities/5');
  expect(options.method).toBe('PUT');
  expect(options.headers.Authorization).toBe('Bearer abc123');
});

test('server ตอบ 409 ต้อง throw พร้อมข้อความและ status', async () => {
  fetch.mockResolvedValue(fakeResponse(409, { error: 'กิจกรรมเต็มแล้ว' }));

  await expect(joinActivity(5, 'abc123')).rejects.toMatchObject({
    message: 'กิจกรรมเต็มแล้ว',
    status: 409,
  });
});
