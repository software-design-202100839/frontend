export interface Enrollment {
  academicYear: number;
  grade: number;
  classNum: number;
  studentNum: number;
}

export interface StudentInfo {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  enrollments: Enrollment[];
}

/** 특정 학년도의 enrollment를 찾는다. 없으면 undefined. */
export function getEnrollment(student: StudentInfo, academicYear: number): Enrollment | undefined {
  return student.enrollments.find((e) => e.academicYear === academicYear);
}

/** 학생 선택 드롭다운 표시 레이블.
 *  해당 학년도 enrollment가 있으면 "3학년 2반 5번 이름", 없으면 "이름" 만 반환. */
export function formatStudentLabel(student: StudentInfo, academicYear: number): string {
  const e = getEnrollment(student, academicYear);
  if (!e) return student.name;
  return `${e.grade}학년 ${e.classNum}반 ${e.studentNum}번 ${student.name}`;
}

/** 가장 최근 학년도(최대값)의 enrollment를 반환한다. */
export function getLatestEnrollment(student: StudentInfo): Enrollment | undefined {
  if (student.enrollments.length === 0) return undefined;
  return student.enrollments.reduce((prev, curr) =>
    curr.academicYear > prev.academicYear ? curr : prev
  );
}
