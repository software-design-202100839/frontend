import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import analyticsService from '../../services/analyticsService';
import type { SubjectStatistics } from '../../services/analyticsService';
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

const GRADE_COLORS: Record<string, string> = {
  A: '#22c55e',
  B: '#3b82f6',
  C: '#f59e0b',
  D: '#f97316',
  F: '#ef4444',
};

function SubjectStatisticsPage() {
  const [year, setYear] = useState(2026);
  const [semester, setSemester] = useState(1);
  const [statistics, setStatistics] = useState<SubjectStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<SubjectStatistics | null>(null);

  useEffect(() => {
    let cancelled = false;
    analyticsService
      .getSubjectStatistics(year, semester)
      .then((data) => {
        if (!cancelled) {
          setStatistics(data);
          setSelectedSubject(data.length > 0 ? data[0] : null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatistics([]);
          setSelectedSubject(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [year, semester]);

  // 등급 분포 차트 데이터
  const gradeDistData = selectedSubject
    ? [
        { grade: 'A', 학생수: selectedSubject.gradeACount },
        { grade: 'B', 학생수: selectedSubject.gradeBCount },
        { grade: 'C', 학생수: selectedSubject.gradeCCount },
        { grade: 'D', 학생수: selectedSubject.gradeDCount },
        { grade: 'F', 학생수: selectedSubject.gradeFCount },
      ]
    : [];

  // 전체 과목 비교 차트 데이터
  const comparisonData = statistics.map((s) => ({
    과목: s.subjectName,
    평균: s.averageScore,
    최고: s.maxScore,
    최저: s.minScore,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">과목별 통계</h2>

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

      {loading && <div className="py-10 text-center text-muted-foreground">로딩 중...</div>}

      {!loading && statistics.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          해당 학기의 과목 통계 데이터가 없습니다.
        </div>
      )}

      {!loading && statistics.length > 0 && (
        <>
          {/* ── 전체 과목 비교 차트 ── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">과목별 점수 비교</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="과목" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="평균" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="최고" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="최저" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* ── 과목 목록 테이블 ── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">과목별 상세 통계</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>과목</TableHead>
                    <TableHead className="text-right">학생 수</TableHead>
                    <TableHead className="text-right">평균</TableHead>
                    <TableHead className="text-right">최고</TableHead>
                    <TableHead className="text-right">최저</TableHead>
                    <TableHead className="text-right">표준편차</TableHead>
                    <TableHead className="text-right">A/B/C/D/F</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statistics.map((s) => (
                    <TableRow
                      key={s.subjectId}
                      className={
                        selectedSubject?.subjectId === s.subjectId
                          ? 'bg-primary/5'
                          : 'cursor-pointer hover:bg-accent'
                      }
                      onClick={() => setSelectedSubject(s)}
                    >
                      <TableCell className="font-medium">{s.subjectName}</TableCell>
                      <TableCell className="text-right">{s.studentCount}</TableCell>
                      <TableCell className="text-right">{s.averageScore.toFixed(1)}</TableCell>
                      <TableCell className="text-right">{s.maxScore}</TableCell>
                      <TableCell className="text-right">{s.minScore}</TableCell>
                      <TableCell className="text-right">{s.stdDeviation.toFixed(1)}</TableCell>
                      <TableCell className="text-right text-xs">
                        {s.gradeACount}/{s.gradeBCount}/{s.gradeCCount}/{s.gradeDCount}/
                        {s.gradeFCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* ── 선택 과목 등급 분포 차트 ── */}
          {selectedSubject && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {selectedSubject.subjectName} — 등급 분포 ({selectedSubject.studentCount}명)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={gradeDistData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grade" tick={{ fontSize: 14 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} domain={[0, 'auto']} />
                    <Tooltip />
                    <Bar
                      dataKey="학생수"
                      radius={[4, 4, 0, 0]}
                      label={{ position: 'top', fontSize: 12 }}
                    >
                      {gradeDistData.map((entry) => (
                        <Cell key={entry.grade} fill={GRADE_COLORS[entry.grade]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default SubjectStatisticsPage;
