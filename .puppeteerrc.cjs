// Prevents `npm install` from downloading a ~300MB Chromium binary.
// scrape.js (offline data collection) is the only thing that needs a real
// browser, and it's run manually/locally, never as part of deploying the
// web app. If you need to re-scrape, run:
//   npx puppeteer browsers install chrome
// once, then `npm run scrape`.
module.exports = {
  skipDownload: true,
};
