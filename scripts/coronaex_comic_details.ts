import * as fs from "fs";
import puppeteer, { Page } from "puppeteer";

type ComicDetail = {
  url: string;
  title: string;
  author: string;
  likeCount: number;
  latestEpisode: string;
};

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--window-size=1280,768"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 768 });

  const urls: string[] = JSON.parse(
    fs.readFileSync("tmp/coronaex_comics_urls.json", "utf8")
  );

  // 直列に処理するため for 文を使う
  const details: ComicDetail[] = [];

  for (let url of urls.slice(0, 3)) {
    console.log("Scraping URL:", url);

    details.push(await fetchComicDetail(page, url));

    await page.waitForTimeout(2000);
  }

  await browser.close();

  // ファイルに書き出す
  const json = JSON.stringify(details, null, 2);
  fs.writeFileSync("tmp/coronaex_comics_details.json", json);
}

async function fetchComicDetail(page: Page, url: string): Promise<ComicDetail> {
  await page.goto(url);

  const title = await page.$eval("h2", (element) => element.textContent || "");
  const author = await page.$eval(
    "div.flex.items-start.justify-between div.flex.flex-col.items-start > div.mb-1",
    (element) => element.textContent || ""
  );
  const likeCountStr = await page.$eval(
    'div.flex.items-center.text-xs.text-good-main > span[class="pt-[2px]"]',
    (element) => element.textContent || ""
  );
  const likeCount = parseInt(likeCountStr.replace(",", ""), 10); // カンマを除去して数値に変換
  const latestEpisode = await page.$eval(
    "div.grow.truncate.pl-3",
    (element) => element.textContent || ""
  );

  const detail: ComicDetail = {
    url: url,
    title: title,
    author: author,
    likeCount: likeCount,
    latestEpisode: latestEpisode,
  };

  return detail;
}

run().catch(console.error);
