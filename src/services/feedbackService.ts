import api from './api';
import type { ApiResponse } from './authService';

export type FeedbackCategory = 'ACADEMIC' | 'BEHAVIOR' | 'ATTENDANCE' | 'ATTITUDE' | 'GENERAL';

export interface FeedbackResponse {
  id: number;
  studentId: number;
  studentName: string;
  teacherId: number;
  teacherName: string;
  category: FeedbackCategory;
  content: string;
  isVisibleToStudent: boolean;
  isVisibleToParent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackRequest {
  studentId: number;
  category: FeedbackCategory;
  content: string;
  isVisibleToStudent: boolean;
  isVisibleToParent: boolean;
}

export interface FeedbackUpdateRequest {
  category: FeedbackCategory;
  content: string;
  isVisibleToStudent: boolean;
  isVisibleToParent: boolean;
}

const categoryLabels: Record<FeedbackCategory, string> = {
  ACADEMIC: '학업',
  BEHAVIOR: '행동',
  ATTENDANCE: '출석',
  ATTITUDE: '태도',
  GENERAL: '일반',
};

const feedbackService = {
  categoryLabels,

  async getFeedbacksByStudent(
    studentId: number,
    category?: FeedbackCategory,
  ): Promise<FeedbackResponse[]> {
    const params: Record<string, unknown> = {};
    if (category) {
      params.category = category;
    }
    const { data } = await api.get<ApiResponse<FeedbackResponse[]>>(
      `/feedbacks/students/${studentId}`,
      { params },
    );
    return data.data;
  },

  async getFeedback(feedbackId: number): Promise<FeedbackResponse> {
    const { data } = await api.get<ApiResponse<FeedbackResponse>>(`/feedbacks/${feedbackId}`);
    return data.data;
  },

  async createFeedback(request: FeedbackRequest): Promise<FeedbackResponse> {
    const { data } = await api.post<ApiResponse<FeedbackResponse>>('/feedbacks', request);
    return data.data;
  },

  async updateFeedback(
    feedbackId: number,
    request: FeedbackUpdateRequest,
  ): Promise<FeedbackResponse> {
    const { data } = await api.put<ApiResponse<FeedbackResponse>>(
      `/feedbacks/${feedbackId}`,
      request,
    );
    return data.data;
  },

  async deleteFeedback(feedbackId: number): Promise<void> {
    await api.delete(`/feedbacks/${feedbackId}`);
  },
};

export default feedbackService;
