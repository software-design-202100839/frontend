import { useState } from 'react';
import gradeService from '../../services/gradeService';
import type { StudentInfo, Subject } from '../../services/gradeService';

interface Props {
  students: StudentInfo[];
  subjects: Subject[];
  onSuccess: () => void;
}

function ScoreForm({ students, subjects, onSuccess }: Props) {
  const [studentId, setStudentId] = useState<number | ''>('');
  const [subjectId, setSubjectId] = useState<number | ''>('');
  const [year, setYear] = useState(2026);
  const [semester, setSemester] = useState(1);
  const [score, setScore] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !subjectId || !score) {
      setError('모든 항목을 입력해주세요');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await gradeService.createScore({
        studentId: Number(studentId),
        subjectId: Number(subjectId),
        year,
        semester,
        score: Number(score),
      });
      onSuccess();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || '성적 등록에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.formTitle}>성적 등록</h3>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.row}>
        <select
          value={studentId}
          onChange={(e) => setStudentId(Number(e.target.value) || '')}
          style={styles.input}
        >
          <option value="">학생 선택</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.grade}-{s.classNum}-{s.studentNum} {s.name}
            </option>
          ))}
        </select>

        <select
          value={subjectId}
          onChange={(e) => setSubjectId(Number(e.target.value) || '')}
          style={styles.input}
        >
          <option value="">과목 선택</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

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

        <input
          type="number"
          placeholder="점수 (0~100)"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          min="0"
          max="100"
          step="0.01"
          style={styles.input}
        />
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
  row: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
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
  error: {
    color: '#ff4d4f',
    fontSize: '13px',
    marginBottom: '12px',
  },
};

export default ScoreForm;
