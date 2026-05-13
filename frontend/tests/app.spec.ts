import { test, expect, Page } from '@playwright/test';

const TRANSCRIPT = `Therapist: How are you feeling today?
Client: I've been feeling anxious lately.
Therapist: It sounds like that's been difficult for you. What does the anxiety feel like?
Client: Like a constant worry I can't shake.
Therapist: What situations tend to bring it on?
Client: Mostly work, I think.`;

const email = `test+${Date.now()}@test.com`;
const password = 'testpassword123';

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('**/');
}

test.describe('TherapyLens E2E', () => {
  test.describe.configure({ mode: 'serial' });

  test('1. auth guard redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/sessions');
    await expect(page).toHaveURL(/\/login/);
  });

  test('2. register a new account', async ({ page }) => {
    await page.goto('/login');

    // Switch to register mode
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page).toHaveURL('http://localhost:3000/');
    await expect(page.getByRole('heading', { name: 'Upload Therapy Transcript' })).toBeVisible();
  });

  test('3. upload a transcript via text paste', async ({ page }) => {
    await signIn(page, email, password);
    await expect(page).toHaveURL('http://localhost:3000/');

    await page.getByPlaceholder('Paste your therapy transcript here...').fill(TRANSCRIPT);
    await page.getByRole('button', { name: 'Upload Text' }).click();

    await expect(page.getByText('Upload successful!')).toBeVisible({ timeout: 10000 });
  });

  test('4. session list shows uploaded session with a status badge', async ({ page }) => {
    await signIn(page, email, password);
    await page.goto('/sessions');

    await expect(page.getByRole('heading', { name: 'Therapy Sessions' })).toBeVisible();

    // At least one session row exists
    const sessionLink = page.locator('a[href^="/sessions/"]').first();
    await expect(sessionLink).toBeVisible({ timeout: 5000 });

    // A status badge is present
    const badge = page.locator('text=/queued|processing|completed|failed/').first();
    await expect(badge).toBeVisible();
  });

  test('5. session detail page loads', async ({ page }) => {
    await signIn(page, email, password);
    await page.goto('/sessions');

    const sessionLink = page.locator('a[href^="/sessions/"]').first();
    await sessionLink.click();

    await expect(page).toHaveURL(/\/sessions\/\d+/);
    await expect(page.getByText('← Back to Sessions')).toBeVisible();

    // Either processing message or score summary should be visible
    const isProcessing = await page.getByText('Processing your transcript...').isVisible();
    const hasScores = await page.getByRole('heading', { name: 'Score Summary' }).isVisible();
    expect(isProcessing || hasScores).toBeTruthy();
  });

  test('6. sign out clears auth and redirects to /login', async ({ page }) => {
    await signIn(page, email, password);
    await expect(page).toHaveURL('http://localhost:3000/');

    await page.getByText('Sign out').click();
    await expect(page).toHaveURL(/\/login/);

    // Token is gone — protected routes redirect back to login
    await page.goto('/sessions');
    await expect(page).toHaveURL(/\/login/);
  });

});
