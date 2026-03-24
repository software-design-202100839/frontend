import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
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

  const navItems = [
    { path: '/', label: '대시보드' },
    { path: '/grades', label: '성적 관리' },
    { path: '/records', label: '학생부' },
    { path: '/feedbacks', label: '피드백' },
    { path: '/counselings', label: '상담내역' },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.logo}>SSCM</h1>
          <nav style={styles.nav}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.navLink,
                  ...(location.pathname === item.path ? styles.navLinkActive : {}),
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
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
        <Outlet />
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
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  logo: {
    margin: 0,
    fontSize: '20px',
    color: '#4a90d9',
  },
  nav: {
    display: 'flex',
    gap: '4px',
  },
  navLink: {
    padding: '6px 12px',
    borderRadius: '4px',
    textDecoration: 'none',
    color: '#666',
    fontSize: '14px',
  },
  navLinkActive: {
    backgroundColor: '#e8f0fe',
    color: '#4a90d9',
    fontWeight: 'bold',
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

export default Layout;
