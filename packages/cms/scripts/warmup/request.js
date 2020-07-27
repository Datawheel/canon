#!/usr/bin/env node

const {parentPort} = require("worker_threads");

const {default: axios} = require("axios");
// const puppeteer = require("puppeteer");

parentPort.on("message", async({workData, port}) => {
  let error;
  let status = "ERROR";

  const response = await axios(workData).catch(err => {
    error = err;
    return err.response;
    // console.error(`Request to ${response.config.url} failed with status code ${response.status}:\n`, response.data);
  });

  if (response && response.status > 199 && response.status < 300) {
    status = "SUCCESS";
  }

  port.postMessage({error, status});
});

/** */
// async function browserRequest() {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   await page.setDefaultNavigationTimeout(config.maxTimeoutPerPage * 1000);
//   page.on("error", msg => {
//     throw msg;
//   });

//   page.on("load", async() => {
//     console.info(`✅ Page is loaded ${url}`);
//     await pool.query("INSERT INTO urls (url, success) VALUES ($1, 1) ON CONFLICT (url) DO UPDATE SET success = 1, last_fetch = $2", [urlForDb, new Date()], pgErrCatch);
//   });


//   while (urls.length) {
//     var url = urls.pop();
//     var urlForDb = url.substring(0, 255);
//     if (url !== urlForDb) {
//       console.log(`⚠️ URL larger than 255 characters: ${url}`);
//     }
//     for (const profile of Object.keys(config.browserSpecificExtraHttpHeaders)) {
//       await page.setExtraHTTPHeaders(config.browserSpecificExtraHttpHeaders[profile]);

//       await page.goto(url, {waitUntil: `networkidle${  config.networkIdleLevel}`}).catch(async() => {
//         console.log(`❌ ERROR! ${url}`);
//         await pool.query("INSERT INTO urls (url, success) VALUES ($1, 0) ON CONFLICT (url) DO UPDATE SET success = 0, last_fetch = $2", [urlForDb, new Date()], pgErrCatch);
//         timeoutCount++;
//       });

//       /*
//              * Test for presence of H1 hero page title
//              *  (if found) Test whether it is N/A
//              */
//       const heroTitlePath = "h1.cp-section-heading.cp-hero-heading.u-font-xxl";
//       await page.waitForSelector(heroTitlePath, {timeout: 3000})
//         .catch(async error => console.error(`⚠️ ${error.name}: ${error.message}`));
//       const titleElement = await page.$(heroTitlePath);
//       if (!titleElement) {
//         console.log(`💩 (${url}) hero title not found`);
//         await pool.query("INSERT INTO errors (url, reason) VALUES ($1, $2) ON CONFLICT (url) DO UPDATE SET last_fetch = $3", [urlForDb, "hero title not found", new Date()], pgErrCatch);
//       }
//       else {
//         const titleText = await page.evaluate(titleElement => titleElement.textContent, titleElement);
//         if (titleText.includes("N/A")) {
//           console.log(`💩 (${url}) N/A hero title`);
//           await pool.query("INSERT INTO errors (url, reason) VALUES ($1, $2) ON CONFLICT (url) DO UPDATE SET last_fetch = $3", [urlForDb, "N/A hero title", new Date()]), pgErrCatch;
//         }
//       }

//       /*
//              * Test for presence of hero stats section
//              */
//       const heroStatsPath = ".cp-hero-inner > .cp-hero-caption > .cp-hero-stat-group-wrapper";
//       await page.waitForSelector(heroStatsPath, {timeout: 1000})
//         .catch(async error => console.error(`⚠️ ${error.name}: ${error.message}`));
//       const heroStatsEl = await page.$(heroStatsPath);
//       if (!heroStatsEl) {
//         console.log(`💩 (${url}) hero stats not found`);
//         await pool.query("INSERT INTO errors (url, reason) VALUES ($1, $2) ON CONFLICT (url) DO UPDATE SET last_fetch = $3", [urlForDb, "hero stats not found", new Date()], pgErrCatch);
//       }

//       /*
//              * Iterate over all instances of stats elements and check whether
//              * they are N/A. If so log the error along with the label.
//              */
//       const statElements = await page.$$(".cp-stat-value > .cp-stat-value-text");
//       for (let stati = 0; stati < statElements.length; stati++) {
//         const statElement = statElements[stati];
//         const statElementText = await page.evaluate(statElement => statElement.textContent, statElement);
//         if (statElementText === "N/A") {
//           // get state element parent
//           const statParentEl = (await statElement.$x(".."))[0];
//           // from parent get previous sibling (2x)
//           const statParentPrevSiblingEl = await page.evaluateHandle(el => el.previousElementSibling.previousElementSibling, statParentEl);
//           const statLabelText = await page.evaluate(statLabelElement => statLabelElement.textContent, statParentPrevSiblingEl);
//           console.log(`💩 (${url}) N/A stat: "${statLabelText}"`);
//           await pool.query("INSERT INTO errors (url, reason) VALUES ($1, $2) ON CONFLICT (url) DO UPDATE SET last_fetch = $3", [urlForDb, `N/A stat: "${statLabelText}"`, new Date()], pgErrCatch);
//         }
//       }

//       tryCount++;

//     }
//   }

//   await browser.close();
// }
