import puppeteer, { Page } from "puppeteer";
import * as fs from "fs";

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--window-size=1280,768"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 768 });

  await login(page);

  const urls = [
    "https://kakuyomu.jp/my/antenna/works/all?page=1",
    "https://kakuyomu.jp/my/antenna/works/all?page=2",
    "https://kakuyomu.jp/my/antenna/works/all?page=3",
    "https://kakuyomu.jp/my/antenna/works/all?page=4",
  ];

  const bookmarkUrls = await urls.reduce(async (promiseAcc, url) => {
    const acc = await promiseAcc;
    console.log("Fetch", url);

    const resultUrls = await getBookmarkUrls(page, url);
    console.log("Result Count", resultUrls.length);

    return [...acc, ...resultUrls];
  }, Promise.resolve([] as string[]));

  await browser.close();

  // ファイルに書き出す
  const json = JSON.stringify(bookmarkUrls, null, 2);
  fs.writeFileSync("tmp/kakuyomu_bookmark_urls.json", json);
}

async function login(page: Page) {
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

async function getBookmarkUrls(page: Page, url: string): Promise<string[]> {
  await page.goto(url);

  const html = await page.content();

  return await page.$$eval(
    "ul.widget-antennaList li a.widget-antennaList-workInfo",
    (elements) => elements.map((element) => element.href)
  );
}

run().catch(console.error);
