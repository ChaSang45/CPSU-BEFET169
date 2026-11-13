import { apiFetch, joinActivity, getMyActivities, login, setUnauthorizedHandler } from './backend';

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

test('401 ทั้งที่แนบ token ต้องเรียก handler ล้าง login ด้วย', async () => {
  const handler = jest.fn();
  setUnauthorizedHandler(handler);
  fetch.mockResolvedValue(fakeResponse(401, { error: 'ตั๋วไม่ถูกต้องหรือหมดอายุ' }));

  await expect(getMyActivities('old.token')).rejects.toMatchObject({ status: 401 });

  expect(handler).toHaveBeenCalledTimes(1);
  setUnauthorizedHandler(null);
});

test('401 ตอน login ผิด (ไม่มี token) ต้องไม่เรียก handler', async () => {
  const handler = jest.fn();
  setUnauthorizedHandler(handler);
  fetch.mockResolvedValue(fakeResponse(401, { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }));

  await expect(login('a@b.com', 'wrong')).rejects.toMatchObject({ status: 401 });

  expect(handler).not.toHaveBeenCalled();
  setUnauthorizedHandler(null);
});
