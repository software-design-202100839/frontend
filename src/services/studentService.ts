import api from './api';
import type { ApiResponse } from './authService';

export type RecordType = 'BASIC' | 'SPECIAL';
export type BasicCategory = 'ATTENDANCE' | 'GENERAL_OPINION' | 'AWARD' | 'VOLUNTEER';
export type SpecialCategory = 'SPECIAL_NOTE';
export type RecordCategory = BasicCategory | SpecialCategory;

export interface StudentRecord {
  id: number;
  studentId: number;
  studentName: string;
  year: number;
  semester: number;
  recordType: RecordType;
  category: RecordCategory;
  subjectId: number | null;
  subjectName: string | null;
  content: Record<string, unknown>;
  isVisibleToStudent: boolean;
  isVisibleToParent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentRecordRequest {
  studentId: number;
  year: number;
  semester: number;
  recordType: RecordType;
  category: RecordCategory;
  subjectId?: number;
  content: Record<string, unknown>;
  isVisibleToStudent: boolean;
  isVisibleToParent: boolean;
}

const basicCategoryLabels: Record<BasicCategory, string> = {
  ATTENDANCE: '출결',
  GENERAL_OPINION: '종합의견',
  AWARD: '수상',
  VOLUNTEER: '봉사활동',
};

const specialCategoryLabels: Record<SpecialCategory, string> = {
  SPECIAL_NOTE: '교과 특기사항',
};

const categoryLabels: Record<RecordCategory, string> = {
  ...basicCategoryLabels,
  ...specialCategoryLabels,
};

const recordTypeLabels: Record<RecordType, string> = {
  BASIC: '담임',
  SPECIAL: '교과',
};

const studentService = {
  categoryLabels,
  basicCategoryLabels,
  specialCategoryLabels,
  recordTypeLabels,

  async getStudentRecords(
    studentId: number,
    year: number,
    semester: number,
    category?: RecordCategory,
    recordType?: RecordType,
  ): Promise<StudentRecord[]> {
    const params: Record<string, unknown> = { year, semester };
    if (category) params.category = category;
    if (recordType) params.recordType = recordType;
    const { data } = await api.get<ApiResponse<StudentRecord[]>>(`/students/${studentId}/records`, {
      params,
    });
    return data.data;
  },

  async createRecord(request: StudentRecordRequest): Promise<StudentRecord> {
    const { data } = await api.post<ApiResponse<StudentRecord>>('/students/records', request);
    return data.data;
  },

  async deleteRecord(recordId: number): Promise<void> {
    await api.delete(`/students/records/${recordId}`);
  },
};

export default studentService;
