import { useState, useEffect, useCallback } from 'react';
import gradeService from '../../services/gradeService';
import counselService from '../../services/counselService';
import type { StudentInfo } from '../../services/gradeService';
import { formatStudentLabel } from '../../types/student';

const CURRENT_YEAR = new Date().getFullYear();
import type { CounselingResponse, CounselCategory } from '../../services/counselService';
import authService from '../../services/authService';
import CounselingForm from './CounselingForm';

const categories: CounselCategory[] = ['HOMEROOM', 'CAREER', 'LIFE', 'PROFESSIONAL', 'OTHER'];

function CounselingPage() {
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CounselCategory | ''>('');
  const [counselings, setCounselings] = useState<CounselingResponse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<CounselingResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const user = authService.getStoredUser();
  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    if (isTeacher) {
      gradeService.getStudents().then(setStudents);
    } else if (user?.roleEntityId) {
      setSelectedStudentId(user.roleEntityId);
    }
  }, []);

  const loadCounselings = useCallback(async () => {
    if (!selectedStudentId) {
      return;
    }
    setLoading(true);
    try {
      const data = await counselService.getCounselingsByStudent(
        selectedStudentId,
        categoryFilter || undefined,
      );
      setCounselings(data);
    } catch {
      setCounselings([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, categoryFilter]);

  useEffect(() => {
    if (selectedStudentId) {
      loadCounselings();
    }
  }, [selectedStudentId, categoryFilter, loadCounselings]);

  const handleCreated = () => {
    setShowForm(false);
    setEditTarget(null);
    loadCounselings();
  };

  const handleEdit = (counseling: CounselingResponse) => {
    setEditTarget(counseling);
    setShowForm(true);
  };

  const handleDelete = async (counselingId: number) => {
    if (!confirm('상담내역을 삭제하시겠습니까?')) {
      return;
    }
    await counselService.deleteCounseling(counselingId);
    loadCounselings();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditTarget(null);
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div>
      <div style={styles.toolbar}>
        <h2 style={styles.title}>상담내역 관리</h2>
        {isTeacher && (
          <button
            onClick={() => (showForm ? handleCancel() : setShowForm(true))}
            style={styles.addButton}
          >
            {showForm ? '취소' : '+ 상담 기록'}
          </button>
        )}
      </div>

      {showForm && (
        <CounselingForm students={students} editTarget={editTarget} onSuccess={handleCreated} />
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

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as CounselCategory | '')}
          style={styles.select}
        >
          <option value="">전체 카테고리</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {counselService.categoryLabels[c]}
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

      {!loading && counselings.length === 0 && selectedStudentId && (
        <p style={styles.empty}>등록된 상담내역이 없습니다.</p>
      )}

      {counselings.map((c) => (
        <div key={c.id} style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.badge}>{counselService.categoryLabels[c.category]}</span>
            <span style={styles.counselDate}>{c.counselDate}</span>
            <span style={styles.teacher}>{c.teacherName}</span>
            {c.isShared && <span style={styles.sharedTag}>공유</span>}
            {isTeacher && c.teacherId === user?.roleEntityId && (
              <div style={styles.actions}>
                <button onClick={() => handleEdit(c)} style={styles.editButton}>
                  수정
                </button>
                <button onClick={() => handleDelete(c.id)} style={styles.deleteButton}>
                  삭제
                </button>
              </div>
            )}
          </div>
          <p style={styles.content}>{c.content}</p>
          {c.nextPlan && (
            <div style={styles.nextPlan}>
              <strong>후속 계획:</strong> {c.nextPlan}
            </div>
          )}
          {c.nextCounselDate && (
            <div style={styles.nextDate}>다음 상담 예정: {c.nextCounselDate}</div>
          )}
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
  counselDate: {
    fontSize: '13px',
    color: '#333',
    fontWeight: 'bold',
  },
  teacher: { fontSize: '13px', color: '#666' },
  sharedTag: {
    padding: '2px 8px',
    backgroundColor: '#fff7e6',
    color: '#fa8c16',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
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
  nextPlan: {
    padding: '8px 12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#555',
    marginBottom: '4px',
  },
  nextDate: {
    fontSize: '12px',
    color: '#4a90d9',
    fontWeight: 'bold',
  },
};

export default CounselingPage;
