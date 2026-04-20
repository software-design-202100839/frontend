import { Link } from 'react-router-dom';
import authService from '../../services/authService';

function StudentDashboardPage() {
  const user = authService.getStoredUser();
  const enrollment = user?.roleDetail?.currentEnrollment;

  return (
    <div>
      <h2>내 대시보드</h2>
      <p>환영합니다, {user?.name}님.</p>

      {enrollment && (
        <div style={styles.enrollmentBadge}>
          {enrollment.grade}학년 {enrollment.classNum}반 {enrollment.studentNum}번
        </div>
      )}

      <div style={styles.cardGrid}>
        <Link to="/grades" style={styles.card}>
          <h3 style={styles.cardTitle}>내 성적</h3>
          <p style={styles.cardDesc}>과목별 성적 및 등급 조회</p>
        </Link>

        <Link to="/feedbacks" style={styles.card}>
          <h3 style={styles.cardTitle}>내 피드백</h3>
          <p style={styles.cardDesc}>선생님이 남긴 피드백 확인</p>
        </Link>

        <Link to="/notifications" style={styles.card}>
          <h3 style={styles.cardTitle}>알림</h3>
          <p style={styles.cardDesc}>성적 및 피드백 알림 확인</p>
        </Link>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  enrollmentBadge: {
    display: 'inline-block',
    padding: '6px 14px',
    backgroundColor: '#e8f0fe',
    color: '#4a90d9',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
    textDecoration: 'none',
    color: 'inherit',
  },
  cardTitle: {
    margin: '0 0 8px',
    fontSize: '16px',
    color: '#333',
  },
  cardDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#999',
  },
};

export default StudentDashboardPage;
