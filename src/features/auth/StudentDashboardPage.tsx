import { Link } from 'react-router-dom';
import { BookOpen, MessageSquare, Bell } from 'lucide-react';
import authService from '../../services/authService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function StudentDashboardPage() {
  const user = authService.getStoredUser();
  const enrollment = user?.roleDetail?.currentEnrollment;

  const cards = [
    { path: '/grades', icon: BookOpen, title: '내 성적', desc: '과목별 성적 및 등급 조회', color: 'text-blue-600' },
    { path: '/feedbacks', icon: MessageSquare, title: '내 피드백', desc: '선생님이 남긴 피드백 확인', color: 'text-violet-600' },
    { path: '/notifications', icon: Bell, title: '알림', desc: '성적 및 피드백 알림 확인', color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">내 대시보드</h2>
          <p className="text-muted-foreground">환영합니다, {user?.name}님.</p>
        </div>
        {enrollment && (
          <Badge variant="secondary" className="text-sm">{enrollment.grade}학년 {enrollment.classNum}반 {enrollment.studentNum}번</Badge>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </div>
  );
}

export default StudentDashboardPage;
