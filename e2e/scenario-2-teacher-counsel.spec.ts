import { test, expect } from '@playwright/test';
import { ensureTeacher, loginViaUI } from './helpers';

/**
 * 시나리오 2: 교사 B가 학생 상담 내역 조회 후 후속 상담
 * (요구사항 명세서 시나리오 2 기반)
 *
 * 흐름: 로그인 → 상담 페이지 → 상담 내역 확인 → 알림 페이지
 */

const TEACHER_B = {
  email: 'e2e-teacher2@sscm.dev',
  password: 'Test1234!@',
  name: 'E2E교사2',
};

test.describe('시나리오 2: 교사 상담 내역 조회', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await ensureTeacher(page, TEACHER_B.email, TEACHER_B.password, TEACHER_B.name);
    await page.close();
  });

  test('교사 로그인 → 상담 페이지 접근', async ({ page }) => {
    await loginViaUI(page, TEACHER_B.email, TEACHER_B.password);

    await page
      .click('a[href="/counselings"], [data-testid="nav-counselings"]', { timeout: 5000 })
      .catch(() => {
        return page.goto('/counselings');
      });

    await expect(page).toHaveURL('/counselings');
    await expect(page.locator('body')).toContainText(/상담/);
  });

  test('알림 페이지 접근', async ({ page }) => {
    await loginViaUI(page, TEACHER_B.email, TEACHER_B.password);

    await page
      .click('a[href="/notifications"], [data-testid="nav-notifications"]', { timeout: 5000 })
      .catch(() => {
        return page.goto('/notifications');
      });

    await expect(page).toHaveURL('/notifications');
    await expect(page.locator('body')).toContainText(/알림/);
  });
});
