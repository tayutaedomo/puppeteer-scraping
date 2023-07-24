import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import * as fs from "fs";

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--window-size=1280,768"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 768 });
  // Javascript はオフにする
  await page.setJavaScriptEnabled(false);
  await page.goto("https://comic-walker.com/ranking/");

  console.log("START");

  const content = await page.content();
  const $ = cheerio.load(content);

  const urls: string[][] = [];
  $("div#rankingBox ul.rankinglist").each(function () {
    const groupUrls: string[] = [];
    $(this)
      .find("li a")
      .each(function () {
        const url = $(this).attr("href");
        if (!url) return;
        groupUrls.push(`https://comic-walker.com${url}`);
      });
    urls.push(groupUrls);
  });

  console.log("END");

  await browser.close();

  // ファイルに書き出す
  const data = {
    date: new Date().toISOString(),
    daily: urls[0],
    monthly: urls[1],
  };
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync("tmp/comicwalker_ranking.json", json);
}

run().catch(console.error);
