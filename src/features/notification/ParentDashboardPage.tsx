import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import notificationService from '../../services/notificationService';
import type { NotificationResponse } from '../../services/notificationService';
import { typeLabels } from '../../services/notificationService';

function ParentDashboardPage() {
  const user = authService.getStoredUser();
  const children = user?.children ?? [];
  const [selectedChildId, setSelectedChildId] = useState<number | null>(
    children.length > 0 ? children[0].id : null
  );
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

  const selectedChild = children.find(c => c.id === selectedChildId);
  const scoreNotifications = recentNotifications.filter((n) => n.type === 'SCORE_UPDATE');
  const feedbackNotifications = recentNotifications.filter((n) => n.type === 'FEEDBACK_NEW');

  return (
    <div>
      <h2>학부모 대시보드</h2>
      <p>환영합니다, {user?.name}님.</p>

      {/* 자녀 선택 드롭다운 */}
      {children.length > 0 ? (
        <div style={styles.childSelector}>
          <label style={styles.childLabel}>자녀 선택</label>
          <select
            style={styles.childSelect}
            value={selectedChildId ?? ''}
            onChange={e => setSelectedChildId(Number(e.target.value))}
          >
            {children.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      ) : (
        <div style={styles.noChildBanner}>
          등록된 자녀가 없습니다. 관리자에게 자녀 연결을 요청하세요.
        </div>
      )}

      {/* 자녀별 바로가기 */}
      {selectedChild && (
        <div style={styles.cardGrid}>
          <Link
            to={`/grades?studentId=${selectedChildId}`}
            style={styles.card}
          >
            <h3 style={styles.cardTitle}>📊 {selectedChild.name} 성적</h3>
            <p style={styles.cardDesc}>과목별 성적 및 등급 조회</p>
          </Link>

          <Link
            to={`/feedbacks?studentId=${selectedChildId}`}
            style={styles.card}
          >
            <h3 style={styles.cardTitle}>💬 {selectedChild.name} 피드백</h3>
            <p style={styles.cardDesc}>선생님이 남긴 피드백 확인</p>
          </Link>

          <Link to="/notifications" style={styles.card}>
            <h3 style={styles.cardTitle}>🔔 알림 센터</h3>
            <p style={styles.cardDesc}>모든 알림 확인</p>
          </Link>
        </div>
      )}

      {/* 최근 알림 요약 */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>최근 알림</h3>

        {children.length > 0 && (
          <div style={styles.notifRow}>
            <div style={styles.notifCol}>
              <h4 style={styles.notifColTitle}>성적 알림</h4>
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

            <div style={styles.notifCol}>
              <h4 style={styles.notifColTitle}>피드백 알림</h4>
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
        )}

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
  childSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    padding: '12px 16px',
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    border: '1px solid #b8d4f0',
  },
  childLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: '#333',
    whiteSpace: 'nowrap',
  },
  childSelect: {
    padding: '6px 12px',
    border: '1px solid #b8d4f0',
    borderRadius: 4,
    fontSize: 14,
    backgroundColor: '#fff',
    minWidth: 160,
  },
  noChildBanner: {
    padding: '12px 16px',
    backgroundColor: '#fff3e0',
    border: '1px solid #ffcc80',
    borderRadius: 8,
    fontSize: 14,
    color: '#e65100',
    marginBottom: 20,
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 16,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    border: '1px solid #e5e5e5',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  },
  cardTitle: {
    margin: '0 0 8px',
    fontSize: 15,
    color: '#333',
  },
  cardDesc: {
    margin: 0,
    fontSize: 13,
    color: '#999',
  },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 17, marginBottom: 16 },
  notifRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 24,
  },
  notifCol: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    border: '1px solid #e5e5e5',
  },
  notifColTitle: {
    margin: '0 0 12px',
    fontSize: 14,
    fontWeight: 600,
    color: '#444',
  },
  notifItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  notifTitle: { fontSize: 13, color: '#333' },
  notifDate: { fontSize: 11, color: '#999' },
  loading: { color: '#999', textAlign: 'center' },
  empty: { textAlign: 'center', color: '#999', padding: 20 },
  notifCard: {
    backgroundColor: '#fff',
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid #e5e5e5',
    marginBottom: 8,
  },
  unread: {
    backgroundColor: '#f0f7ff',
    borderColor: '#b8d4f0',
  },
  notifHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  typeBadge: {
    padding: '2px 8px',
    backgroundColor: '#e8f0fe',
    color: '#4a90d9',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 'bold',
  },
  notifCardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  notifMessage: {
    margin: 0,
    fontSize: 13,
    color: '#666',
  },
};

export default ParentDashboardPage;
