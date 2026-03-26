import { useEffect, useState } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { typeLabels } from '../../services/notificationService';

type Filter = 'ALL' | 'UNREAD' | 'READ';

function NotificationPage() {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } =
    useNotification();
  const [filter, setFilter] = useState<Filter>('ALL');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') {
      return !n.isRead;
    }
    if (filter === 'READ') {
      return n.isRead;
    }
    return true;
  });

  const unreadExists = notifications.some((n) => !n.isRead);

  return (
    <div>
      <div style={styles.toolbar}>
        <h2 style={styles.title}>알림 센터</h2>
        {unreadExists && (
          <button onClick={markAllAsRead} style={styles.readAllButton}>
            모두 읽음 처리
          </button>
        )}
      </div>

      <div style={styles.filterRow}>
        {(['ALL', 'UNREAD', 'READ'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...styles.filterButton,
              ...(filter === f ? styles.filterActive : {}),
            }}
          >
            {{ ALL: '전체', UNREAD: '미읽음', READ: '읽음' }[f]}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p style={styles.empty}>알림이 없습니다.</p>}

      {filtered.map((n) => (
        <div
          key={n.id}
          style={{
            ...styles.card,
            ...(n.isRead ? {} : styles.unreadCard),
          }}
          onClick={() => !n.isRead && markAsRead(n.id)}
        >
          <div style={styles.cardHeader}>
            <span style={styles.typeBadge}>{typeLabels[n.type]}</span>
            <span style={styles.cardTitle}>{n.title}</span>
            <span style={styles.date}>
              {new Date(n.createdAt).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteNotification(n.id);
              }}
              style={styles.deleteButton}
            >
              삭제
            </button>
          </div>
          <p style={styles.message}>{n.message}</p>
          {!n.isRead && <span style={styles.unreadDot} />}
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: { margin: 0 },
  readAllButton: {
    padding: '8px 16px',
    backgroundColor: '#4a90d9',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  filterRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  filterButton: {
    padding: '6px 16px',
    border: '1px solid #ddd',
    borderRadius: '20px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#666',
  },
  filterActive: {
    backgroundColor: '#4a90d9',
    color: '#fff',
    borderColor: '#4a90d9',
  },
  empty: { textAlign: 'center', color: '#999', padding: '40px' },
  card: {
    position: 'relative',
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
    marginBottom: '8px',
    cursor: 'pointer',
  },
  unreadCard: {
    backgroundColor: '#f0f7ff',
    borderColor: '#b8d4f0',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '6px',
  },
  typeBadge: {
    padding: '2px 8px',
    backgroundColor: '#e8f0fe',
    color: '#4a90d9',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  cardTitle: {
    flex: 1,
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: '12px',
    color: '#999',
  },
  deleteButton: {
    padding: '4px 8px',
    backgroundColor: '#ff4d4f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
  },
  message: {
    margin: 0,
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.5',
  },
  unreadDot: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '8px',
    height: '8px',
    backgroundColor: '#4a90d9',
    borderRadius: '50%',
  },
};

export default NotificationPage;
