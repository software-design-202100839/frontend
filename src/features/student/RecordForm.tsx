import { useState } from 'react';
import studentService from '../../services/studentService';
import type { RecordCategory } from '../../services/studentService';

interface Props {
  studentId: number;
  onSuccess: () => void;
}

const categories: { value: RecordCategory; label: string }[] = [
  { value: 'ATTENDANCE', label: '출결' },
  { value: 'SPECIAL_NOTE', label: '특기사항' },
  { value: 'AWARD', label: '수상' },
  { value: 'VOLUNTEER', label: '봉사활동' },
  { value: 'OTHER', label: '기타' },
];

function RecordForm({ studentId, onSuccess }: Props) {
  const [year, setYear] = useState(2026);
  const [semester, setSemester] = useState(1);
  const [category, setCategory] = useState<RecordCategory>('SPECIAL_NOTE');
  const [contentText, setContentText] = useState('{\n  "content": ""\n}');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(contentText);
    } catch {
      setError('JSON 형식이 올바르지 않습니다');
      return;
    }

    setSubmitting(true);
    try {
      await studentService.createRecord({
        studentId,
        year,
        semester,
        category,
        content: parsed,
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
            <option key={y} value={y}>{y}년</option>
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

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as RecordCategory)}
          style={styles.input}
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={contentText}
        onChange={(e) => setContentText(e.target.value)}
        rows={6}
        style={styles.textarea}
        placeholder='JSON 형식으로 입력 (예: {"content": "수학 경시대회 참여"})'
      />

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
    fontSize: '13px',
    fontFamily: 'monospace',
    marginBottom: '12px',
    boxSizing: 'border-box',
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
