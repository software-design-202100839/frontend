import { useState } from 'react';
import feedbackService from '../../services/feedbackService';
import type { FeedbackCategory, FeedbackResponse } from '../../services/feedbackService';
import type { StudentInfo } from '../../services/gradeService';
import { formatStudentLabel } from '../../types/student';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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
  const [year, setYear] = useState(CURRENT_YEAR);
  const [semester, setSemester] = useState(1);
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
          year,
          semester,
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
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? '피드백 수정' : '피드백 작성'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {!isEdit && (
              <Select
                value={studentId}
                onChange={(e) => setStudentId(Number(e.target.value) || '')}
              >
                <option value="">학생 선택</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {formatStudentLabel(s, CURRENT_YEAR)}
                  </option>
                ))}
              </Select>
            )}
            <Select value={year.toString()} onChange={(e) => setYear(Number(e.target.value))}>
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </Select>
            <Select
              value={semester.toString()}
              onChange={(e) => setSemester(Number(e.target.value))}
            >
              <option value={1}>1학기</option>
              <option value={2}>2학기</option>
            </Select>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="피드백 내용을 입력하세요"
          />

          <div className="flex gap-5">
            <label className="flex cursor-pointer items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={isVisibleToStudent}
                onChange={(e) => setIsVisibleToStudent(e.target.checked)}
              />
              학생에게 공개
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={isVisibleToParent}
                onChange={(e) => setIsVisibleToParent(e.target.checked)}
              />
              학부모에게 공개
            </label>
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? '저장 중...' : isEdit ? '수정' : '등록'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default FeedbackForm;
