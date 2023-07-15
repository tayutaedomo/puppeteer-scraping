import * as fs from "fs";
import puppeteer, { Page } from "puppeteer";

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--window-size=1280,768"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 768 });
  await page.goto("https://to-corona-ex.com/comics");

  console.log("START");

  let previousComicCount = 0;
  while (true) {
    const comicsLinks = await getComicLinks(page);
    console.log("Link Count:", comicsLinks.length);

    if (comicsLinks.length === previousComicCount) {
      break; // 差分がなければループ終了
    } else {
      previousComicCount = comicsLinks.length;
    }

    try {
      // もっと見るボタンがあるか確認は 2 秒待たないとダメっぽい
      await page.waitForXPath("//button[contains(., 'もっと見る')]", {
        timeout: 2000,
      });

      const moreButton = await page.$x("//button[contains(., 'もっと見る')]");
      if (moreButton.length > 0) {
        // もっと見るを画面内に収めるためにスクロール
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });

        // もっと見るをクリック
        const moreButtonHandle = moreButton[0];
        await page.evaluate(
          (btn) => (btn as HTMLElement).click(),
          moreButtonHandle
        );

        // waitForNavigation がうまく動かないので、とりあえず 10 秒待つ
        // await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 });
        await page.waitForTimeout(10000);
      } else {
        break;
      }
    } catch (e) {
      // もっと見るがなくなったケースでエラーになる
      console.log(e);
      break;
    }
  }

  console.log("END");

  const urls = await getComicLinks(page);
  console.log("URL Count:", urls.length);

  await browser.close();

  // ファイルに書き出す
  const json = JSON.stringify(urls, null, 2);
  fs.writeFileSync("tmp/coronaex_comic_urls.json", json);
}

async function getComicLinks(page: Page): Promise<string[]> {
  const urls = await page.$$eval('[role="list"] a[href]', (links) =>
    links.map((a) => a.href)
  );
  return urls.filter((url) =>
    /^https:\/\/to-corona-ex\.com\/comics\/\d+$/.test(url)
  );
}

run().catch(console.error);
