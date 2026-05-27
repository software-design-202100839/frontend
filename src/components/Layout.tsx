import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu } from 'lucide-react';
import { Toaster } from 'sonner';
import authService from '../services/authService';
import { useNotification } from '../hooks/useNotification';
import AiChatWidget from '../features/analytics/AiChatWidget';
import AppSidebar from './AppSidebar';
import { Sheet, SheetContent } from './ui/sheet';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

function Layout() {
  const navigate = useNavigate();
  const user = authService.getStoredUser();
  const { unreadCount } = useNotification();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sscm-sidebar-collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sscm-sidebar-collapsed', String(next));
  };

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

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar collapsed={collapsed} onToggle={toggleCollapsed} userRole={user?.role || ''} />
      </div>

      {/* Mobile Sheet Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[220px] p-0">
          <AppSidebar
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
            userRole={user?.role || ''}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-2">
            <button
              className="rounded-md p-2 hover:bg-accent md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
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
            <div className="hidden items-center gap-2 text-sm sm:flex">
              <span className="font-medium">{user?.name}</span>
              <Badge variant="secondary">{roleLabel[user?.role || '']}</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="로그아웃">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <Outlet />
          </div>
        </main>
      </div>

      <AiChatWidget />
      <Toaster position="top-right" />
    </div>
  );
}

export default Layout;
