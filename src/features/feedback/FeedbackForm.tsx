import { useState } from 'react';
import feedbackService from '../../services/feedbackService';
import type { FeedbackCategory, FeedbackResponse } from '../../services/feedbackService';
import type { StudentInfo } from '../../services/gradeService';
import { formatStudentLabel } from '../../types/student';

const CURRENT_YEAR = new Date().getFullYear();

interface Props {
  students: StudentInfo[];
  editTarget?: FeedbackResponse | null;
  onSuccess: () => void;
}

const categories: { value: FeedbackCategory; label: string }[] = [
  { value: 'ACADEMIC', label: '학업' },
  { value: 'BEHAVIOR', label: '행동' },
  { value: 'ATTENDANCE', label: '출석' },
  { value: 'ATTITUDE', label: '태도' },
  { value: 'GENERAL', label: '일반' },
];

function FeedbackForm({ students, editTarget, onSuccess }: Props) {
  const [studentId, setStudentId] = useState<number | ''>(editTarget?.studentId ?? '');
  const [category, setCategory] = useState<FeedbackCategory>(editTarget?.category ?? 'GENERAL');
  const [content, setContent] = useState(editTarget?.content ?? '');
  const [isVisibleToStudent, setIsVisibleToStudent] = useState(
    editTarget?.isVisibleToStudent ?? false,
  );
  const [isVisibleToParent, setIsVisibleToParent] = useState(
    editTarget?.isVisibleToParent ?? false,
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!editTarget;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEdit && !studentId) {
      setError('학생을 선택해주세요');
      return;
    }
    if (!content.trim()) {
      setError('내용을 입력해주세요');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (isEdit) {
        await feedbackService.updateFeedback(editTarget.id, {
          category,
          content,
          isVisibleToStudent,
          isVisibleToParent,
        });
      } else {
        await feedbackService.createFeedback({
          studentId: Number(studentId),
          category,
          content,
          isVisibleToStudent,
          isVisibleToParent,
        });
      }
      onSuccess();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || '피드백 저장에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.formTitle}>{isEdit ? '피드백 수정' : '피드백 작성'}</h3>
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.row}>
        {!isEdit && (
          <select
            value={studentId}
            onChange={(e) => setStudentId(Number(e.target.value) || '')}
            style={styles.input}
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
          value={category}
          onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
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
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        style={styles.textarea}
        placeholder="피드백 내용을 입력하세요"
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
        {submitting ? '저장 중...' : isEdit ? '수정' : '등록'}
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

export default FeedbackForm;
