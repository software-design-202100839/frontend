import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import DashboardPage from './features/auth/DashboardPage';
import GradePage from './features/grade/GradePage';
import StudentRecordPage from './features/student/StudentRecordPage';
import FeedbackPage from './features/feedback/FeedbackPage';
import CounselingPage from './features/counsel/CounselingPage';
import NotificationPage from './features/notification/NotificationPage';
import ParentDashboardPage from './features/notification/ParentDashboardPage';
import PrivateRoute from './routes/PrivateRoute';
import Layout from './components/Layout';
import authService from './services/authService';

function DashboardRouter() {
  const user = authService.getStoredUser();
  if (user?.role === 'PARENT') {
    return <ParentDashboardPage />;
  }
  return <DashboardPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardRouter />} />
          <Route path="grades" element={<GradePage />} />
          <Route path="records" element={<StudentRecordPage />} />
          <Route path="feedbacks" element={<FeedbackPage />} />
          <Route path="counselings" element={<CounselingPage />} />
          <Route path="notifications" element={<NotificationPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
