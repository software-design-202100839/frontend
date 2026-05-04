import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';
import { typeLabels } from '../../services/notificationService';
import type { NotificationResponse } from '../../services/notificationService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Filter = 'ALL' | 'UNREAD' | 'READ';

function getNotificationLink(n: NotificationResponse): string | null {
  if (!n.referenceType) {
    return null;
  }
  switch (n.referenceType) {
    case 'SCORE':
      return '/grades';
    case 'FEEDBACK':
      return '/feedbacks';
    case 'RECORD':
      return '/records';
    case 'COUNSEL':
      return '/counselings';
    default:
      return null;
  }
}

function NotificationPage() {
  const navigate = useNavigate();
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } =
    useNotification();
  const [filter, setFilter] = useState<Filter>('ALL');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') {
      return !n.isRead;
    }
    if (filter === 'READ') {
      return n.isRead;
    }
    return true;
  });

  const unreadExists = notifications.some((n) => !n.isRead);

  const handleClick = async (n: NotificationResponse) => {
    if (!n.isRead) {
      await markAsRead(n.id);
    }
    const link = getNotificationLink(n);
    if (link) {
      navigate(link);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">알림 센터</h2>
        </div>
        {unreadExists && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="mr-1 h-4 w-4" /> 모두 읽음
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        {(['ALL', 'UNREAD', 'READ'] as Filter[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="rounded-full"
          >
            {{ ALL: '전체', UNREAD: '미읽음', READ: '읽음' }[f]}
          </Button>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">알림이 없습니다.</div>
      )}
      <div className="space-y-2">
        {filtered.map((n) => {
          const link = getNotificationLink(n);
          return (
            <Card
              key={n.id}
              className={cn(
                'relative cursor-pointer p-4 transition-colors hover:bg-accent/50',
                !n.isRead && 'border-primary/30 bg-primary/5',
              )}
              onClick={() => handleClick(n)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {typeLabels[n.type]}
                    </Badge>
                    <span className="text-sm font-semibold">{n.title}</span>
                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {link && (
                      <span className="flex items-center gap-1 text-xs text-primary">
                        <ExternalLink className="h-3 w-3" /> 바로가기
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {!n.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(n.id);
                      }}
                      title="읽음 처리"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n.id);
                    }}
                    title="삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default NotificationPage;
