import { useState } from 'react';
import gradeService from '../../services/gradeService';
import type { StudentInfo, Subject } from '../../services/gradeService';
import { formatStudentLabel } from '../../types/student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">성적 등록</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>학생</Label>
              <Select
                value={studentId.toString()}
                onChange={(e) => setStudentId(Number(e.target.value) || '')}
              >
                <option value="">학생 선택</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {formatStudentLabel(s, year)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>과목</Label>
              <Select
                value={subjectId.toString()}
                onChange={(e) => setSubjectId(Number(e.target.value) || '')}
              >
                <option value="">과목 선택</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>학년도</Label>
              <Select value={year.toString()} onChange={(e) => setYear(Number(e.target.value))}>
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}년
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>학기</Label>
              <Select
                value={semester.toString()}
                onChange={(e) => setSemester(Number(e.target.value))}
              >
                <option value={1}>1학기</option>
                <option value={2}>2학기</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>점수</Label>
              <Input
                type="number"
                placeholder="0~100"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? '등록 중...' : '등록'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default ScoreForm;
