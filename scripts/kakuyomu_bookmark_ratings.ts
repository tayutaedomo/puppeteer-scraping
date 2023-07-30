import puppeteer, { Page } from "puppeteer";
import * as fs from "fs";
import { login } from "./kakuyomu";

type BookmarkTypes =
  | "all"
  | "in_progress"
  | "completed"
  | "stopped"
  | "stocked"
  | "plus_onw"
  | "plus_two";
type BookmarkUrls = Record<BookmarkTypes, string[]>;

type Rating = {
  date: string;
  url: string;
  novelId: string;
  title: string;
  author: string;
  rating: number;
  totalRating: number;
};

async function run() {
  const urls = loadBookmarkUrlList();

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--window-size=1280,768"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 768 });

  await login(page);

  for (const url of urls) {
    console.log("Scraping:", url);

    const detail = await fetchRatingIfNotExists(page, url);
    if (detail) {
      const file_name = writeRating(detail);
      console.log("Write to file:", file_name);

      await page.waitForTimeout(3000);
    } else {
      console.log("Skipped");
    }
  }

  await browser.close();
}

function loadBookmarkUrlList(): string[] {
  const json = fs.readFileSync("tmp/kakuyomu_bookmarks_type.json", "utf8");
  const bookmarkUrls: BookmarkUrls = JSON.parse(json);
  return Object.values(bookmarkUrls).flat();
}

async function fetchRatingIfNotExists(
  page: Page,
  url: string
): Promise<Rating | null> {
  const file_name = createFileName(createNovelIdFromURl(url));
  if (fs.existsSync(file_name)) {
    return null;
  } else {
    return await fetchRating(page, url);
  }
}

async function fetchRating(page: Page, url: string): Promise<Rating> {
  await page.goto(url, { timeout: 90000 }); // If timeout occurred, use this line.

  const novelId = createNovelIdFromURl(url);
  const title = await page.$eval("#workTitle a", (el) => el.innerText);
  const author = await page.$eval(
    "#workAuthor-activityName a",
    (el) => el.innerText
  );
  const totalRatingString = await page.$eval(
    ".js-total-review-point-element",
    (el) => el.textContent
  );
  const totalRating = totalRatingString
    ? parseInt(totalRatingString.replace(/,/g, ""), 10)
    : 0;
  const rating = await fetchRatingValue(page);

  return {
    date: new Date().toISOString(),
    url,
    novelId,
    title,
    author,
    rating,
    totalRating,
  };
}

function createNovelIdFromURl(url: string): string {
  return url.replace("https://kakuyomu.jp/works/", "");
}

async function fetchRatingValue(page: Page): Promise<number> {
  return await page.$$eval(
    ".widget-workReview-pointsRating .js-icon.isActive",
    (elements) => {
      let totalStars = 0;

      for (const element of elements) {
        const starLabel = element.getAttribute("data-point-label");

        switch (starLabel) {
          case "Good!":
            totalStars += 1;
            break;
          case "Very Good!!":
            totalStars += 2;
            break;
          case "Excellent!!!":
            totalStars += 3;
            break;
        }
      }

      return totalStars;
    }
  );
}

function writeRating(rating: Rating): string {
  const json = JSON.stringify(rating, null, 2);
  const file_name = createFileName(rating.novelId);
  fs.writeFileSync(file_name, json);
  return file_name;
}

function createFileName(novelId: string): string {
  return `tmp/kakuyomu_rating_${novelId}.json`;
}

run().catch(console.error);
