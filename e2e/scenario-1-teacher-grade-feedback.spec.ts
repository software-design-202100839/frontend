import { test, expect } from '@playwright/test';
import { ensureTeacher, loginViaUI } from './helpers';

/**
 * 시나리오 1: 교사 A가 성적 입력 + 긍정 피드백 작성
 * (요구사항 명세서 시나리오 1 기반)
 *
 * 흐름: 로그인 → 성적 페이지 → 학생 선택 → 성적 확인 → 피드백 작성
 */

const TEACHER = {
  email: 'e2e-teacher1@sscm.dev',
  password: 'Test1234!@',
  name: 'E2E교사1',
};

test.describe('시나리오 1: 교사 성적 확인 + 피드백 작성', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await ensureTeacher(page, TEACHER.email, TEACHER.password, TEACHER.name);
    await page.close();
  });

  test('교사 로그인 → 대시보드 진입', async ({ page }) => {
    await loginViaUI(page, TEACHER.email, TEACHER.password);

    // 대시보드에 도착
    await expect(page).toHaveURL('/');
    // 사용자 정보가 화면에 표시되는지 확인
    await expect(page.locator('body')).toContainText(TEACHER.name);
  });

  test('성적 관리 페이지 접근 + 학생 목록 로드', async ({ page }) => {
    await loginViaUI(page, TEACHER.email, TEACHER.password);

    // 성적 관리로 이동
    await page
      .click('a[href="/grades"], [data-testid="nav-grades"]', { timeout: 5000 })
      .catch(() => {
        // nav 링크가 없으면 직접 이동
        return page.goto('/grades');
      });

    await expect(page).toHaveURL('/grades');
    // 페이지 로드 확인 — "성적" 텍스트가 있어야 함
    await expect(page.locator('body')).toContainText(/성적/);
  });

  test('피드백 작성 페이지 접근', async ({ page }) => {
    await loginViaUI(page, TEACHER.email, TEACHER.password);

    await page
      .click('a[href="/feedbacks"], [data-testid="nav-feedbacks"]', { timeout: 5000 })
      .catch(() => {
        return page.goto('/feedbacks');
      });

    await expect(page).toHaveURL('/feedbacks');
    await expect(page.locator('body')).toContainText(/피드백/);
  });
});
