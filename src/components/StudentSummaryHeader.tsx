import { Users } from 'lucide-react';
import { Button } from './ui/button';

interface StudentSummaryHeaderProps {
  student: {
    id: number;
    name: string;
    grade?: number;
    classNum?: number;
    studentNum?: number;
  } | null;
  onChangeStudent: () => void;
}

function StudentSummaryHeader({ student, onChangeStudent }: StudentSummaryHeaderProps) {
  if (!student) {
    return (
      <div className="flex h-12 items-center justify-between rounded-lg border border-dashed px-4">
        <span className="text-sm text-muted-foreground">학생을 선택해주세요</span>
        <Button variant="outline" size="sm" onClick={onChangeStudent}>
          <Users className="mr-1.5 h-4 w-4" /> 학생 선택
        </Button>
      </div>
    );
  }

  const label = [
    student.grade && student.classNum && `${student.grade}학년 ${student.classNum}반`,
    student.studentNum && `${student.studentNum}번`,
    student.name,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="flex h-12 items-center justify-between rounded-lg border bg-background px-4">
      <span className="text-sm font-medium">{label}</span>
      <Button variant="ghost" size="sm" onClick={onChangeStudent}>
        학생 변경
      </Button>
    </div>
  );
}

export default StudentSummaryHeader;
