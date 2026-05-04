import { useState } from 'react';
import studentService from '../../services/studentService';
import type { RecordType, BasicCategory, StudentRecord } from '../../services/studentService';
import type { Subject } from '../../services/gradeService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  studentId: number;
  subjects: Subject[];
  editTarget?: StudentRecord | null;
  onSuccess: () => void;
}

const basicCategories: { value: BasicCategory; label: string }[] = [
  { value: 'ATTENDANCE', label: '출결' },
  { value: 'GENERAL_OPINION', label: '종합의견' },
  { value: 'AWARD', label: '수상' },
  { value: 'VOLUNTEER', label: '봉사활동' },
];

function RecordForm({ studentId, subjects, editTarget, onSuccess }: Props) {
  const isEdit = !!editTarget;

  const initialContent =
    editTarget && typeof editTarget.content.text === 'string' ? editTarget.content.text : '';

  const [year, setYear] = useState(editTarget?.year ?? 2026);
  const [semester, setSemester] = useState(editTarget?.semester ?? 1);
  const [recordType, setRecordType] = useState<RecordType>(
    editTarget?.recordType ?? 'BASIC',
  );
  const [basicCategory, setBasicCategory] = useState<BasicCategory>(
    (editTarget?.category as BasicCategory) ?? 'ATTENDANCE',
  );
  const [subjectId, setSubjectId] = useState<number | ''>(editTarget?.subjectId ?? subjects[0]?.id ?? '');
  const [content, setContent] = useState(initialContent);
  const [isVisibleToStudent, setIsVisibleToStudent] = useState(
    editTarget?.isVisibleToStudent ?? false,
  );
  const [isVisibleToParent, setIsVisibleToParent] = useState(
    editTarget?.isVisibleToParent ?? false,
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isEdit && recordType === 'SPECIAL' && !subjectId) {
      setError('과목을 선택해주세요');
      return;
    }
    if (!content.trim()) {
      setError('내용을 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await studentService.updateRecord(editTarget.id, { content: { text: content.trim() } });
      } else {
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
      }
      onSuccess();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || (isEdit ? '수정에 실패했습니다' : '등록에 실패했습니다'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? '학생부 항목 수정' : '학생부 항목 등록'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              disabled={isEdit}
              className="flex-1"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </Select>

            <Select
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              disabled={isEdit}
              className="flex-1"
            >
              <option value={1}>1학기</option>
              <option value={2}>2학기</option>
            </Select>
          </div>

          <div className="flex items-center gap-5">
            <Label className="font-bold">구분</Label>
            <label className="flex cursor-pointer items-center gap-1.5 text-sm">
              <input
                type="radio"
                value="BASIC"
                checked={recordType === 'BASIC'}
                onChange={() => setRecordType('BASIC')}
                disabled={isEdit}
              />
              담임 항목
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-sm">
              <input
                type="radio"
                value="SPECIAL"
                checked={recordType === 'SPECIAL'}
                onChange={() => setRecordType('SPECIAL')}
                disabled={isEdit}
              />
              교과 특기사항
            </label>
          </div>

          {recordType === 'BASIC' && (
            <Select
              value={basicCategory}
              onChange={(e) => setBasicCategory(e.target.value as BasicCategory)}
              disabled={isEdit}
            >
              {basicCategories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          )}

          {recordType === 'SPECIAL' && (
            <Select
              value={subjectId}
              onChange={(e) => setSubjectId(Number(e.target.value) || '')}
              disabled={isEdit}
            >
              <option value="">과목 선택</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          )}

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="내용을 입력하세요"
          />

          <div className="flex gap-5">
            <label className="flex cursor-pointer items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={isVisibleToStudent}
                onChange={(e) => setIsVisibleToStudent(e.target.checked)}
                disabled={isEdit}
              />
              학생에게 공개
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={isVisibleToParent}
                onChange={(e) => setIsVisibleToParent(e.target.checked)}
                disabled={isEdit}
              />
              학부모에게 공개
            </label>
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? (isEdit ? '수정 중...' : '등록 중...') : isEdit ? '수정' : '등록'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default RecordForm;
