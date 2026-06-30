import puppeteer from "puppeteer";
import fsPromises from "fs/promises";

async function scrapeLeetcodeProblems() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/114.0.5735.199 Safari/537.36"
  );

  await page.goto("https://leetcode.com/problemset/", {
    waitUntil: "domcontentloaded",
  });

  const problemSelector =
    "a.group.flex.flex-col.rounded-\\[8px\\].duration-300";

  let allProblems = [];
  let prevCount = 0;
  const TARGET = 1500;

  while (allProblems.length < TARGET) {
    await page.evaluate((sel) => {
      const currProblemsOnPage = document.querySelectorAll(sel);

      if (currProblemsOnPage.length) {
        currProblemsOnPage[currProblemsOnPage.length - 1].scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, problemSelector);

    await page.waitForFunction(
      (sel, prev) => document.querySelectorAll(sel).length > prev,
      {},
      problemSelector,
      prevCount
    );

    allProblems = await page.evaluate((sel) => {
      const nodes = Array.from(document.querySelectorAll(sel));

      return nodes.map((el) => ({
        title: el
          .querySelector(".ellipsis.line-clamp-1")
          ?.textContent.trim()
          .split(". ")[1],
        url: el.href,
      }));
    }, problemSelector);

    prevCount = allProblems.length;
  }

  allProblems = allProblems.slice(0, TARGET);

  const problemsWithDescriptions = [];

  const problemPage = await browser.newPage();

  for (let i = 0; i < allProblems.length; i++) {
    const { title, url } = allProblems[i];


    try {
      await problemPage.goto(url, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      // console.log(await problemPage.title());

      await problemPage.waitForSelector(
        '[data-track-load="description_content"]',
        { timeout: 15000 }
      );

      let description = await problemPage.evaluate(() => {
        const descriptionDiv = document.querySelector(
          '[data-track-load="description_content"]'
        );

        if (!descriptionDiv) {
          return null;
        }

        return descriptionDiv.innerText.trim();
      });

      if (description) {
        problemsWithDescriptions.push({
          title,
          url,
          description,
        });
      }

      console.log(
        `${i + 1}/${TARGET} | ${title} ${description ? "✅" : "❌"}`
      );
    } catch (err) {
      console.error(`Error fetching description for ${title} (${url}):`, err);
    } finally {
      // await problemPage.close();
    }
  }

  await problemPage.close();

  await fsPromises.mkdir("./problems", { recursive: true });

  await fsPromises.writeFile(
    "./problems/leetcode_problems.json",
    JSON.stringify(problemsWithDescriptions, null, 2)
  );

  await browser.close();
}

async function scrapeCodeforcesProblems() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/114.0.5735.199 Safari/537.36"
  );

  const problems = [];
  const TARGET = 75;

  for (let i = 0; i <= TARGET; i++) {
    const url = `https://codeforces.com/problemset/page/${i}`;

    await page.goto(url, { waitUntil: "domcontentloaded" });

    const problemSelector =
      "table.problems tr td:nth-of-type(2) > div:first-of-type > a";

    const links = await page.evaluate((sel) => {
      const anchors = document.querySelectorAll(sel);

      return Array.from(anchors).map((a) => a.href);
    }, problemSelector);

    for (let i = 0; i < links.length; i++) {
      const link = links[i];

      try {
        await page.goto(link, { waitUntil: "domcontentloaded" });

        const { title, description } = await page.evaluate(() => {
          const title = document
            .querySelector(".problem-statement .title")
            .textContent.split(". ")[1];

          const description = document.querySelector(
            ".problem-statement > div:nth-of-type(2)"
          ).textContent;

          return { title, description };
        });

        problems.push({
          title,
          url: link,
          description,
        });
      } catch (err) {
        console.warn(`❌ Failed to scrape ${link}: ${err.message}`);
      }
    }
  }

  await fsPromises.mkdir("./problems", { recursive: true });

  await fsPromises.writeFile(
    "./problems/codeforces_problems.json",
    JSON.stringify(problems, null, 2)
  );

  await browser.close();
}

// scrapeCodeforcesProblems();

scrapeLeetcodeProblems();
