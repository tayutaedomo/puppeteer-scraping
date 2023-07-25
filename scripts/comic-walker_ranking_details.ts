import * as fs from "fs";
import puppeteer, { Page } from "puppeteer";
import { Ranking } from "./comic-walker";

type Episode = {
  title: string;
  url: string;
};

type Detail = {
  date: string;
  url: string;
  title: string;
  author: string;
  likeCount: number;
  latestEpisode: string;
  episodes: Episode[];
};

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--window-size=1280,768"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 768 });

  const ranking: Ranking = JSON.parse(
    fs.readFileSync("tmp/comic-walker_ranking.json", "utf8")
  );

  const dailyUrls = ranking.dailyUrls;
  for (const url of dailyUrls) {
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
): Promise<Detail | null> {
  const file_name = createFileName(url);
  if (fs.existsSync(file_name)) {
    return null;
  } else {
    return await fetchComicDetail(page, url);
  }
}

async function fetchComicDetail(page: Page, url: string): Promise<Detail> {
  await page.goto(url, { timeout: 60000 }); // If timeout occurred, use this line.

  const title = await page.$eval(
    ".comicIndex-box h1",
    (element) => element.textContent || ""
  );

  const latestEpisode = await page.$eval(
    ".comicIndex-title",
    (element) => element.textContent || ""
  );

  const authors = await page.evaluate(() => {
    const authorLinks = Array.from(document.querySelectorAll(".acItem-copy a"));

    return authorLinks.map((link) => link.textContent);
  });

  const episodes: Episode[] = await page.$$eval(
    "ul.acBacknumber-list > li",
    (listItems) => {
      return listItems.map((li) => {
        const linkElement = li.querySelector("a");
        const titleElement = li.querySelector("span.acBacknumber-title");

        return {
          title: titleElement?.textContent || "",
          url: linkElement?.href || "",
        };
      });
    }
  );

  return {
    date: new Date().toISOString(),
    url,
    title,
    author: authors.join(", "),
    likeCount: 0,
    latestEpisode,
    episodes,
  };
}

function writeDetail(detail: Detail): string {
  const json = JSON.stringify(detail, null, 2);
  const file_name = createFileName(detail.url);
  fs.writeFileSync(file_name, json);
  return file_name;
}

function createFileName(url: string): string {
  const parts = url.split("/");
  const id = parts[parts.length - 2];
  return `tmp/comic-walker_detail_${id}.json`;
}

run().catch(console.error);
