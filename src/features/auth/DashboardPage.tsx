import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  MessageSquare,
  Users,
  ClipboardList,
  Bell,
  CalendarDays,
} from 'lucide-react';
import authService from '../../services/authService';
import gradeService from '../../services/gradeService';
import { useNotification } from '../../hooks/useNotification';
import { Card, CardContent } from '@/components/ui/card';

function DashboardPage() {
  const user = authService.getStoredUser();
  const isTeacher = user?.role === 'TEACHER';
  const [studentCount, setStudentCount] = useState(0);
  const { unreadCount } = useNotification();

  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeek = dayNames[today.getDay()];

  useEffect(() => {
    if (isTeacher) {
      gradeService.getStudents().then((s) => setStudentCount(s.length));
    }
  }, [isTeacher]);

  const quickLinks = [
    {
      path: '/grades',
      icon: BookOpen,
      title: '성적 관리',
      desc: '성적 조회 및 관리',
      color: 'text-blue-600',
    },
    {
      path: '/records',
      icon: FileText,
      title: '학생부',
      desc: '출결, 특기사항 관리',
      color: 'text-emerald-600',
    },
    {
      path: '/feedbacks',
      icon: MessageSquare,
      title: '피드백',
      desc: '피드백 작성 및 관리',
      color: 'text-violet-600',
    },
    {
      path: '/counselings',
      icon: ClipboardList,
      title: '상담내역',
      desc: '상담 기록 및 공유',
      color: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          안녕하세요, {user?.name} {isTeacher ? '선생님' : '님'}
        </h2>
        <p className="text-muted-foreground">
          {formattedDate} ({dayOfWeek}요일)
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isTeacher && (
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">등록 학생</p>
                <p className="text-2xl font-bold text-primary">
                  {studentCount}
                  <span className="text-sm font-normal text-muted-foreground ml-1">명</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Link to="/notifications">
          <Card className="transition-all hover:shadow-md hover:border-primary/20">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                <Bell className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">읽지 않은 알림</p>
                <p className="text-2xl font-bold">
                  {unreadCount}
                  <span className="text-sm font-normal text-muted-foreground ml-1">건</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
              <CalendarDays className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">오늘 날짜</p>
              <p className="text-lg font-semibold">
                {today.getMonth() + 1}/{today.getDate()} ({dayOfWeek})
              </p>
            </div>
          </CardContent>
        </Card>

        <Link to="/analytics">
          <Card className="transition-all hover:shadow-md hover:border-primary/20">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50">
                <BookOpen className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">학생 분석</p>
                <p className="text-sm font-medium text-primary">대시보드 보기</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Access Cards (compact) */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">빠른 접근</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((c) => (
            <Link key={c.path} to={c.path} className="group">
              <Card className="transition-all hover:shadow-md hover:border-primary/20 group-hover:-translate-y-0.5">
                <CardContent className="flex items-center gap-3 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <c.icon className={`h-4 w-4 ${c.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{c.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">최근 활동</h3>
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            최근 활동 내역이 여기에 표시됩니다.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;
