import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import gradeService from '../../services/gradeService';

function DashboardPage() {
  const user = authService.getStoredUser();
  const isTeacher = user?.role === 'TEACHER';
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    if (isTeacher) {
      gradeService.getStudents().then((s) => setStudentCount(s.length));
    }
  }, [isTeacher]);

  return (
    <div>
      <h2>대시보드</h2>
      <p>환영합니다, {user?.name}님.</p>

      <div style={styles.cardGrid}>
        <Link to="/grades" style={styles.card}>
          <h3 style={styles.cardTitle}>성적 관리</h3>
          <p style={styles.cardDesc}>학생별 과목 성적 조회 및 관리</p>
        </Link>

        {isTeacher && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>등록 학생</h3>
            <p style={styles.cardValue}>{studentCount}명</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '16px',
    marginTop: '20px',
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
  cardValue: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#4a90d9',
  },
};

export default DashboardPage;
