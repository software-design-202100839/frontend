import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

function DashboardPage() {
  const navigate = useNavigate();
  const user = authService.getStoredUser();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    navigate('/login');
  };

  const roleLabel: Record<string, string> = {
    TEACHER: '교사',
    STUDENT: '학생',
    PARENT: '학부모',
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>SSCM</h1>
        <div style={styles.userInfo}>
          <span>
            {user?.name} ({roleLabel[user?.role || '']})
          </span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            로그아웃
          </button>
        </div>
      </header>
      <main style={styles.main}>
        <h2>대시보드</h2>
        <p>Sprint 1에서 기능이 추가됩니다.</p>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e5e5',
  },
  logo: {
    margin: 0,
    fontSize: '20px',
    color: '#4a90d9',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: '#666',
  },
  logoutButton: {
    padding: '6px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
  },
  main: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
};

export default DashboardPage;
