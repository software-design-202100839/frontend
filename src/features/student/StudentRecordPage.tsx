import { useState, useEffect } from 'react';
import gradeService from '../../services/gradeService';
import studentService from '../../services/studentService';
import type { StudentInfo } from '../../services/gradeService';
import type { StudentRecord, RecordCategory } from '../../services/studentService';
import authService from '../../services/authService';
import RecordForm from './RecordForm';

const categories: RecordCategory[] = [
  'ATTENDANCE',
  'SPECIAL_NOTE',
  'AWARD',
  'VOLUNTEER',
  'OTHER',
];

function StudentRecordPage() {
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [year, setYear] = useState(2026);
  const [semester, setSemester] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<RecordCategory | ''>('');
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = authService.getStoredUser();
  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    gradeService.getStudents().then(setStudents);
  }, []);

  const loadRecords = async () => {
    if (!selectedStudentId) return;
    setLoading(true);
    try {
      const data = await studentService.getStudentRecords(
        selectedStudentId,
        year,
        semester,
        categoryFilter || undefined,
      );
      setRecords(data);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) loadRecords();
  }, [selectedStudentId, year, semester, categoryFilter]);

  const handleCreated = () => {
    setShowForm(false);
    loadRecords();
  };

  const handleDelete = async (recordId: number) => {
    if (!confirm('학생부 항목을 삭제하시겠습니까?')) return;
    await studentService.deleteRecord(recordId);
    loadRecords();
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div>
      <div style={styles.toolbar}>
        <h2 style={styles.title}>학생부 관리</h2>
        {isTeacher && (
          <button onClick={() => setShowForm(!showForm)} style={styles.addButton}>
            {showForm ? '취소' : '+ 항목 등록'}
          </button>
        )}
      </div>

      {showForm && selectedStudentId && (
        <RecordForm studentId={selectedStudentId} onSuccess={handleCreated} />
      )}

      <div style={styles.filterRow}>
        <select
          value={selectedStudentId ?? ''}
          onChange={(e) => setSelectedStudentId(Number(e.target.value) || null)}
          style={styles.select}
        >
          <option value="">학생 선택</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.grade}학년 {s.classNum}반 {s.studentNum}번 {s.name}
            </option>
          ))}
        </select>

        <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={styles.select}>
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>

        <select
          value={semester}
          onChange={(e) => setSemester(Number(e.target.value))}
          style={styles.select}
        >
          <option value={1}>1학기</option>
          <option value={2}>2학기</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as RecordCategory | '')}
          style={styles.select}
        >
          <option value="">전체 카테고리</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {studentService.categoryLabels[c]}
            </option>
          ))}
        </select>
      </div>

      {selectedStudent && (
        <div style={styles.studentInfo}>
          <strong>{selectedStudent.name}</strong> |{' '}
          {selectedStudent.grade}학년 {selectedStudent.classNum}반{' '}
          {selectedStudent.studentNum}번
        </div>
      )}

      {loading && <p style={styles.loading}>로딩 중...</p>}

      {!loading && records.length === 0 && selectedStudentId && (
        <p style={styles.empty}>등록된 학생부 항목이 없습니다.</p>
      )}

      {records.map((record) => (
        <div key={record.id} style={styles.recordCard}>
          <div style={styles.recordHeader}>
            <span style={styles.badge}>
              {studentService.categoryLabels[record.category]}
            </span>
            <span style={styles.date}>
              {new Date(record.updatedAt).toLocaleDateString('ko-KR')}
            </span>
            {isTeacher && (
              <button onClick={() => handleDelete(record.id)} style={styles.deleteButton}>
                삭제
              </button>
            )}
          </div>
          <pre style={styles.content}>{JSON.stringify(record.content, null, 2)}</pre>
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
  recordCard: {
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
    marginBottom: '12px',
  },
  recordHeader: {
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
  date: { fontSize: '12px', color: '#999' },
  deleteButton: {
    marginLeft: 'auto',
    padding: '4px 8px',
    backgroundColor: '#ff4d4f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  content: {
    margin: 0,
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    fontSize: '13px',
    whiteSpace: 'pre-wrap',
    overflow: 'auto',
  },
};

export default StudentRecordPage;
