import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RequireRole from './components/RequireRole';
import Home from './pages/Home';
import ActivityDetail from './pages/ActivityDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import MyActivities from './pages/MyActivities';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AdminLayout from './pages/admin/AdminLayout';
import AdminActivities from './pages/admin/AdminActivities';
import AdminActivityForm from './pages/admin/AdminActivityForm';
import AdminParticipants from './pages/admin/AdminParticipants';

function App() {
  return (
    // AuthProvider ครอบทั้งแอป ทุกหน้าข้างในจึงเรียก useAuth() ได้
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Guest */}
            <Route path="/" element={<Home />} />
            <Route path="/activities/:id" element={<ActivityDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Member */}
            <Route path="/me/activities" element={<ProtectedRoute><MyActivities /></ProtectedRoute>} />
            <Route path="/me/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            {/* หลังบ้าน: ครอบทั้งกิ่งด้วย RequireRole ครั้งเดียว หน้าลูกทุกหน้าได้รับการป้องกันหมด */}
            <Route path="/admin" element={<RequireRole role="admin"><AdminLayout /></RequireRole>}>
              <Route index element={<AdminActivities />} />
              <Route path="activities/new" element={<AdminActivityForm />} />
              <Route path="activities/:id" element={<AdminActivityForm />} />
              <Route path="activities/:id/participants" element={<AdminParticipants />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
