import puppeteer, { Page } from "puppeteer";
import * as fs from "fs";
import { login } from "./kakuyomu";

async function run() {
  const urls: Record<string, string[]> = {
    all: [
      "https://kakuyomu.jp/my/antenna/works/all?page=1",
      "https://kakuyomu.jp/my/antenna/works/all?page=2",
      "https://kakuyomu.jp/my/antenna/works/all?page=3",
      "https://kakuyomu.jp/my/antenna/works/all?page=4",
    ],
    in_progress: [
      "https://kakuyomu.jp/my/antenna/works/labels/1177354054915143029?page=1",
    ],
    stopped: [
      "https://kakuyomu.jp/my/antenna/works/labels/1177354054938193754?page=1",
      "https://kakuyomu.jp/my/antenna/works/labels/1177354054938193754?page=2",
    ],
    completed: [
      "https://kakuyomu.jp/my/antenna/works/labels/16817330661064449003?page=1",
    ],
    stocked: [
      "https://kakuyomu.jp/my/antenna/works/labels/16817330661064459276?page=1",
    ],
    plus_one: [
      "https://kakuyomu.jp/my/antenna/works/labels/16817330661065089726?page=1",
    ],
    plus_two: [
      "https://kakuyomu.jp/my/antenna/works/labels/16817330661065095117?page=1",
    ],
  };
  const bookmarkType = urls.hasOwnProperty(process.argv[2])
    ? process.argv[2]
    : "all";

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--window-size=1280,768"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 768 });

  await login(page);

  const bookmarkUrls = await urls[bookmarkType].reduce(
    async (promiseAcc, url) => {
      const acc = await promiseAcc;
      console.log("Fetch", url);

      const resultUrls = await getBookmarkUrls(page, url);
      console.log("Result Count", resultUrls.length);

      return [...acc, ...resultUrls];
    },
    Promise.resolve([] as string[])
  );

  await browser.close();

  // ファイルに書き出す
  const json = JSON.stringify(bookmarkUrls, null, 2);
  fs.writeFileSync(`tmp/kakuyomu_bookmark_${bookmarkType}.json`, json);
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
