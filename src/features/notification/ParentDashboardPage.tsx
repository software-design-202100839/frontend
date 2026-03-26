import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import notificationService from '../../services/notificationService';
import type { NotificationResponse } from '../../services/notificationService';
import { typeLabels } from '../../services/notificationService';

function ParentDashboardPage() {
  const user = authService.getStoredUser();
  const [recentNotifications, setRecentNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await notificationService.getAll();
        setRecentNotifications(all.slice(0, 5));
      } catch {
        /* 무시 */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const scoreNotifications = recentNotifications.filter((n) => n.type === 'SCORE_UPDATE');
  const feedbackNotifications = recentNotifications.filter((n) => n.type === 'FEEDBACK_NEW');

  return (
    <div>
      <h2>학부모 대시보드</h2>
      <p>환영합니다, {user?.name}님.</p>

      <div style={styles.cardGrid}>
        <Link to="/notifications" style={styles.card}>
          <h3 style={styles.cardTitle}>알림 센터</h3>
          <p style={styles.cardDesc}>모든 알림 확인</p>
        </Link>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>성적 알림</h3>
          {loading ? (
            <p style={styles.cardDesc}>로딩 중...</p>
          ) : scoreNotifications.length > 0 ? (
            scoreNotifications.map((n) => (
              <div key={n.id} style={styles.notifItem}>
                <span style={styles.notifTitle}>{n.title}</span>
                <span style={styles.notifDate}>
                  {new Date(n.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            ))
          ) : (
            <p style={styles.cardDesc}>최근 성적 알림이 없습니다.</p>
          )}
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>피드백 알림</h3>
          {loading ? (
            <p style={styles.cardDesc}>로딩 중...</p>
          ) : feedbackNotifications.length > 0 ? (
            feedbackNotifications.map((n) => (
              <div key={n.id} style={styles.notifItem}>
                <span style={styles.notifTitle}>{n.title}</span>
                <span style={styles.notifDate}>
                  {new Date(n.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            ))
          ) : (
            <p style={styles.cardDesc}>최근 피드백 알림이 없습니다.</p>
          )}
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>최근 알림</h3>
        {loading && <p style={styles.loading}>로딩 중...</p>}
        {!loading && recentNotifications.length === 0 && (
          <p style={styles.empty}>알림이 없습니다.</p>
        )}
        {recentNotifications.map((n) => (
          <div key={n.id} style={{ ...styles.notifCard, ...(n.isRead ? {} : styles.unread) }}>
            <div style={styles.notifHeader}>
              <span style={styles.typeBadge}>{typeLabels[n.type]}</span>
              <span style={styles.notifCardTitle}>{n.title}</span>
              <span style={styles.notifDate}>
                {new Date(n.createdAt).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p style={styles.notifMessage}>{n.message}</p>
          </div>
        ))}
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
    margin: '0 0 12px',
    fontSize: '16px',
    color: '#333',
  },
  cardDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#999',
  },
  notifItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  notifTitle: {
    fontSize: '13px',
    color: '#333',
  },
  notifDate: {
    fontSize: '11px',
    color: '#999',
  },
  section: {
    marginTop: '32px',
  },
  sectionTitle: {
    fontSize: '18px',
    marginBottom: '12px',
  },
  loading: { color: '#999', textAlign: 'center' },
  empty: { textAlign: 'center', color: '#999', padding: '20px' },
  notifCard: {
    backgroundColor: '#fff',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
    marginBottom: '8px',
  },
  unread: {
    backgroundColor: '#f0f7ff',
    borderColor: '#b8d4f0',
  },
  notifHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '4px',
  },
  typeBadge: {
    padding: '2px 8px',
    backgroundColor: '#e8f0fe',
    color: '#4a90d9',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  notifCardTitle: {
    flex: 1,
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
  notifMessage: {
    margin: 0,
    fontSize: '13px',
    color: '#666',
  },
};

export default ParentDashboardPage;
