import { Page } from "puppeteer";

export async function login(page: Page) {
  await page.goto("https://kakuyomu.jp/login");

  await page.type(
    'input[name="email_address"]',
    process.env.KAKUYOMU_EMAIL || ""
  );
  await page.type(
    'input[name="password"]',
    process.env.KAKUYOMU_PASSWORD || ""
  );

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }),
    page.click('button[type="submit"]'),
  ]);
}
