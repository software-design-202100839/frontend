import api from './api';
import type { ApiResponse } from './authService';

// ── 공통 ──────────────────────────────────────────

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ── 교사 ──────────────────────────────────────────

export interface TeacherSummary {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  department: string;
  isActive: boolean;
  isActivated: boolean;
  currentClass: { grade: number; classNum: number; isHomeroom: boolean } | null;
}

export interface TeacherRegisterRequest {
  name: string;
  phone: string;
  department: string;
}

// ── 학생 ──────────────────────────────────────────

export interface StudentSummary {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  isActive: boolean;
  isActivated: boolean;
  currentEnrollment: { grade: number; classNum: number; studentNum: number } | null;
}

export interface StudentRegisterRequest {
  name: string;
  phone: string;
}

// ── 학부모 ────────────────────────────────────────

export interface ParentSummary {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  isActive: boolean;
  isActivated: boolean;
  children: Array<{ id: number; name: string }>;
}

export interface ParentRegisterRequest {
  name: string;
  phone: string;
}

export type Relationship = 'FATHER' | 'MOTHER' | 'GUARDIAN';

// ── 반 편성 ────────────────────────────────────────

export interface ClassSummary {
  id: number;
  academicYear: number;
  grade: number;
  classNum: number;
  homeroomTeacher: { id: number; name: string } | null;
  studentCount: number;
}

export interface ClassCreateRequest {
  academicYear: number;
  grade: number;
  classNum: number;
  homeroomTeacherId: number | null;
}

export interface AssignStudentRequest {
  studentId: number;
  studentNum: number;
}

export interface AssignTeacherRequest {
  teacherId: number;
  subjectId: number;
}

export interface ClassEnrollment {
  studentId: number;
  studentName: string;
  studentNum: number;
}

export interface ClassAssignment {
  teacherId: number;
  teacherName: string;
  subjectId: number;
  subjectName: string;
}

// ── API 메서드 ────────────────────────────────────

const adminService = {
  // 교사
  async getTeachers(params?: { page?: number; size?: number; isActive?: boolean }) {
    const { data } = await api.get<ApiResponse<PagedResponse<TeacherSummary>>>(
      '/admin/teachers', { params }
    );
    return data.data;
  },

  async registerTeacher(req: TeacherRegisterRequest): Promise<void> {
    await api.post('/admin/teachers', req);
  },

  // 학생
  async getStudents(params?: { page?: number; size?: number; isActive?: boolean }) {
    const { data } = await api.get<ApiResponse<PagedResponse<StudentSummary>>>(
      '/admin/students', { params }
    );
    return data.data;
  },

  async registerStudent(req: StudentRegisterRequest): Promise<void> {
    await api.post('/admin/students', req);
  },

  // 학부모
  async getParents(params?: { page?: number; size?: number }) {
    const { data } = await api.get<ApiResponse<PagedResponse<ParentSummary>>>(
      '/admin/parents', { params }
    );
    return data.data;
  },

  async registerParent(req: ParentRegisterRequest): Promise<void> {
    await api.post('/admin/parents', req);
  },

  async addChildToParent(
    parentId: number,
    studentId: number,
    relationship: Relationship
  ): Promise<void> {
    await api.post(`/admin/parents/${parentId}/children`, { studentId, relationship });
  },

  // 반 편성
  async getClasses(academicYear?: number): Promise<ClassSummary[]> {
    const { data } = await api.get<ApiResponse<ClassSummary[]>>('/admin/classes', {
      params: academicYear ? { academicYear } : undefined,
    });
    return data.data;
  },

  async createClass(req: ClassCreateRequest): Promise<ClassSummary> {
    const { data } = await api.post<ApiResponse<ClassSummary>>('/admin/classes', req);
    return data.data;
  },

  async getClassEnrollments(classId: number): Promise<ClassEnrollment[]> {
    const { data } = await api.get<ApiResponse<ClassEnrollment[]>>(
      `/admin/classes/${classId}/students`
    );
    return data.data;
  },

  async assignStudentToClass(classId: number, req: AssignStudentRequest): Promise<void> {
    await api.post(`/admin/classes/${classId}/students`, req);
  },

  async getClassAssignments(classId: number): Promise<ClassAssignment[]> {
    const { data } = await api.get<ApiResponse<ClassAssignment[]>>(
      `/admin/classes/${classId}/teachers`
    );
    return data.data;
  },

  async assignTeacherToClass(classId: number, req: AssignTeacherRequest): Promise<void> {
    await api.post(`/admin/classes/${classId}/teachers`, req);
  },
};

export default adminService;
