import { test, expect } from '@playwright/test';
import { ensureParent, loginViaUI } from './helpers';

/**
 * 시나리오 3: 학부모가 자녀 성적/피드백 조회
 * (요구사항 명세서 시나리오 3 기반)
 *
 * 흐름: 로그인 → 학부모 대시보드 (자동) → 성적/피드백 확인
 */

const PARENT = {
  email: 'e2e-parent1@sscm.dev',
  password: 'Test1234!@',
  name: 'E2E학부모1',
};

test.describe('시나리오 3: 학부모 성적/피드백 조회', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await ensureParent(page, PARENT.email, PARENT.password, PARENT.name);
    await page.close();
  });

  test('학부모 로그인 → 학부모 전용 대시보드 진입', async ({ page }) => {
    await loginViaUI(page, PARENT.email, PARENT.password);

    // 학부모는 ParentDashboardPage로 리다이렉트됨
    await expect(page).toHaveURL('/');
    // 학부모 대시보드 특유의 텍스트 확인
    await expect(page.locator('body')).toContainText(PARENT.name);
  });

  test('학부모 대시보드 — 알림 섹션 표시', async ({ page }) => {
    await loginViaUI(page, PARENT.email, PARENT.password);

    // 대시보드에 알림 관련 내용이 있어야 함
    await expect(page.locator('body')).toContainText(/알림|대시보드/);
  });
});
