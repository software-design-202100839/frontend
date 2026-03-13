import api from './api';
import type { ApiResponse } from './authService';

export type RecordCategory = 'ATTENDANCE' | 'SPECIAL_NOTE' | 'AWARD' | 'VOLUNTEER' | 'OTHER';

export interface StudentRecord {
  id: number;
  studentId: number;
  studentName: string;
  year: number;
  semester: number;
  category: RecordCategory;
  content: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface StudentRecordRequest {
  studentId: number;
  year: number;
  semester: number;
  category: RecordCategory;
  content: Record<string, unknown>;
}

const categoryLabels: Record<RecordCategory, string> = {
  ATTENDANCE: '출결',
  SPECIAL_NOTE: '특기사항',
  AWARD: '수상',
  VOLUNTEER: '봉사활동',
  OTHER: '기타',
};

const studentService = {
  categoryLabels,

  async getStudentRecords(
    studentId: number,
    year: number,
    semester: number,
    category?: RecordCategory,
  ): Promise<StudentRecord[]> {
    const params: Record<string, unknown> = { year, semester };
    if (category) {
      params.category = category;
    }
    const { data } = await api.get<ApiResponse<StudentRecord[]>>(`/students/${studentId}/records`, {
      params,
    });
    return data.data;
  },

  async createRecord(request: StudentRecordRequest): Promise<StudentRecord> {
    const { data } = await api.post<ApiResponse<StudentRecord>>('/students/records', request);
    return data.data;
  },

  async updateRecord(recordId: number, content: Record<string, unknown>): Promise<StudentRecord> {
    const { data } = await api.put<ApiResponse<StudentRecord>>(`/students/records/${recordId}`, {
      content,
    });
    return data.data;
  },

  async deleteRecord(recordId: number): Promise<void> {
    await api.delete(`/students/records/${recordId}`);
  },
};

export default studentService;
