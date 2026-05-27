import { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Award,
  Heart,
  FileText,
  MessageSquare,
} from 'lucide-react';
import analyticsService from '../../services/analyticsService';
import type {
  StudentDashboard,
  ScoreSummary,
  ScoreTrend,
  AttendanceSummary,
  FeedbackSummary,
  CounselingSummary,
} from '../../services/analyticsService';
import gradeService from '../../services/gradeService';
import type { StudentInfo } from '../../services/gradeService';
import authService from '../../services/authService';
import { getEnrollment } from '../../types/student';
import StudentSummaryHeader from '@/components/StudentSummaryHeader';
import StudentDrawer from '@/components/StudentDrawer';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// 피드백 카테고리별 차트 색상
const FEEDBACK_COLORS = ['#2563eb', '#f59e0b', '#10b981', '#8b5cf6', '#6b7280'];
const COUNSEL_COLORS = ['#3b82f6', '#ef4444', '#f97316', '#06b6d4', '#a3a3a3'];

const TABS = [
  { id: 'summary', label: '요약' },
  { id: 'scores', label: '성적' },
  { id: 'records', label: '출결·기록' },
  { id: 'feedback', label: '피드백·상담' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function AnalyticsDashboardPage() {
  const user = authService.getStoredUser();
  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';
  const isStudent = user?.role === 'STUDENT';
  const isParent = user?.role === 'PARENT';
  const children = user?.children ?? [];

  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [year, setYear] = useState(2026);
  const [semester, setSemester] = useState(1);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('summary');

  // 분석 데이터 상태
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [scoreSummary, setScoreSummary] = useState<ScoreSummary | null>(null);
  const [scoreTrend, setScoreTrend] = useState<ScoreTrend | null>(null);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [feedback, setFeedback] = useState<FeedbackSummary | null>(null);
  const [counseling, setCounseling] = useState<CounselingSummary | null>(null);

  // 초기 데이터 로드 (학생 목록)
  useEffect(() => {
    if (isTeacher) {
      gradeService.getStudents().then(setStudents);
    } else if (isStudent && user?.roleEntityId) {
      setSelectedStudentId(user.roleEntityId);
    } else if (isParent && children.length > 0) {
      setSelectedStudentId(children[0].id);
    }
  }, []);

  // 학생 선택 시 전체 분석 데이터 로드
  const loadAnalytics = useCallback(async () => {
    if (!selectedStudentId) {
      return;
    }
    setLoading(true);
    const safe = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      try {
        return await fn();
      } catch {
        return null;
      }
    };
    const [dashboardData, scoreData, trendData, attendanceData, feedbackData, counselData] =
      await Promise.all([
        safe(() => analyticsService.getStudentDashboard(selectedStudentId, year, semester)),
        safe(() => analyticsService.getScoreSummary(selectedStudentId, year, semester)),
        safe(() => analyticsService.getScoreTrend(selectedStudentId)),
        safe(() => analyticsService.getAttendanceSummary(selectedStudentId, year, semester)),
        safe(() => analyticsService.getFeedbackSummary(selectedStudentId, year, semester)),
        safe(() => analyticsService.getCounselingSummary(selectedStudentId, year, semester)),
      ]);
    setDashboard(dashboardData);
    setScoreSummary(scoreData);
    setScoreTrend(trendData);
    setAttendance(attendanceData);
    setFeedback(feedbackData);
    setCounseling(counselData);
    setLoading(false);
  }, [selectedStudentId, year, semester]);

  useEffect(() => {
    if (selectedStudentId) {
      loadAnalytics();
    }
  }, [selectedStudentId, year, semester, loadAnalytics]);

  // ── 차트 데이터 가공 ──

  const trendChartData =
    scoreTrend?.trends.map((t) => ({
      label: `${t.year} ${t.semester}학기`,
      평균점수: t.averageScore,
      등급: t.averageGrade,
    })) ?? [];

  const feedbackChartData = feedback
    ? [
        { name: '학업', value: feedback.academicCount },
        { name: '행동', value: feedback.behaviorCount },
        { name: '출결', value: feedback.attendanceCount },
        { name: '태도', value: feedback.attitudeCount },
        { name: '기타', value: feedback.generalCount },
      ].filter((d) => d.value > 0)
    : [];

  const counselChartData = counseling
    ? [
        { name: '학업', value: counseling.academicCount },
        { name: '진로', value: counseling.careerCount },
        { name: '행동', value: counseling.behaviorCount },
        { name: '개인', value: counseling.personalCount },
        { name: '기타', value: counseling.otherCount },
      ].filter((d) => d.value > 0)
    : [];

  // ── 헬퍼 렌더링 ──

  const renderTrendIcon = (trend: StudentDashboard['scoreTrend']) => {
    if (trend === 'UP') {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    }
    if (trend === 'DOWN') {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    if (trend === 'STABLE') {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
    return null;
  };

  const renderRiskBadge = (level: StudentDashboard['riskLevel']) => {
    if (level === 'HIGH') {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          <AlertTriangle className="mr-1 h-3 w-3" /> 위험
        </Badge>
      );
    }
    if (level === 'MEDIUM') {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
          <AlertCircle className="mr-1 h-3 w-3" /> 주의
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
        <CheckCircle className="mr-1 h-3 w-3" /> 양호
      </Badge>
    );
  };

  // ── Tab Content Renderers ──

  const renderSummaryTab = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">평균 점수</p>
              {dashboard && renderTrendIcon(dashboard.scoreTrend)}
            </div>
            <p className="mt-1 text-3xl font-bold text-primary">{dashboard?.avgScore.toFixed(1)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {dashboard?.scoreTrend === 'UP' && '지난 학기 대비 상승'}
              {dashboard?.scoreTrend === 'DOWN' && '지난 학기 대비 하락'}
              {dashboard?.scoreTrend === 'STABLE' && '지난 학기와 유사'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">위험도</p>
            <div className="mt-2">{dashboard && renderRiskBadge(dashboard.riskLevel)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">피드백 / 상담</p>
            <p className="mt-1 text-3xl font-bold">
              {dashboard?.totalFeedbackCount}{' '}
              <span className="text-lg text-muted-foreground">
                / {dashboard?.totalCounselCount}
              </span>
            </p>
            {dashboard?.lastCounselDate && (
              <p className="mt-1 text-xs text-muted-foreground">
                마지막 상담: {dashboard.lastCounselDate}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <BookOpen className="mx-auto h-5 w-5 text-blue-500" />
                <p className="mt-1 text-lg font-bold">{dashboard?.attendanceCount}</p>
                <p className="text-xs text-muted-foreground">출결</p>
              </div>
              <div className="text-center">
                <Award className="mx-auto h-5 w-5 text-yellow-500" />
                <p className="mt-1 text-lg font-bold">{dashboard?.awardCount}</p>
                <p className="text-xs text-muted-foreground">수상</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Summary */}
      {scoreSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">성적 요약 — {scoreSummary.subjectCount}과목</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {[
                { label: '총점', value: scoreSummary.totalScore },
                { label: '평균', value: scoreSummary.averageScore.toFixed(1) },
                { label: '최고', value: scoreSummary.highestScore },
                { label: '최저', value: scoreSummary.lowestScore },
                { label: '평균 등급', value: scoreSummary.averageGrade },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold text-primary">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Level Summary */}
      {dashboard && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">위험도 평가</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {renderRiskBadge(dashboard.riskLevel)}
              <span className="text-sm text-muted-foreground">
                {dashboard.riskLevel === 'HIGH' && '즉각적인 관심과 개입이 필요합니다.'}
                {dashboard.riskLevel === 'MEDIUM' && '지속적인 모니터링이 필요합니다.'}
                {dashboard.riskLevel === 'LOW' && '현재 학업 상태가 양호합니다.'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderScoresTab = () => (
    <div className="space-y-6">
      {/* Score Summary */}
      {scoreSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">성적 요약 — {scoreSummary.subjectCount}과목</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {[
                { label: '총점', value: scoreSummary.totalScore },
                { label: '평균', value: scoreSummary.averageScore.toFixed(1) },
                { label: '최고', value: scoreSummary.highestScore },
                { label: '최저', value: scoreSummary.lowestScore },
                { label: '평균 등급', value: scoreSummary.averageGrade },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold text-primary">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Trend Chart */}
      {trendChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">학기별 성적 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="평균점수"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {!scoreSummary && trendChartData.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">성적 데이터가 없습니다.</div>
      )}
    </div>
  );

  const renderRecordsTab = () => (
    <div className="space-y-6">
      {attendance && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">출결 및 기록 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {[
                {
                  label: '출결',
                  value: attendance.attendanceCount,
                  icon: <BookOpen className="h-4 w-4 text-blue-500" />,
                },
                {
                  label: '수상',
                  value: attendance.awardCount,
                  icon: <Award className="h-4 w-4 text-yellow-500" />,
                },
                {
                  label: '봉사',
                  value: attendance.volunteerCount,
                  icon: <Heart className="h-4 w-4 text-pink-500" />,
                },
                {
                  label: '세부능력',
                  value: attendance.specialNoteCount,
                  icon: <FileText className="h-4 w-4 text-purple-500" />,
                },
                {
                  label: '종합의견',
                  value: attendance.generalOpinionCount,
                  icon: <MessageSquare className="h-4 w-4 text-green-500" />,
                },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center rounded-lg border p-3">
                  {item.icon}
                  <p className="mt-2 text-2xl font-bold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!attendance && (
        <div className="py-16 text-center text-muted-foreground">
          출결 및 기록 데이터가 없습니다.
        </div>
      )}
    </div>
  );

  const renderFeedbackTab = () => (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* 피드백 분포 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              피드백 카테고리 분포 (총 {feedback?.totalFeedbackCount ?? 0}건)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {feedbackChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={feedbackChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}`}
                  >
                    {feedbackChartData.map((_entry, index) => (
                      <Cell
                        key={`fb-${index}`}
                        fill={FEEDBACK_COLORS[index % FEEDBACK_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-10 text-center text-sm text-muted-foreground">
                피드백 데이터가 없습니다.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 상담 분포 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              상담 카테고리 분포 (총 {counseling?.totalCounselCount ?? 0}건)
              {counseling?.lastCounselDate && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  마지막 상담: {counseling.lastCounselDate}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {counselChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={counselChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}`}
                  >
                    {counselChartData.map((_entry, index) => (
                      <Cell
                        key={`cs-${index}`}
                        fill={COUNSEL_COLORS[index % COUNSEL_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-10 text-center text-sm text-muted-foreground">
                상담 데이터가 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">학생 분석 대시보드</h2>

      {/* 필터: 학년도 / 학기 */}
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

      {/* 학생 선택 */}
      {isTeacher &&
        (() => {
          const s = students.find((st) => st.id === selectedStudentId) ?? null;
          const e = s ? getEnrollment(s, year) : undefined;
          const student = s
            ? {
                id: s.id,
                name: s.name,
                grade: e?.grade,
                classNum: e?.classNum,
                studentNum: e?.studentNum,
              }
            : null;
          return (
            <>
              <StudentSummaryHeader student={student} onChangeStudent={() => setDrawerOpen(true)} />
              <StudentDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                students={students}
                onSelect={(id) => setSelectedStudentId(id)}
                selectedStudentId={selectedStudentId}
                year={year}
              />
            </>
          );
        })()}
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

      {!loading && !selectedStudentId && (
        <div className="py-16 text-center text-muted-foreground">
          학생을 선택하면 분석 데이터가 표시됩니다.
        </div>
      )}

      {!loading && dashboard && (
        <>
          {/* Tab Navigation */}
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'summary' && renderSummaryTab()}
          {activeTab === 'scores' && renderScoresTab()}
          {activeTab === 'records' && renderRecordsTab()}
          {activeTab === 'feedback' && renderFeedbackTab()}
        </>
      )}

      {!loading && selectedStudentId && !dashboard && (
        <div className="py-16 text-center text-muted-foreground">
          해당 학기의 분석 데이터가 없습니다.
        </div>
      )}
    </div>
  );
}

export default AnalyticsDashboardPage;
