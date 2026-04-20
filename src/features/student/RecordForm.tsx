import { useState } from 'react';
import studentService from '../../services/studentService';
import type { RecordType, BasicCategory } from '../../services/studentService';
import type { Subject } from '../../services/gradeService';
import authService from '../../services/authService';

interface Props {
  studentId: number;
  subjects: Subject[];
  onSuccess: () => void;
}

const basicCategories: { value: BasicCategory; label: string }[] = [
  { value: 'ATTENDANCE', label: '출결' },
  { value: 'GENERAL_OPINION', label: '종합의견' },
  { value: 'AWARD', label: '수상' },
  { value: 'VOLUNTEER', label: '봉사활동' },
];

function RecordForm({ studentId, subjects, onSuccess }: Props) {
  const user = authService.getStoredUser();
  const isHomeroom = user?.roleDetail?.currentClass?.isHomeroom ?? false;

  const [year, setYear] = useState(2026);
  const [semester, setSemester] = useState(1);
  const [recordType, setRecordType] = useState<RecordType>(isHomeroom ? 'BASIC' : 'SPECIAL');
  const [basicCategory, setBasicCategory] = useState<BasicCategory>('ATTENDANCE');
  const [subjectId, setSubjectId] = useState<number | ''>(subjects[0]?.id ?? '');
  const [content, setContent] = useState('');
  const [isVisibleToStudent, setIsVisibleToStudent] = useState(false);
  const [isVisibleToParent, setIsVisibleToParent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (recordType === 'SPECIAL' && !subjectId) {
      setError('과목을 선택해주세요');
      return;
    }
    if (!content.trim()) {
      setError('내용을 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      await studentService.createRecord({
        studentId,
        year,
        semester,
        recordType,
        category: recordType === 'BASIC' ? basicCategory : 'SPECIAL_NOTE',
        subjectId: recordType === 'SPECIAL' ? Number(subjectId) : undefined,
        content: { text: content.trim() },
        isVisibleToStudent,
        isVisibleToParent,
      });
      onSuccess();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || '등록에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.formTitle}>학생부 항목 등록</h3>
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.row}>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={styles.input}>
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}년
            </option>
          ))}
        </select>

        <select
          value={semester}
          onChange={(e) => setSemester(Number(e.target.value))}
          style={styles.input}
        >
          <option value={1}>1학기</option>
          <option value={2}>2학기</option>
        </select>
      </div>

      <div style={styles.typeRow}>
        <span style={styles.typeLabel}>구분</span>
        <label style={styles.radioLabel}>
          <input
            type="radio"
            value="BASIC"
            checked={recordType === 'BASIC'}
            onChange={() => setRecordType('BASIC')}
            disabled={!isHomeroom}
          />
          담임 항목
          {!isHomeroom && <span style={styles.disabledNote}> (담임만 입력 가능)</span>}
        </label>
        <label style={styles.radioLabel}>
          <input
            type="radio"
            value="SPECIAL"
            checked={recordType === 'SPECIAL'}
            onChange={() => setRecordType('SPECIAL')}
          />
          교과 특기사항
        </label>
      </div>

      {recordType === 'BASIC' && (
        <select
          value={basicCategory}
          onChange={(e) => setBasicCategory(e.target.value as BasicCategory)}
          style={{ ...styles.input, marginBottom: '12px' }}
        >
          {basicCategories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      )}

      {recordType === 'SPECIAL' && (
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(Number(e.target.value) || '')}
          style={{ ...styles.input, marginBottom: '12px' }}
        >
          <option value="">과목 선택</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        style={styles.textarea}
        placeholder="내용을 입력하세요"
      />

      <div style={styles.checkboxRow}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isVisibleToStudent}
            onChange={(e) => setIsVisibleToStudent(e.target.checked)}
          />
          학생에게 공개
        </label>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isVisibleToParent}
            onChange={(e) => setIsVisibleToParent(e.target.checked)}
          />
          학부모에게 공개
        </label>
      </div>

      <button type="submit" disabled={submitting} style={styles.submitButton}>
        {submitting ? '등록 중...' : '등록'}
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
    marginBottom: '20px',
  },
  formTitle: { margin: '0 0 16px' },
  row: { display: 'flex', gap: '12px', marginBottom: '12px' },
  typeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '12px',
  },
  typeLabel: { fontSize: '14px', color: '#333', fontWeight: 'bold' },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: '#333',
    cursor: 'pointer',
  },
  disabledNote: { fontSize: '11px', color: '#999' },
  input: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    marginBottom: '12px',
    boxSizing: 'border-box',
  },
  checkboxRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '16px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: '#333',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '10px 24px',
    backgroundColor: '#4a90d9',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  error: { color: '#ff4d4f', fontSize: '13px', marginBottom: '12px' },
};

export default RecordForm;
