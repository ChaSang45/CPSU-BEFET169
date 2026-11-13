// เจ้าของ: ChaSang45
import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../api/backend';

// Context = "กล่องกลาง" ที่ component ไหนในแอปก็เอื้อมมาหยิบได้ ไม่ต้องส่ง props ต่อกันเป็นทอด ๆ
// ใส่สถานะ login ไว้ในนี้ เพราะ Navbar, ActivityDetail, MyActivities, หลังบ้าน ต้องรู้เหมือนกันหมดว่าใครล็อกอินอยู่
const AuthContext = createContext(null);

const TOKEN_KEY = 'activities.token';
const MEMBER_KEY = 'activities.member';

function clearStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(MEMBER_KEY);
}

export function AuthProvider({ children }) {
  // อ่านค่าเดิมจาก localStorage จะได้ไม่หลุด login ตอน refresh
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [member, setMember] = useState(() => JSON.parse(localStorage.getItem(MEMBER_KEY) || 'null'));
  const [sessionExpired, setSessionExpired] = useState(false);   // true = ถูกเด้งออกเพราะตั๋วใช้ไม่ได้ (หน้า Login ใช้โชว์ข้อความ)

  // server ตอบ 401 ทั้งที่แนบตั๋ว (ตั๋วหมดอายุ/ถูกแก้) → ล้าง login ทันที
  // ProtectedRoute จะเห็นว่าไม่ได้ login แล้วพาไปหน้า Login เอง ส่วนหน้าสาธารณะก็โหลดใหม่แบบ Guest
  useEffect(() => {
    api.setUnauthorizedHandler(() => {
      setToken(null);
      setMember(null);
      clearStorage();
      setSessionExpired(true);
    });
    return () => api.setUnauthorizedHandler(null);
  }, []);

  function remember({ token, member }) {
    setToken(token);
    setMember(member);
    setSessionExpired(false);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(MEMBER_KEY, JSON.stringify(member));
  }

  async function login(email, password) {
    const data = await api.login(email, password);   // ถ้าผิด backend.js จะ throw
    remember(data);
  }

  async function register(email, password, displayName) {
    await api.register(email, password, displayName);
    await login(email, password);                    // สมัครเสร็จล็อกอินให้เลย
  }

  // แก้โปรไฟล์สำเร็จ → เก็บ member ใหม่ที่ server ส่งกลับมา (Navbar จะเปลี่ยนชื่อตาม)
  function updateMember(newMember) {
    setMember(newMember);
    localStorage.setItem(MEMBER_KEY, JSON.stringify(newMember));
  }

  function logout() {
    setToken(null);
    setMember(null);
    setSessionExpired(false);
    clearStorage();
  }

  // isAdmin ใช้แค่ "โชว์/ซ่อน" เมนูและหน้า
  // การป้องกันจริงอยู่ที่ Go: ต่อให้แก้ localStorage ให้ role เป็น admin ก็ยิง /api/admin ไม่ผ่านอยู่ดี (403)
  const isAdmin = member?.role === 'admin';
  const value = {
    token, member, isLoggedIn: Boolean(token), isAdmin, sessionExpired,
    login, register, logout, updateMember,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// hook สั้น ๆ ให้ทุกหน้าเรียก useAuth() แทนที่จะต้อง import Context เอง
export function useAuth() {
  return useContext(AuthContext);
}
