import { useState } from 'react';
import counselService from '../../services/counselService';
import type { CounselCategory, CounselingResponse } from '../../services/counselService';
import type { StudentInfo } from '../../services/gradeService';
import { formatStudentLabel } from '../../types/student';

const CURRENT_YEAR = new Date().getFullYear();

interface Props {
  students: StudentInfo[];
  editTarget?: CounselingResponse | null;
  onSuccess: () => void;
}

const categories: { value: CounselCategory; label: string }[] = [
  { value: 'ACADEMIC', label: '학업' },
  { value: 'CAREER', label: '진로' },
  { value: 'BEHAVIOR', label: '행동' },
  { value: 'PERSONAL', label: '개인/심리' },
  { value: 'OTHER', label: '기타' },
];

function CounselingForm({ students, editTarget, onSuccess }: Props) {
  const [studentId, setStudentId] = useState<number | ''>(editTarget?.studentId ?? '');
  const [counselDate, setCounselDate] = useState(
    editTarget?.counselDate ?? new Date().toISOString().slice(0, 10),
  );
  const [category, setCategory] = useState<CounselCategory>(editTarget?.category ?? 'ACADEMIC');
  const [content, setContent] = useState(editTarget?.content ?? '');
  const [nextPlan, setNextPlan] = useState(editTarget?.nextPlan ?? '');
  const [nextCounselDate, setNextCounselDate] = useState(editTarget?.nextCounselDate ?? '');
  const [isShared, setIsShared] = useState(editTarget?.isShared ?? true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!editTarget;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEdit && !studentId) {
      setError('학생을 선택해주세요');
      return;
    }
    if (!counselDate) {
      setError('상담 날짜를 선택해주세요');
      return;
    }
    if (!content.trim()) {
      setError('상담 내용을 입력해주세요');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        counselDate,
        category,
        content,
        nextPlan: nextPlan || undefined,
        nextCounselDate: nextCounselDate || undefined,
        isShared,
      };

      if (isEdit) {
        await counselService.updateCounseling(editTarget.id, payload);
      } else {
        await counselService.createCounseling({
          studentId: Number(studentId),
          ...payload,
        });
      }
      onSuccess();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || '상담내역 저장에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.formTitle}>{isEdit ? '상담내역 수정' : '상담내역 작성'}</h3>
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

        <input
          type="date"
          value={counselDate}
          onChange={(e) => setCounselDate(e.target.value)}
          style={styles.input}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CounselCategory)}
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
        placeholder="상담 내용을 입력하세요"
      />

      <textarea
        value={nextPlan}
        onChange={(e) => setNextPlan(e.target.value)}
        rows={2}
        style={styles.textarea}
        placeholder="후속 조치 계획 (선택)"
      />

      <div style={styles.row}>
        <div style={styles.dateField}>
          <label style={styles.label}>다음 상담 예정일 (선택)</label>
          <input
            type="date"
            value={nextCounselDate}
            onChange={(e) => setNextCounselDate(e.target.value)}
            style={styles.input}
          />
        </div>
      </div>

      <div style={styles.checkboxRow}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isShared}
            onChange={(e) => setIsShared(e.target.checked)}
          />
          다른 교사에게 공유
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
  dateField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  label: {
    fontSize: '12px',
    color: '#666',
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

export default CounselingForm;
