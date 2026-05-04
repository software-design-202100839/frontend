import api from './api';
import type { ApiResponse } from './authService';
export type { StudentInfo, Enrollment } from '../types/student';
export { getEnrollment, formatStudentLabel, getLatestEnrollment } from '../types/student';

export interface Subject {
  id: number;
  name: string;
  code: string;
  description: string | null;
}

export interface ScoreResponse {
  id: number;
  studentId: number;
  studentName: string;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  year: number;
  semester: number;
  score: number;
  gradeLetter: string;
  rank: number | null;
}

export interface StudentScoreSummary {
  studentId: number;
  studentName: string;
  year: number;
  semester: number;
  scores: ScoreResponse[];
  totalScore: number;
  averageScore: number;
  averageGradeLetter: string;
}

export interface ScoreRequest {
  studentId: number;
  subjectId: number;
  year: number;
  semester: number;
  score: number;
}

import type { StudentInfo } from '../types/student';

const gradeService = {
  async getSubjects(): Promise<Subject[]> {
    const { data } = await api.get<ApiResponse<Subject[]>>('/grades/subjects');
    return data.data;
  },

  async getStudentScores(
    studentId: number,
    year: number,
    semester: number,
  ): Promise<StudentScoreSummary> {
    const { data } = await api.get<ApiResponse<StudentScoreSummary>>(
      `/grades/students/${studentId}`,
      { params: { year, semester } },
    );
    return data.data;
  },

  async createScore(request: ScoreRequest): Promise<ScoreResponse> {
    const { data } = await api.post<ApiResponse<ScoreResponse>>('/grades', request);
    return data.data;
  },

  async updateScore(scoreId: number, score: number): Promise<ScoreResponse> {
    const { data } = await api.put<ApiResponse<ScoreResponse>>(`/grades/${scoreId}`, {
      score,
    });
    return data.data;
  },

  async deleteScore(scoreId: number): Promise<void> {
    await api.delete(`/grades/${scoreId}`);
  },

  async getScore(scoreId: number): Promise<ScoreResponse> {
    const { data } = await api.get<ApiResponse<ScoreResponse>>(`/grades/${scoreId}`);
    return data.data;
  },

  async getStudents(): Promise<StudentInfo[]> {
    const { data } = await api.get<ApiResponse<StudentInfo[]>>('/students');
    return data.data;
  },
};

export default gradeService;
