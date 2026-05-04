import api from './api';
import type { ApiResponse } from './authService';

// ─── 교사 ────────────────────────────────────────────────

export interface TeacherSummary {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  department: string | null;
  active: boolean;
  activated: boolean;
}

export interface RegisterTeacherRequest {
  name: string;
  phone: string;
  department?: string;
}

// ─── 학생 ────────────────────────────────────────────────

export interface EnrollmentInfo {
  academicYear: number;
  grade: number;
  classNum: number;
  studentNum: number;
}

export interface StudentSummary {
  id: number;
  name: string;
  phone: string;
  admissionYear: number;
  activated: boolean;
  currentEnrollment: EnrollmentInfo | null;
}

export interface RegisterStudentRequest {
  name: string;
  phone: string;
  admissionYear: number;
}

// ─── 학부모 ───────────────────────────────────────────────

export interface ChildInfo {
  studentId: number;
  studentName: string;
  relationship: string;
}

export interface ParentSummary {
  id: number;
  name: string;
  phone: string;
  activated: boolean;
  children: ChildInfo[];
}

export interface RegisterParentRequest {
  name: string;
  phone: string;
}

export interface LinkParentChildRequest {
  parentId: number;
  relationship: 'FATHER' | 'MOTHER' | 'GUARDIAN';
}

// ─── 반 ──────────────────────────────────────────────────

export interface HomeroomTeacherInfo {
  id: number;
  name: string;
  department: string | null;
}

export interface ClassSummary {
  id: number;
  academicYear: number;
  grade: number;
  classNum: number;
  homeroomTeacher: HomeroomTeacherInfo | null;
  studentCount: number;
}

export interface CreateClassRequest {
  academicYear: number;
  grade: number;
  classNum: number;
}

export interface EnrollStudentRequest {
  studentId: number;
  studentNum: number;
}

// ─── 과목 배정 ────────────────────────────────────────────

export interface AssignmentTeacherInfo {
  id: number;
  name: string;
  department: string | null;
}

export interface AssignmentClassInfo {
  id: number;
  grade: number;
  classNum: number;
}

export interface AssignmentSubjectInfo {
  id: number;
  name: string;
  code: string;
}

export interface AssignmentSummary {
  id: number;
  teacher: AssignmentTeacherInfo;
  classInfo: AssignmentClassInfo;
  subject: AssignmentSubjectInfo;
  academicYear: number;
}

export interface CreateAssignmentRequest {
  teacherId: number;
  classId: number;
  subjectId: number;
  academicYear: number;
}

// ─── API ─────────────────────────────────────────────────

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

const adminService = {
  // 교사
  getTeachers: () =>
    api.get<ApiResponse<Page<TeacherSummary>>>('/admin/teachers?size=100').then(r => r.data.data!.content),

  registerTeacher: (req: RegisterTeacherRequest) =>
    api.post<ApiResponse<TeacherSummary>>('/admin/teachers', req).then(r => r.data.data!),

  // 학생
  getStudents: () =>
    api.get<ApiResponse<Page<StudentSummary>>>('/admin/students?size=100').then(r => r.data.data!.content),

  registerStudent: (req: RegisterStudentRequest) =>
    api.post<ApiResponse<StudentSummary>>('/admin/students', req).then(r => r.data.data!),

  linkParentChild: (studentId: number, req: LinkParentChildRequest) =>
    api.post<ApiResponse<void>>(`/admin/students/${studentId}/parents`, req),

  // 학부모
  getParents: () =>
    api.get<ApiResponse<Page<ParentSummary>>>('/admin/parents?size=100').then(r => r.data.data!.content),

  registerParent: (req: RegisterParentRequest) =>
    api.post<ApiResponse<ParentSummary>>('/admin/parents', req).then(r => r.data.data!),

  // 반
  getClasses: (academicYear: number) =>
    api.get<ApiResponse<ClassSummary[]>>(`/admin/classes?academicYear=${academicYear}`).then(r => r.data.data!),

  createClass: (req: CreateClassRequest) =>
    api.post<ApiResponse<ClassSummary>>('/admin/classes', req).then(r => r.data.data!),

  assignHomeroom: (classId: number, teacherId: number) =>
    api.put<ApiResponse<void>>(`/admin/classes/${classId}/homeroom`, { teacherId }),

  enrollStudent: (classId: number, req: EnrollStudentRequest) =>
    api.post<ApiResponse<void>>(`/admin/classes/${classId}/students`, req),

  // 과목 배정
  getAssignments: (academicYear: number) =>
    api.get<ApiResponse<AssignmentSummary[]>>(`/admin/assignments?academicYear=${academicYear}`).then(r => r.data.data!),

  createAssignment: (req: CreateAssignmentRequest) =>
    api.post<ApiResponse<AssignmentSummary>>('/admin/assignments', req).then(r => r.data.data!),

  deleteAssignment: (assignmentId: number) =>
    api.delete<ApiResponse<void>>(`/admin/assignments/${assignmentId}`),
};

export default adminService;
