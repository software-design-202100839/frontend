import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { StudentInfo } from '@/types/student';
import { getEnrollment } from '@/types/student';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StudentSelectorProps {
  students: StudentInfo[];
  selectedStudentId: number | null;
  year: number;
  onSelect: (studentId: number) => void;
}

export default function StudentSelector({
  students,
  selectedStudentId,
  year,
  onSelect,
}: StudentSelectorProps) {
  const [gradeFilter, setGradeFilter] = useState<number | ''>('');
  const [classFilter, setClassFilter] = useState<number | ''>('');
  const [nameSearch, setNameSearch] = useState('');

  const grades = useMemo(() => {
    const set = new Set<number>();
    students.forEach((s) => {
      const e = getEnrollment(s, year);
      if (e) {
        set.add(e.grade);
      }
    });
    return Array.from(set).sort();
  }, [students, year]);

  const classes = useMemo(() => {
    const set = new Set<number>();
    students.forEach((s) => {
      const e = getEnrollment(s, year);
      if (e && (gradeFilter === '' || e.grade === gradeFilter)) {
        set.add(e.classNum);
      }
    });
    return Array.from(set).sort();
  }, [students, year, gradeFilter]);

  const filtered = useMemo(() => {
    return students
      .filter((s) => {
        const e = getEnrollment(s, year);
        if (gradeFilter !== '' && (!e || e.grade !== gradeFilter)) {
          return false;
        }
        if (classFilter !== '' && (!e || e.classNum !== classFilter)) {
          return false;
        }
        if (nameSearch && !s.name.includes(nameSearch)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const ea = getEnrollment(a, year);
        const eb = getEnrollment(b, year);
        if (!ea && !eb) {
          return a.name.localeCompare(b.name);
        }
        if (!ea) {
          return 1;
        }
        if (!eb) {
          return -1;
        }
        if (ea.grade !== eb.grade) {
          return ea.grade - eb.grade;
        }
        if (ea.classNum !== eb.classNum) {
          return ea.classNum - eb.classNum;
        }
        return ea.studentNum - eb.studentNum;
      });
  }, [students, year, gradeFilter, classFilter, nameSearch]);

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Select
            value={gradeFilter.toString()}
            onChange={(e) => {
              setGradeFilter(e.target.value === '' ? '' : Number(e.target.value));
              setClassFilter('');
            }}
            className="w-28"
          >
            <option value="">전체 학년</option>
            {grades.map((g) => (
              <option key={g} value={g}>
                {g}학년
              </option>
            ))}
          </Select>

          <Select
            value={classFilter.toString()}
            onChange={(e) => setClassFilter(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-24"
          >
            <option value="">전체 반</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}반
              </option>
            ))}
          </Select>

          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="이름 검색"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="max-h-48 overflow-y-auto rounded-md border">
          {filtered.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              검색 결과가 없습니다.
            </div>
          )}
          {filtered.map((s) => {
            const e = getEnrollment(s, year);
            const isSelected = s.id === selectedStudentId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s.id)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
                  isSelected && 'bg-primary/10 font-medium text-primary',
                  !isSelected && 'text-foreground',
                )}
              >
                {e && (
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    {e.grade}-{e.classNum}
                  </Badge>
                )}
                <span className="flex-1">{s.name}</span>
                {e && <span className="text-xs text-muted-foreground">{e.studentNum}번</span>}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">{filtered.length}명 표시</p>
      </CardContent>
    </Card>
  );
}
