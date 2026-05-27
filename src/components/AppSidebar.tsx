import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  FileText,
  MessageSquare,
  ClipboardList,
  BarChart3,
  PieChart,
  Bell,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import type { LucideIcon } from 'lucide-react';

interface MenuItem {
  path: string;
  icon: LucideIcon;
  label: string;
  roles: string[];
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: '홈',
    items: [
      {
        path: '/',
        icon: Home,
        label: '대시보드',
        roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
      },
    ],
  },
  {
    label: '기록',
    items: [
      {
        path: '/grades',
        icon: BookOpen,
        label: '성적 관리',
        roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
      },
      {
        path: '/records',
        icon: FileText,
        label: '학생부',
        roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
      },
      {
        path: '/feedbacks',
        icon: MessageSquare,
        label: '피드백',
        roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
      },
      { path: '/counselings', icon: ClipboardList, label: '상담내역', roles: ['ADMIN', 'TEACHER'] },
    ],
  },
  {
    label: '분석',
    items: [
      {
        path: '/analytics',
        icon: BarChart3,
        label: '학생 분석',
        roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
      },
      {
        path: '/analytics/subjects',
        icon: PieChart,
        label: '과목 통계',
        roles: ['ADMIN', 'TEACHER'],
      },
    ],
  },
  {
    label: '시스템',
    items: [
      {
        path: '/notifications',
        icon: Bell,
        label: '알림',
        roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
      },
      { path: '/admin', icon: Settings, label: '관리자', roles: ['ADMIN'] },
    ],
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  userRole: string;
}

function AppSidebar({ collapsed, onToggle, userRole }: AppSidebarProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex h-screen flex-col border-r bg-background transition-all duration-200',
          collapsed ? 'w-16' : 'w-[220px]',
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex h-14 items-center border-b px-3',
            collapsed ? 'justify-center' : 'gap-2',
          )}
        >
          <GraduationCap className="h-5 w-5 shrink-0 text-primary" />
          {!collapsed && <span className="text-lg font-bold text-primary">SSCM</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {menuGroups.map((group) => {
            const visibleItems = group.items.filter((item) => item.roles.includes(userRole));
            if (visibleItems.length === 0) {
              return null;
            }

            return (
              <div key={group.label} className="mb-1">
                {!collapsed && (
                  <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </div>
                )}
                {collapsed && <div className="mx-3 my-1 border-t" />}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  const linkContent = (
                    <Link
                      to={item.path}
                      className={cn(
                        'mx-2 flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'border-l-2 border-primary bg-primary/10 text-primary'
                          : 'border-l-2 border-transparent text-muted-foreground hover:bg-accent hover:text-foreground',
                        collapsed && 'justify-center px-0',
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.path}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right">{item.label}</TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <div key={item.path}>{linkContent}</div>;
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer — Toggle */}
        <div className="border-t p-2">
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

export default AppSidebar;
