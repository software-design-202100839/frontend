import api from './api';
import type { ApiResponse } from './authService';

// ── DTO 타입 정의 ──
// 백엔드 AnalyticsDashboardController 응답에 맞춘 타입들

export interface StudentDashboard {
  studentId: number;
  studentName: string;
  academicYear: number;
  semester: number;
  avgScore: number;
  scoreTrend: 'UP' | 'DOWN' | 'STABLE' | null;
  attendanceCount: number;
  awardCount: number;
  totalFeedbackCount: number;
  totalCounselCount: number;
  lastCounselDate: string | null;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ScoreSummary {
  studentId: number;
  studentName: string;
  academicYear: number;
  semester: number;
  subjectCount: number;
  totalScore: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  averageGrade: string;
}

export interface SemesterScore {
  year: number;
  semester: number;
  averageScore: number;
  averageGrade: string;
}

export interface ScoreTrend {
  studentId: number;
  trends: SemesterScore[];
}

export interface AttendanceSummary {
  studentId: number;
  academicYear: number;
  semester: number;
  attendanceCount: number;
  awardCount: number;
  volunteerCount: number;
  specialNoteCount: number;
  generalOpinionCount: number;
}

export interface FeedbackSummary {
  studentId: number;
  academicYear: number;
  semester: number;
  totalFeedbackCount: number;
  academicCount: number;
  behaviorCount: number;
  attendanceCount: number;
  attitudeCount: number;
  generalCount: number;
}

export interface CounselingSummary {
  studentId: number;
  academicYear: number;
  semester: number;
  totalCounselCount: number;
  academicCount: number;
  careerCount: number;
  behaviorCount: number;
  personalCount: number;
  otherCount: number;
  lastCounselDate: string | null;
}

export interface SubjectStatistics {
  subjectId: number;
  subjectName: string;
  academicYear: number;
  semester: number;
  studentCount: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  stdDeviation: number;
  gradeACount: number;
  gradeBCount: number;
  gradeCCount: number;
  gradeDCount: number;
  gradeFCount: number;
}

const analyticsService = {
  // 학생 종합 대시보드
  async getStudentDashboard(
    studentId: number,
    year: number,
    semester: number,
  ): Promise<StudentDashboard> {
    const { data } = await api.get<ApiResponse<StudentDashboard>>(
      `/analytics/students/${studentId}/dashboard`,
      { params: { year, semester } },
    );
    return data.data;
  },

  // 성적 요약
  async getScoreSummary(
    studentId: number,
    year: number,
    semester: number,
  ): Promise<ScoreSummary> {
    const { data } = await api.get<ApiResponse<ScoreSummary>>(
      `/analytics/students/${studentId}/score-summary`,
      { params: { year, semester } },
    );
    return data.data;
  },

  // 성적 추이 (전 학기)
  async getScoreTrend(studentId: number): Promise<ScoreTrend> {
    const { data } = await api.get<ApiResponse<ScoreTrend>>(
      `/analytics/students/${studentId}/score-trend`,
    );
    return data.data;
  },

  // 출결/기록 요약
  async getAttendanceSummary(
    studentId: number,
    year: number,
    semester: number,
  ): Promise<AttendanceSummary> {
    const { data } = await api.get<ApiResponse<AttendanceSummary>>(
      `/analytics/students/${studentId}/attendance-summary`,
      { params: { year, semester } },
    );
    return data.data;
  },

  // 피드백 요약
  async getFeedbackSummary(
    studentId: number,
    year: number,
    semester: number,
  ): Promise<FeedbackSummary> {
    const { data } = await api.get<ApiResponse<FeedbackSummary>>(
      `/analytics/students/${studentId}/feedback-summary`,
      { params: { year, semester } },
    );
    return data.data;
  },

  // 상담 요약
  async getCounselingSummary(
    studentId: number,
    year: number,
    semester: number,
  ): Promise<CounselingSummary> {
    const { data } = await api.get<ApiResponse<CounselingSummary>>(
      `/analytics/students/${studentId}/counseling-summary`,
      { params: { year, semester } },
    );
    return data.data;
  },

  // AI 챗봇 (교사/관리자 전용)
  async sendChatMessage(question: string): Promise<string> {
    const { data } = await api.post<ApiResponse<{ answer: string }>>(
      '/analytics/chat',
      { question },
    );
    return data.data.answer;
  },

  // 과목별 통계 (교사/관리자 전용)
  async getSubjectStatistics(
    year: number,
    semester: number,
  ): Promise<SubjectStatistics[]> {
    const { data } = await api.get<ApiResponse<SubjectStatistics[]>>(
      '/analytics/subjects/statistics',
      { params: { year, semester } },
    );
    return data.data;
  },
};

export default analyticsService;
