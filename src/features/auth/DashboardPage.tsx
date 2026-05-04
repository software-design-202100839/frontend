import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, MessageSquare, Users, ClipboardList } from 'lucide-react';
import authService from '../../services/authService';
import gradeService from '../../services/gradeService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function DashboardPage() {
  const user = authService.getStoredUser();
  const isTeacher = user?.role === 'TEACHER';
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    if (isTeacher) {
      gradeService.getStudents().then((s) => setStudentCount(s.length));
    }
  }, [isTeacher]);

  const cards = [
    { path: '/grades', icon: BookOpen, title: '성적 관리', desc: '학생별 과목 성적 조회 및 관리', color: 'text-blue-600' },
    { path: '/records', icon: FileText, title: '학생부', desc: '출결, 특기사항, 수상 등 학생부 관리', color: 'text-emerald-600' },
    { path: '/feedbacks', icon: MessageSquare, title: '피드백', desc: '학생 피드백 작성 및 관리', color: 'text-violet-600' },
    { path: '/counselings', icon: ClipboardList, title: '상담내역', desc: '학생 상담 기록 및 공유', color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">대시보드</h2>
        <p className="text-muted-foreground">환영합니다, {user?.name}님.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.path} to={c.path} className="group">
            <Card className="transition-all hover:shadow-md hover:border-primary/20 group-hover:-translate-y-0.5">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <c.icon className={`h-5 w-5 ${c.color}`} />
                </div>
                <CardTitle className="text-base">{c.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{c.desc}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
        {isTeacher && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">등록 학생</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{studentCount}<span className="text-base font-normal text-muted-foreground ml-1">명</span></p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
