import { Page } from '@playwright/test';

const API_BASE = (process.env.BASE_URL || 'http://localhost:8080') + '/api/v1';

/** 교사 계정으로 회원가입 (이미 존재하면 무시) */
export async function ensureTeacher(page: Page, email: string, password: string, name: string) {
  try {
    const res = await page.request.post(`${API_BASE}/auth/signup`, {
      data: {
        email,
        password,
        name,
        role: 'TEACHER',
        roleDetail: { department: '수학과' },
      },
    });
    // 409 = 이미 존재 → 정상
    if (res.status() !== 200 && res.status() !== 409) {
      console.warn(`Teacher signup returned ${res.status()}`);
    }
  } catch {
    // 이미 존재
  }
}

/** 학부모 계정으로 회원가입 (이미 존재하면 무시) */
export async function ensureParent(page: Page, email: string, password: string, name: string) {
  try {
    await page.request.post(`${API_BASE}/auth/signup`, {
      data: { email, password, name, role: 'PARENT', roleDetail: {} },
    });
  } catch {
    // 이미 존재
  }
}

/** UI를 통해 로그인 */
export async function loginViaUI(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
  // 대시보드로 리다이렉트 대기
  await page.waitForURL('/', { timeout: 10000 });
}

/** API로 로그인하고 localStorage에 토큰 저장 (빠른 setup용) */
export async function loginViaAPI(page: Page, email: string, password: string) {
  const res = await page.request.post(`${API_BASE}/auth/login`, {
    data: { email, password },
  });
  const body = await res.json();
  const { accessToken, refreshToken, user } = body.data;

  await page.goto('/login');
  await page.evaluate(
    ({ accessToken, refreshToken, user }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    },
    { accessToken, refreshToken, user },
  );
}
