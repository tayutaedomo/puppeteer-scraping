import * as fs from "fs";
import puppeteer, { Page } from "puppeteer";
import { Ranking } from "./comic-walker";

type Episode = {
  title: string;
  url: string;
};

type Detail = {
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

  for (const url of dailyUrls.slice(0, 1)) {
    await page.goto(url);
    // await page.goto(url, {timeout: 60000}); // If timeout occurred, use this line.

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

    console.log(episodes);
  }

  await browser.close();
}

run().catch(console.error);
