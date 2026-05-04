/**
 * 발표용 역할별 UI 스크린샷 자동 생성
 *
 * 실행 방법:
 *   npx playwright test screenshots-for-presentation --headed
 *
 * 결과:  screenshots/presentation/*.png
 *
 * 백엔드 불필요 — 모든 API를 page.route()로 모킹합니다.
 */

import { test, type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ── 출력 경로 ──────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT = path.resolve(__dirname, '../screenshots/presentation');
fs.mkdirSync(OUT, { recursive: true });

// ── 모의 데이터 ────────────────────────────────────────────────────────────
const SUBJECTS = [
  { id: 1, name: '수학', code: 'MATH', description: null },
  { id: 2, name: '영어', code: 'ENG', description: null },
  { id: 3, name: '국어', code: 'KOR', description: null },
  { id: 4, name: '과학', code: 'SCI', description: null },
  { id: 5, name: '사회', code: 'SOC', description: null },
];

const STUDENTS = [
  {
    id: 1,
    name: '김민준',
    enrollments: [{ academicYear: 2026, grade: 2, classNum: 3, studentNum: 1 }],
  },
  {
    id: 2,
    name: '이서연',
    enrollments: [{ academicYear: 2026, grade: 2, classNum: 3, studentNum: 2 }],
  },
  {
    id: 3,
    name: '박지호',
    enrollments: [{ academicYear: 2026, grade: 2, classNum: 3, studentNum: 3 }],
  },
  {
    id: 4,
    name: '최예린',
    enrollments: [{ academicYear: 2026, grade: 2, classNum: 3, studentNum: 4 }],
  },
];

const scoreOf = (studentName: string) => ({
  studentId: 1,
  studentName,
  year: 2026,
  semester: 1,
  scores: [
    {
      id: 1,
      studentId: 1,
      studentName,
      subjectId: 1,
      subjectName: '수학',
      subjectCode: 'MATH',
      year: 2026,
      semester: 1,
      score: 92,
      gradeLetter: 'A',
      rank: 3,
    },
    {
      id: 2,
      studentId: 1,
      studentName,
      subjectId: 2,
      subjectName: '영어',
      subjectCode: 'ENG',
      year: 2026,
      semester: 1,
      score: 88,
      gradeLetter: 'B',
      rank: 5,
    },
    {
      id: 3,
      studentId: 1,
      studentName,
      subjectId: 3,
      subjectName: '국어',
      subjectCode: 'KOR',
      year: 2026,
      semester: 1,
      score: 95,
      gradeLetter: 'A',
      rank: 1,
    },
    {
      id: 4,
      studentId: 1,
      studentName,
      subjectId: 4,
      subjectName: '과학',
      subjectCode: 'SCI',
      year: 2026,
      semester: 1,
      score: 78,
      gradeLetter: 'C',
      rank: 12,
    },
    {
      id: 5,
      studentId: 1,
      studentName,
      subjectId: 5,
      subjectName: '사회',
      subjectCode: 'SOC',
      year: 2026,
      semester: 1,
      score: 85,
      gradeLetter: 'B',
      rank: 7,
    },
  ],
  totalScore: 438,
  averageScore: 87.6,
  averageGradeLetter: 'B',
});

const ok = (data: unknown) => JSON.stringify({ status: 'success', data });

// ── 역할별 유저 객체 ────────────────────────────────────────────────────────
const ADMIN_USER = {
  id: 1,
  name: '김관리자',
  email: 'admin@school.kr',
  role: 'ADMIN',
};

const TEACHER_USER = {
  id: 10,
  name: '이수학',
  email: 'teacher@school.kr',
  role: 'TEACHER',
  roleEntityId: 1,
  roleDetail: {
    department: '수학과',
    currentClass: { academicYear: 2026, grade: 2, classNum: 3, isHomeroom: true },
    assignments: [
      { grade: 2, classNum: 3, subject: '수학', academicYear: 2026 },
      { grade: 1, classNum: 2, subject: '수학', academicYear: 2026 },
    ],
  },
};

const STUDENT_USER = {
  id: 20,
  name: '김민준',
  email: 'student@school.kr',
  role: 'STUDENT',
  roleEntityId: 1,
  roleDetail: {
    currentEnrollment: { academicYear: 2026, grade: 2, classNum: 3, studentNum: 1 },
  },
};

const PARENT_USER = {
  id: 30,
  name: '김부모',
  email: 'parent@school.kr',
  role: 'PARENT',
  children: [
    { id: 1, name: '김민준' },
    { id: 4, name: '김서준' },
  ],
};

// ── 헬퍼 ───────────────────────────────────────────────────────────────────

/** localStorage에 유저 + 가짜 토큰 주입 (실제 로그인 없이 인증 상태 시뮬레이션) */
async function injectUser(page: Page, user: object) {
  await page.goto('/login');
  await page.evaluate((u) => {
    localStorage.setItem('accessToken', 'mock-token-for-screenshot');
    localStorage.setItem('refreshToken', 'mock-refresh-for-screenshot');
    localStorage.setItem('user', JSON.stringify(u));
  }, user);
}

/** 모든 페이지 공통 API 모킹 */
async function mockCommon(page: Page) {
  // 401 루프 방지: refresh 실패 시 /login으로 가지 않도록 refresh 성공 모킹
  await page.route('**/api/v1/auth/refresh**', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: ok({
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh',
        expiresIn: 3600,
        user: TEACHER_USER,
      }),
    }),
  );
  // 알림 (Layout의 useNotification 훅)
  await page.route('**/api/v1/notifications**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: ok([]) }),
  );
  // 과목 목록 (성적 페이지에서 공통 사용)
  await page.route('**/api/v1/grades/subjects**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: ok(SUBJECTS) }),
  );
}

// ── 뷰포트 고정 ────────────────────────────────────────────────────────────
test.use({ viewport: { width: 1280, height: 800 } });

// ── 스크린샷 1: 로그인 페이지 ──────────────────────────────────────────────
test('01_로그인_페이지', async ({ page }) => {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}/01_login.png` });
});

// ── 스크린샷 2: 관리자 — 교사 목록 관리 ───────────────────────────────────
test('02_관리자_교사관리', async ({ page }) => {
  await mockCommon(page);
  const page_ = <T>(content: T[]) => ok({ content, totalElements: content.length, totalPages: 1 });
  await page.route('**/api/v1/admin/teachers**', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: page_([
        {
          id: 1,
          name: '이수학',
          email: 'math@s.kr',
          phone: '010-1111-2222',
          department: '수학과',
          activated: true,
          active: true,
        },
        {
          id: 2,
          name: '김영어',
          email: 'eng@s.kr',
          phone: '010-3333-4444',
          department: '영어과',
          activated: true,
          active: true,
        },
        {
          id: 3,
          name: '박체육',
          email: 'pe@s.kr',
          phone: '010-5555-6666',
          department: '체육과',
          activated: false,
          active: true,
        },
        {
          id: 4,
          name: '최과학',
          email: 'sci@s.kr',
          phone: '010-7777-8888',
          department: '과학과',
          activated: true,
          active: false,
        },
      ]),
    }),
  );
  await page.route('**/api/v1/admin/students**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: page_([]) }),
  );
  await page.route('**/api/v1/admin/parents**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: page_([]) }),
  );
  await page.route('**/api/v1/admin/classes**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: ok([]) }),
  );

  await injectUser(page, ADMIN_USER);
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}/02_admin_teacher_list.png` });
});

// ── 스크린샷 3: 교사 — 대시보드 ───────────────────────────────────────────
test('03_교사_대시보드', async ({ page }) => {
  await mockCommon(page);
  await page.route('**/api/v1/students**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: ok(STUDENTS) }),
  );

  await injectUser(page, TEACHER_USER);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}/03_teacher_dashboard.png` });
});

// ── 스크린샷 4: 교사 — 성적 관리 (학생 선택 + 성적 표 + 삭제 버튼) ────────
test('04_교사_성적관리', async ({ page }) => {
  await mockCommon(page);
  await page.route('**/api/v1/students**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: ok(STUDENTS) }),
  );
  await page.route('**/api/v1/grades/students/**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: ok(scoreOf('김민준')) }),
  );

  await injectUser(page, TEACHER_USER);
  await page.goto('/grades');
  await page.waitForLoadState('networkidle');

  // 첫 번째 학생 선택
  const studentSelect = page.locator('select').first();
  await studentSelect.selectOption({ index: 1 });
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}/04_teacher_grades.png` });
});

// ── 스크린샷 5: 교사 — 성적 등록 폼 (+ 성적 등록 버튼 클릭) ──────────────
test('05_교사_성적등록폼', async ({ page }) => {
  await mockCommon(page);
  await page.route('**/api/v1/students**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: ok(STUDENTS) }),
  );
  await page.route('**/api/v1/grades/students/**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: ok(scoreOf('김민준')) }),
  );

  await injectUser(page, TEACHER_USER);
  await page.goto('/grades');
  await page.waitForLoadState('networkidle');

  // "성적 등록" 폼 열기
  await page.getByRole('button', { name: /성적 등록/ }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/05_teacher_score_form.png` });
});

// ── 스크린샷 6: 학생 — 대시보드 (반 뱃지, "내 성적"만) ────────────────────
test('06_학생_대시보드', async ({ page }) => {
  await mockCommon(page);

  await injectUser(page, STUDENT_USER);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}/06_student_dashboard.png` });
});

// ── 스크린샷 7: 학생 — 성적 조회 (삭제 버튼 없음, 학생 선택 없음) ──────────
test('07_학생_성적조회', async ({ page }) => {
  await mockCommon(page);
  await page.route('**/api/v1/grades/students/**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: ok(scoreOf('김민준')) }),
  );

  await injectUser(page, STUDENT_USER);
  await page.goto('/grades');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}/07_student_grades.png` });
});

// ── 스크린샷 8: 학부모 — 대시보드 (자녀 선택 드롭다운) ─────────────────────
test('08_학부모_대시보드', async ({ page }) => {
  await mockCommon(page);

  await injectUser(page, PARENT_USER);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}/08_parent_dashboard.png` });
});
