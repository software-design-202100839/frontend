import api from './api';
import type { ApiResponse } from './authService';

export type NotificationType = 'SCORE_UPDATE' | 'FEEDBACK_NEW' | 'RECORD_UPDATE' | 'COUNSEL_UPDATE' | 'SYSTEM';
export type NotificationReferenceType = 'SCORE' | 'FEEDBACK' | 'RECORD' | 'COUNSEL';

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  referenceType: NotificationReferenceType | null;
  referenceId: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}

export const typeLabels: Record<NotificationType, string> = {
  SCORE_UPDATE: '성적',
  FEEDBACK_NEW: '피드백',
  RECORD_UPDATE: '학생부',
  COUNSEL_UPDATE: '상담',
  SYSTEM: '시스템',
};

const notificationService = {
  async getAll(): Promise<NotificationResponse[]> {
    const { data } = await api.get<ApiResponse<NotificationResponse[]>>('/notifications');
    return data.data;
  },

  async getUnread(): Promise<NotificationResponse[]> {
    const { data } = await api.get<ApiResponse<NotificationResponse[]>>('/notifications/unread');
    return data.data;
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await api.get<ApiResponse<UnreadCountResponse>>('/notifications/unread-count');
    return data.data.count;
  },

  async markAsRead(notificationId: number): Promise<NotificationResponse> {
    const { data } = await api.patch<ApiResponse<NotificationResponse>>(
      `/notifications/${notificationId}/read`,
    );
    return data.data;
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  async deleteNotification(notificationId: number): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  },
};

export default notificationService;
