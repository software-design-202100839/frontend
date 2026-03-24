import api from './api';
import type { ApiResponse } from './authService';

export type CounselCategory = 'ACADEMIC' | 'CAREER' | 'BEHAVIOR' | 'PERSONAL' | 'OTHER';

export interface CounselingResponse {
  id: number;
  studentId: number;
  studentName: string;
  teacherId: number;
  teacherName: string;
  counselDate: string;
  category: CounselCategory;
  content: string;
  nextPlan: string | null;
  nextCounselDate: string | null;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CounselingRequest {
  studentId: number;
  counselDate: string;
  category: CounselCategory;
  content: string;
  nextPlan?: string;
  nextCounselDate?: string;
  isShared: boolean;
}

export interface CounselingUpdateRequest {
  counselDate: string;
  category: CounselCategory;
  content: string;
  nextPlan?: string;
  nextCounselDate?: string;
  isShared: boolean;
}

const categoryLabels: Record<CounselCategory, string> = {
  ACADEMIC: '학업',
  CAREER: '진로',
  BEHAVIOR: '행동',
  PERSONAL: '개인/심리',
  OTHER: '기타',
};

const counselService = {
  categoryLabels,

  async getCounselingsByStudent(
    studentId: number,
    category?: CounselCategory,
  ): Promise<CounselingResponse[]> {
    const params: Record<string, unknown> = {};
    if (category) {
      params.category = category;
    }
    const { data } = await api.get<ApiResponse<CounselingResponse[]>>(
      `/counselings/students/${studentId}`,
      { params },
    );
    return data.data;
  },

  async getSharedCounselings(studentId: number): Promise<CounselingResponse[]> {
    const { data } = await api.get<ApiResponse<CounselingResponse[]>>(
      `/counselings/students/${studentId}/shared`,
    );
    return data.data;
  },

  async getMyCounselings(): Promise<CounselingResponse[]> {
    const { data } = await api.get<ApiResponse<CounselingResponse[]>>('/counselings/my');
    return data.data;
  },

  async getCounseling(counselingId: number): Promise<CounselingResponse> {
    const { data } = await api.get<ApiResponse<CounselingResponse>>(`/counselings/${counselingId}`);
    return data.data;
  },

  async createCounseling(request: CounselingRequest): Promise<CounselingResponse> {
    const { data } = await api.post<ApiResponse<CounselingResponse>>('/counselings', request);
    return data.data;
  },

  async updateCounseling(
    counselingId: number,
    request: CounselingUpdateRequest,
  ): Promise<CounselingResponse> {
    const { data } = await api.put<ApiResponse<CounselingResponse>>(
      `/counselings/${counselingId}`,
      request,
    );
    return data.data;
  },

  async deleteCounseling(counselingId: number): Promise<void> {
    await api.delete(`/counselings/${counselingId}`);
  },
};

export default counselService;
