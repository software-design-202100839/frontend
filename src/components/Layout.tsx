import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, GraduationCap } from 'lucide-react';
import authService from '../services/authService';
import { useNotification } from '../hooks/useNotification';
import AiChatWidget from '../features/analytics/AiChatWidget';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getStoredUser();
  const { unreadCount } = useNotification();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    navigate('/login');
  };

  const roleLabel: Record<string, string> = {
    ADMIN: '관리자',
    TEACHER: '교사',
    STUDENT: '학생',
    PARENT: '학부모',
  };

  const navItems = [
    { path: '/', label: '대시보드', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    { path: '/grades', label: '성적 관리', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    { path: '/records', label: '학생부', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    { path: '/feedbacks', label: '피드백', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    { path: '/counselings', label: '상담내역', roles: ['ADMIN', 'TEACHER'] },
    { path: '/analytics', label: '분석', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    {
      path: '/analytics/subjects',
      label: '과목통계',
      roles: ['ADMIN', 'TEACHER'],
    },
    { path: '/admin', label: '관리', roles: ['ADMIN'] },
  ];

  const visibleNavItems = navItems.filter((item) => item.roles.includes(user?.role || ''));

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-bold text-primary">
              <GraduationCap className="h-5 w-5" />
              <span className="text-lg">SSCM</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    location.pathname === item.path
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/notifications" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center p-0 text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="font-medium">{user?.name}</span>
              <Badge variant="secondary">{roleLabel[user?.role || '']}</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="로그아웃">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>

      <AiChatWidget />
    </div>
  );
}

export default Layout;
