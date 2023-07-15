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
    fs.readFileSync("tmp/coronaex_comic_urls.json", "utf8")
  );

  // 直列に処理するため for 文を使う
  for (let url of urls) {
    console.log("Scraping:", url);

    const detail = await fetchComicDetailIfNotExists(page, url);
    if (detail) {
      const file_name = writeDetail(detail);
      console.log("Write to file:", file_name);

      await page.waitForTimeout(3000);
    } else {
      console.log("Skipped");
    }
  }

  await browser.close();
}

async function fetchComicDetailIfNotExists(
  page: Page,
  url: string
): Promise<ComicDetail | null> {
  const id = url.split("/").pop();
  const file_name = `tmp/coronaex_detail_${id}.json`;
  if (fs.existsSync(file_name)) {
    return null;
  } else {
    return await fetchComicDetail(page, url);
  }
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

  console.log("Scraping:", detail.url);

  return detail;
}

function writeDetail(detail: ComicDetail): string {
  const json = JSON.stringify(detail, null, 2);
  const id = detail.url.split("/").pop();
  const file_name = `tmp/coronaex_detail_${id}.json`;
  fs.writeFileSync(file_name, json);
  return file_name;
}

run().catch(console.error);
