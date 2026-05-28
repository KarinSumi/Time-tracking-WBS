import { chromium, Page } from '@playwright/test';
import { startCapture, stopCapture } from 'chrome-devtools-mcp';
import * as fs from 'fs';
import * as path from 'path';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function recordModule(name: string, action: (page: Page) => Promise<void>) {
  console.log(`Starting ${name}...`);
  const videoDir = path.join(__dirname, 'videos');
  // Ensure the videos directory exists
  fs.mkdirSync(videoDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  await startCapture(page, path.join(videoDir, `${name}.webm`));
  
  try {
    await action(page);
    await delay(1000);
  } catch (err) {
    console.error(`Failed on ${name}:`, err);
  } finally {
    await stopCapture(page);
    await context.close();
    await browser.close();
    console.log(`Saved ${path.join(videoDir, `${name}.webm`)}`);
  }
}

async function login(page: Page, url: string, email: string) {
  await page.goto(`${url}/login`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button:has-text("Sign In")');
  await delay(1000);
}

async function main() {
  const url = 'http://localhost:5173';
  const email = `jane_${Date.now()}@example.com`;

  await recordModule('01_register_account', async (page) => {
    await page.goto(`${url}/login`);
    await page.goto(`${url}/signup`);
    await page.waitForSelector('#register-name');
    await page.fill('#register-name', 'Jane Smith');
    await page.fill('#register-email', email);
    await page.fill('#register-org', 'Globex');
    await page.fill('#register-password', 'Password123!');
    await page.fill('#register-confirm', 'Password123!');
    await page.check('input[type="checkbox"]');
    await delay(1000);
    await page.click('#register-submit-btn');
    await delay(3000);
  });

  await recordModule('02_login_dashboard', async (page) => {
    await login(page, url, email);
    await delay(2000);
    try { 
      const nextBtn = page.getByRole('button', { name: /Next|Got it/i });
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await delay(1000);
        if (await nextBtn.isVisible()) await nextBtn.click();
      }
    } catch (e) {}
    await delay(2000);
  });

  await recordModule('03_project_setup', async (page) => {
    await login(page, url, email);
    await page.goto(`${url}/projects`);
    await delay(1000);
    try {
      await page.click('text=New Project');
      await delay(1000);
      await page.fill('input[placeholder="Project name..."]', 'Project Alpha');
      await delay(1000);
      await page.keyboard.press('Enter');
      await delay(2000);
    } catch (e) {}
  });

  await recordModule('04_task_planning', async (page) => {
    await login(page, url, email);
    await page.goto(`${url}/plans`);
    await delay(1000);
    try {
      await page.click('text=New Plan');
      await delay(1000);
      await page.fill('input[placeholder="Search plans..."]', 'Frontend Setup');
      await delay(2000);
    } catch (e) {}
  });

  await recordModule('05_team_onboarding', async (page) => {
    await login(page, url, email);
    await page.goto(`${url}/team`);
    await delay(1000);
    try {
      await page.click('text=Invite Member');
      await delay(1000);
      await page.fill('input[type="email"]', 'newguy@globex.com');
      await delay(2000);
    } catch (e) {}
  });

  await recordModule('06_time_logging', async (page) => {
    await login(page, url, email);
    await page.goto(`${url}/logs`);
    await delay(1000);
    try {
      await page.click('text=Log Time');
      await delay(1000);
      await page.fill('input[type="number"]', '2');
      await delay(1000);
      await page.click('text=Save Entry');
      await delay(2000);
    } catch (e) {}
  });

  await recordModule('07_capacity_analytics', async (page) => {
    await login(page, url, email);
    await page.goto(`${url}/reports`);
    await delay(1000);
    try {
      await page.mouse.wheel(0, 500);
      await delay(2000);
    } catch (e) {}
  });

  await recordModule('08_superadmin_config', async (page) => {
    await login(page, url, email);
    await page.goto(`${url}/admin`);
    await delay(1000);
    try {
      await page.mouse.wheel(0, 300);
      await delay(2000);
    } catch (e) {}
  });
}

main().catch(console.error);
