import { useState, useEffect, useCallback } from 'react';
import gradeService from '../../services/gradeService';
import studentService from '../../services/studentService';
import type { StudentInfo } from '../../services/gradeService';
import type { Subject } from '../../services/gradeService';
import { formatStudentLabel } from '../../types/student';
import type {
  StudentRecord,
  RecordType,
  BasicCategory,
  SpecialCategory,
  RecordCategory,
} from '../../services/studentService';
import authService from '../../services/authService';
import RecordForm from './RecordForm';

const basicCategories: BasicCategory[] = ['ATTENDANCE', 'GENERAL_OPINION', 'AWARD', 'VOLUNTEER'];
const specialCategories: SpecialCategory[] = ['SPECIAL_NOTE'];

function StudentRecordPage() {
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [year, setYear] = useState(2026);
  const [semester, setSemester] = useState(1);
  const [recordType, setRecordType] = useState<RecordType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<RecordCategory | ''>('');
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = authService.getStoredUser();
  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    if (isTeacher) {
      gradeService.getStudents().then(setStudents);
      gradeService.getSubjects().then(setSubjects);
    } else if (user?.roleEntityId) {
      setSelectedStudentId(user.roleEntityId);
    }
  }, []);

  const availableCategories: RecordCategory[] =
    recordType === 'BASIC'
      ? basicCategories
      : recordType === 'SPECIAL'
        ? specialCategories
        : [...basicCategories, ...specialCategories];

  const loadRecords = useCallback(async () => {
    if (!selectedStudentId) {
      return;
    }
    setLoading(true);
    try {
      const data = await studentService.getStudentRecords(
        selectedStudentId,
        year,
        semester,
        categoryFilter || undefined,
        recordType || undefined,
      );
      setRecords(data);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, year, semester, categoryFilter, recordType]);

  useEffect(() => {
    if (selectedStudentId) {
      loadRecords();
    }
  }, [selectedStudentId, year, semester, categoryFilter, recordType, loadRecords]);

  const handleCreated = () => {
    setShowForm(false);
    loadRecords();
  };

  const handleDelete = async (recordId: number) => {
    if (!confirm('학생부 항목을 삭제하시겠습니까?')) {
      return;
    }
    await studentService.deleteRecord(recordId);
    loadRecords();
  };

  const handleRecordTypeChange = (newType: RecordType | '') => {
    setRecordType(newType);
    setCategoryFilter('');
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
        <RecordForm studentId={selectedStudentId} subjects={subjects} onSuccess={handleCreated} />
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
                {formatStudentLabel(s, year)}
              </option>
            ))}
          </select>
        )}

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          style={styles.select}
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}년
            </option>
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
          value={recordType}
          onChange={(e) => handleRecordTypeChange(e.target.value as RecordType | '')}
          style={styles.select}
        >
          <option value="">전체 구분</option>
          <option value="BASIC">담임</option>
          <option value="SPECIAL">교과</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as RecordCategory | '')}
          style={styles.select}
        >
          <option value="">전체 카테고리</option>
          {availableCategories.map((c) => (
            <option key={c} value={c}>
              {studentService.categoryLabels[c]}
            </option>
          ))}
        </select>
      </div>

      {selectedStudent && (
        <div style={styles.studentInfo}>
          <strong>{formatStudentLabel(selectedStudent, year)}</strong>
        </div>
      )}

      {loading && <p style={styles.loading}>로딩 중...</p>}

      {!loading && records.length === 0 && selectedStudentId && (
        <p style={styles.empty}>등록된 학생부 항목이 없습니다.</p>
      )}

      {records.map((record) => (
        <div key={record.id} style={styles.recordCard}>
          <div style={styles.recordHeader}>
            <span style={record.recordType === 'BASIC' ? styles.basicBadge : styles.specialBadge}>
              {studentService.recordTypeLabels[record.recordType]}
            </span>
            <span style={styles.badge}>{studentService.categoryLabels[record.category]}</span>
            {record.subjectName && <span style={styles.subject}>{record.subjectName}</span>}
            <span style={styles.date}>
              {new Date(record.updatedAt).toLocaleDateString('ko-KR')}
            </span>
            <div style={styles.visibilityTags}>
              <span style={record.isVisibleToStudent ? styles.visibleTag : styles.hiddenTag}>
                학생 {record.isVisibleToStudent ? '공개' : '비공개'}
              </span>
              <span style={record.isVisibleToParent ? styles.visibleTag : styles.hiddenTag}>
                학부모 {record.isVisibleToParent ? '공개' : '비공개'}
              </span>
            </div>
            {isTeacher && (
              <button
                onClick={() => handleDelete(record.id)}
                style={styles.deleteButton}
              >
                삭제
              </button>
            )}
          </div>
          <p style={styles.content}>
            {typeof record.content.text === 'string'
              ? record.content.text
              : JSON.stringify(record.content, null, 2)}
          </p>
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
    gap: '8px',
    marginBottom: '8px',
    flexWrap: 'wrap' as const,
  },
  basicBadge: {
    padding: '2px 8px',
    backgroundColor: '#e6f7e6',
    color: '#52c41a',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  specialBadge: {
    padding: '2px 8px',
    backgroundColor: '#fff7e6',
    color: '#fa8c16',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  badge: {
    padding: '2px 8px',
    backgroundColor: '#e8f0fe',
    color: '#4a90d9',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  subject: { fontSize: '12px', color: '#555' },
  date: { fontSize: '12px', color: '#999' },
  visibilityTags: { display: 'flex', gap: '4px' },
  visibleTag: {
    padding: '2px 6px',
    backgroundColor: '#e6f7e6',
    color: '#52c41a',
    borderRadius: '4px',
    fontSize: '11px',
  },
  hiddenTag: {
    padding: '2px 6px',
    backgroundColor: '#f5f5f5',
    color: '#999',
    borderRadius: '4px',
    fontSize: '11px',
  },
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
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#333',
    whiteSpace: 'pre-wrap',
  },
};

export default StudentRecordPage;
