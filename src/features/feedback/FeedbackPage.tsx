import { useState, useEffect, useCallback } from 'react';
import gradeService from '../../services/gradeService';
import feedbackService from '../../services/feedbackService';
import type { StudentInfo } from '../../services/gradeService';
import { formatStudentLabel } from '../../types/student';

const CURRENT_YEAR = new Date().getFullYear();
import type { FeedbackResponse, FeedbackCategory } from '../../services/feedbackService';
import authService from '../../services/authService';
import FeedbackForm from './FeedbackForm';

const categories: FeedbackCategory[] = [
  'ACADEMIC',
  'BEHAVIOR',
  'ATTENDANCE',
  'ATTITUDE',
  'GENERAL',
];

function FeedbackPage() {
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | ''>('');
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<FeedbackResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const user = authService.getStoredUser();
  const isTeacher = user?.role === 'TEACHER';

  const isParent = user?.role === 'PARENT';
  const children = user?.roleDetail?.children ?? [];

  useEffect(() => {
    if (isTeacher) {
      gradeService.getStudents().then(setStudents);
    } else if (user?.role === 'STUDENT' && user?.roleEntityId) {
      setSelectedStudentId(user.roleEntityId);
    } else if (isParent && children.length > 0) {
      setSelectedStudentId(children[0].id);
    }
  }, []);

  const loadFeedbacks = useCallback(async () => {
    if (!selectedStudentId) {
      return;
    }
    setLoading(true);
    try {
      const data = await feedbackService.getFeedbacksByStudent(
        selectedStudentId,
        categoryFilter || undefined,
      );
      setFeedbacks(data);
    } catch {
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, categoryFilter]);

  useEffect(() => {
    if (selectedStudentId) {
      loadFeedbacks();
    }
  }, [selectedStudentId, categoryFilter, loadFeedbacks]);

  const handleCreated = () => {
    setShowForm(false);
    setEditTarget(null);
    loadFeedbacks();
  };

  const handleEdit = (feedback: FeedbackResponse) => {
    setEditTarget(feedback);
    setShowForm(true);
  };

  const handleDelete = async (feedbackId: number) => {
    if (!confirm('피드백을 삭제하시겠습니까?')) {
      return;
    }
    await feedbackService.deleteFeedback(feedbackId);
    loadFeedbacks();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditTarget(null);
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div>
      <div style={styles.toolbar}>
        <h2 style={styles.title}>피드백 관리</h2>
        {isTeacher && (
          <button
            onClick={() => (showForm ? handleCancel() : setShowForm(true))}
            style={styles.addButton}
          >
            {showForm ? '취소' : '+ 피드백 작성'}
          </button>
        )}
      </div>

      {showForm && (
        <FeedbackForm students={students} editTarget={editTarget} onSuccess={handleCreated} />
      )}

      <div style={styles.filterRow}>
        {isTeacher && (
          <select
            value={selectedStudentId ?? ''}
            onChange={(e) => setSelectedStudentId(Number(e.target.value) || null)}
            style={styles.select}
          >
            <option value="">학생 선택</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {formatStudentLabel(s, CURRENT_YEAR)}
              </option>
            ))}
          </select>
        )}

        {isParent && children.length > 1 && (
          <select
            value={selectedStudentId ?? ''}
            onChange={(e) => setSelectedStudentId(Number(e.target.value) || null)}
            style={styles.select}
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as FeedbackCategory | '')}
          style={styles.select}
        >
          <option value="">전체 카테고리</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {feedbackService.categoryLabels[c]}
            </option>
          ))}
        </select>
      </div>

      {selectedStudent && (
        <div style={styles.studentInfo}>
          <strong>{formatStudentLabel(selectedStudent, CURRENT_YEAR)}</strong>
        </div>
      )}

      {loading && <p style={styles.loading}>로딩 중...</p>}

      {!loading && feedbacks.length === 0 && selectedStudentId && (
        <p style={styles.empty}>등록된 피드백이 없습니다.</p>
      )}

      {feedbacks.map((fb) => (
        <div key={fb.id} style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.badge}>{feedbackService.categoryLabels[fb.category]}</span>
            <span style={styles.teacher}>{fb.teacherName}</span>
            <span style={styles.date}>{new Date(fb.updatedAt).toLocaleDateString('ko-KR')}</span>
            {isTeacher && (
              <div style={styles.actions}>
                <button onClick={() => handleEdit(fb)} style={styles.editButton}>
                  수정
                </button>
                <button onClick={() => handleDelete(fb.id)} style={styles.deleteButton}>
                  삭제
                </button>
              </div>
            )}
          </div>
          <p style={styles.content}>{fb.content}</p>
          <div style={styles.visibility}>
            <span style={fb.isVisibleToStudent ? styles.visibleTag : styles.hiddenTag}>
              학생 {fb.isVisibleToStudent ? '공개' : '비공개'}
            </span>
            <span style={fb.isVisibleToParent ? styles.visibleTag : styles.hiddenTag}>
              학부모 {fb.isVisibleToParent ? '공개' : '비공개'}
            </span>
          </div>
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
  addButton: {
    padding: '8px 16px',
    backgroundColor: '#4a90d9',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  filterRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap' as const,
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  studentInfo: {
    padding: '12px 16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  loading: { color: '#999', textAlign: 'center' },
  empty: { textAlign: 'center', color: '#999', padding: '40px' },
  card: {
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
    marginBottom: '12px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  badge: {
    padding: '2px 8px',
    backgroundColor: '#e8f0fe',
    color: '#4a90d9',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  teacher: { fontSize: '13px', color: '#666' },
  date: { fontSize: '12px', color: '#999' },
  actions: {
    marginLeft: 'auto',
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    padding: '4px 8px',
    backgroundColor: '#fff',
    color: '#4a90d9',
    border: '1px solid #4a90d9',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  deleteButton: {
    padding: '4px 8px',
    backgroundColor: '#ff4d4f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  content: {
    margin: '0 0 8px',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#333',
  },
  visibility: {
    display: 'flex',
    gap: '8px',
  },
  visibleTag: {
    padding: '2px 8px',
    backgroundColor: '#e6f7e6',
    color: '#52c41a',
    borderRadius: '4px',
    fontSize: '11px',
  },
  hiddenTag: {
    padding: '2px 8px',
    backgroundColor: '#f5f5f5',
    color: '#999',
    borderRadius: '4px',
    fontSize: '11px',
  },
};

export default FeedbackPage;
