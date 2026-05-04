import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, MessageSquare, Bell } from 'lucide-react';
import authService from '../../services/authService';
import notificationService from '../../services/notificationService';
import type { NotificationResponse } from '../../services/notificationService';
import { typeLabels } from '../../services/notificationService';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function ParentDashboardPage() {
  const user = authService.getStoredUser();
  const children = user?.children ?? [];
  const [selectedChildId, setSelectedChildId] = useState<number | null>(
    children.length > 0 ? children[0].id : null,
  );
  const [recentNotifications, setRecentNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await notificationService.getAll();
        setRecentNotifications(all.slice(0, 5));
      } catch {
        /* 무시 */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectedChild = children.find((c) => c.id === selectedChildId);
  const scoreNotifications = recentNotifications.filter((n) => n.type === 'SCORE_UPDATE');
  const feedbackNotifications = recentNotifications.filter((n) => n.type === 'FEEDBACK_NEW');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">학부모 대시보드</h2>
        <p className="text-sm text-muted-foreground">환영합니다, {user?.name}님.</p>
      </div>

      {/* 자녀 선택 드롭다운 */}
      {children.length > 0 ? (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="flex items-center gap-3 p-4">
            <label className="text-sm font-semibold whitespace-nowrap">자녀 선택</label>
            <Select
              value={selectedChildId ?? ''}
              onChange={(e) => setSelectedChildId(Number(e.target.value))}
              className="w-auto min-w-[160px]"
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="p-4 text-sm text-orange-800">
            등록된 자녀가 없습니다. 관리자에게 자녀 연결을 요청하세요.
          </CardContent>
        </Card>
      )}

      {/* 자녀별 바로가기 */}
      {selectedChild && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
          <Link to={`/grades?studentId=${selectedChildId}`} className="no-underline">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader className="p-5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4" /> {selectedChild.name} 성적
                </CardTitle>
                <CardDescription>과목별 성적 및 등급 조회</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to={`/feedbacks?studentId=${selectedChildId}`} className="no-underline">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader className="p-5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4" /> {selectedChild.name} 피드백
                </CardTitle>
                <CardDescription>선생님이 남긴 피드백 확인</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/notifications" className="no-underline">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader className="p-5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-4 w-4" /> 알림 센터
                </CardTitle>
                <CardDescription>모든 알림 확인</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      )}

      {/* 최근 알림 요약 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">최근 알림</h3>

        {children.length > 0 && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  성적 알림
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">로딩 중...</p>
                ) : scoreNotifications.length > 0 ? (
                  <div className="space-y-1">
                    {scoreNotifications.map((n) => (
                      <div
                        key={n.id}
                        className="flex items-center justify-between border-b border-border/50 py-1.5 last:border-0"
                      >
                        <span className="text-sm">{n.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(n.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">최근 성적 알림이 없습니다.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  피드백 알림
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">로딩 중...</p>
                ) : feedbackNotifications.length > 0 ? (
                  <div className="space-y-1">
                    {feedbackNotifications.map((n) => (
                      <div
                        key={n.id}
                        className="flex items-center justify-between border-b border-border/50 py-1.5 last:border-0"
                      >
                        <span className="text-sm">{n.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(n.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">최근 피드백 알림이 없습니다.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {loading && <p className="text-center text-muted-foreground">로딩 중...</p>}
        {!loading && recentNotifications.length === 0 && (
          <p className="py-5 text-center text-muted-foreground">알림이 없습니다.</p>
        )}

        <div className="space-y-2">
          {recentNotifications.map((n) => (
            <Card key={n.id} className={cn(!n.isRead && 'border-blue-200 bg-blue-50/50')}>
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2.5">
                  <Badge variant="secondary">{typeLabels[n.type]}</Badge>
                  <span className="flex-1 text-sm font-semibold">{n.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{n.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ParentDashboardPage;
