import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import gradeService from '../../services/gradeService';
import type { StudentInfo, StudentScoreSummary, Subject } from '../../services/gradeService';
import authService from '../../services/authService';
import ScoreForm from './ScoreForm';
import ScoreRadarChart from './ScoreRadarChart';
import StudentSelector from '@/components/StudentSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function GradePage() {
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [year, setYear] = useState(2026);
  const [semester, setSemester] = useState(1);
  const [summary, setSummary] = useState<StudentScoreSummary | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = authService.getStoredUser();
  const isTeacher = user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';
  const isParent = user?.role === 'PARENT';
  const children = user?.children ?? [];

  useEffect(() => {
    gradeService.getSubjects().then(setSubjects);
    if (isTeacher) {
      gradeService.getStudents().then(setStudents);
    } else if (isStudent && user?.roleEntityId) {
      setSelectedStudentId(user.roleEntityId);
    } else if (isParent && children.length > 0) {
      setSelectedStudentId(children[0].id);
    }
  }, []);

  const loadScores = useCallback(async () => {
    if (!selectedStudentId) {
      return;
    }
    setLoading(true);
    try {
      const data = await gradeService.getStudentScores(selectedStudentId, year, semester);
      setSummary(data);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, year, semester]);

  useEffect(() => {
    if (selectedStudentId) {
      loadScores();
    }
  }, [selectedStudentId, year, semester, loadScores]);

  const handleDelete = async (scoreId: number) => {
    if (!confirm('성적을 삭제하시겠습니까?')) {
      return;
    }
    await gradeService.deleteScore(scoreId);
    loadScores();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">성적 관리</h2>
        {isTeacher && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? (
              '취소'
            ) : (
              <>
                <Plus className="mr-1 h-4 w-4" /> 성적 등록
              </>
            )}
          </Button>
        )}
      </div>

      {showForm && (
        <ScoreForm
          students={students}
          subjects={subjects}
          onSuccess={() => {
            setShowForm(false);
            loadScores();
          }}
        />
      )}

      <div className="flex flex-wrap gap-3">
        <Select
          value={year.toString()}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-28"
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}년
            </option>
          ))}
        </Select>
        <Select
          value={semester.toString()}
          onChange={(e) => setSemester(Number(e.target.value))}
          className="w-24"
        >
          <option value={1}>1학기</option>
          <option value={2}>2학기</option>
        </Select>
      </div>

      {isTeacher && (
        <StudentSelector
          students={students}
          selectedStudentId={selectedStudentId}
          year={year}
          onSelect={setSelectedStudentId}
        />
      )}
      {isParent && children.length > 1 && (
        <Select
          value={selectedStudentId?.toString() ?? ''}
          onChange={(e) => setSelectedStudentId(Number(e.target.value) || null)}
          className="w-40"
        >
          {children.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      )}

      {loading && <div className="py-10 text-center text-muted-foreground">로딩 중...</div>}

      {summary && summary.scores.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: '총점', value: summary.totalScore },
              { label: '평균', value: summary.averageScore },
              { label: '평균 등급', value: summary.averageGradeLetter },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold text-primary">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <ScoreRadarChart scores={summary.scores} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {summary.studentName}의 {summary.year}년 {summary.semester}학기 성적
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>과목</TableHead>
                    <TableHead>점수</TableHead>
                    <TableHead>등급</TableHead>
                    <TableHead>석차</TableHead>
                    {isTeacher && <TableHead className="w-20">관리</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.scores.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.subjectName}</TableCell>
                      <TableCell>{s.score}</TableCell>
                      <TableCell>{s.gradeLetter}</TableCell>
                      <TableCell>{s.rank ?? '-'}</TableCell>
                      {isTeacher && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(s.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {summary && summary.scores.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">등록된 성적이 없습니다.</div>
      )}
    </div>
  );
}

export default GradePage;
