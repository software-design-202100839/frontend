import { useState } from 'react';
import counselService from '../../services/counselService';
import type { CounselCategory, CounselingResponse } from '../../services/counselService';
import type { StudentInfo } from '../../services/gradeService';
import { formatStudentLabel } from '../../types/student';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const CURRENT_YEAR = new Date().getFullYear();

interface Props {
  studentId: number;
  students: StudentInfo[];
  editTarget?: CounselingResponse | null;
  onSuccess: () => void;
}

const categories: { value: CounselCategory; label: string }[] = [
  { value: 'ACADEMIC', label: '학업' },
  { value: 'CAREER', label: '진로' },
  { value: 'BEHAVIOR', label: '행동' },
  { value: 'PERSONAL', label: '개인' },
  { value: 'OTHER', label: '기타' },
];

function CounselingForm({ studentId, students, editTarget, onSuccess }: Props) {
  const [counselDate, setCounselDate] = useState(
    editTarget?.counselDate ?? new Date().toISOString().slice(0, 10),
  );
  const [category, setCategory] = useState<CounselCategory>(editTarget?.category ?? 'ACADEMIC');
  const [content, setContent] = useState(editTarget?.content ?? '');
  const [nextPlan, setNextPlan] = useState(editTarget?.nextPlan ?? '');
  const [nextCounselDate, setNextCounselDate] = useState(editTarget?.nextCounselDate ?? '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!editTarget;
  const selectedStudent = students.find((s) => s.id === studentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      };

      if (isEdit) {
        await counselService.updateCounseling(editTarget.id, payload);
      } else {
        await counselService.createCounseling({
          studentId,
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
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? '상담내역 수정' : '상담내역 작성'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[180px]">
              <Label className="mb-1.5 block">학생</Label>
              <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
                {selectedStudent
                  ? formatStudentLabel(selectedStudent, CURRENT_YEAR)
                  : `학생 ID: ${studentId}`}
              </div>
            </div>

            <div className="flex-1 min-w-[160px]">
              <Label className="mb-1.5 block">상담 날짜</Label>
              <Input
                type="date"
                value={counselDate}
                onChange={(e) => setCounselDate(e.target.value)}
              />
            </div>

            <div className="flex-1 min-w-[140px]">
              <Label className="mb-1.5 block">카테고리</Label>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value as CounselCategory)}
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block">상담 내용</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="상담 내용을 입력하세요"
            />
          </div>

          <div>
            <Label className="mb-1.5 block">후속 조치 계획 (선택)</Label>
            <Textarea
              value={nextPlan}
              onChange={(e) => setNextPlan(e.target.value)}
              rows={2}
              placeholder="후속 조치 계획 (선택)"
            />
          </div>

          <div className="max-w-xs">
            <Label className="mb-1.5 block">다음 상담 예정일 (선택)</Label>
            <Input
              type="date"
              value={nextCounselDate}
              onChange={(e) => setNextCounselDate(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? '저장 중...' : isEdit ? '수정' : '등록'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default CounselingForm;
