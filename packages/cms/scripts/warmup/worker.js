#!/usr/bin/env node
/* eslint-disable comma-dangle */

const {parentPort} = require("worker_threads");
const puppeteer = require("puppeteer");
const {naTestHandler} = require("./test_na");

initWorker();

/**
 * Starts the environment for the worker.
 * This means start a puppeteer.Browser instance before start receiving requests.
*/
async function initWorker() {
  const browser = await puppeteer.launch();

  parentPort.on("message", messageHandler);
  parentPort.postMessage("ready");

  /**
   * @param {object} param
   * @param {any} param.job
   * @param {MessagePort} param.port
   */
  async function messageHandler({job, port}) {
    const page = await browser.newPage();

    try {
      const result = await executeTests(page, job);
      const status = result.test_na.length === 0 ? "SUCCESS" : "FAILURE";
      port.postMessage({status, data: result});
    }
    catch (error) {
      port.postMessage({status: "ERROR", error: error.message});
    }

    await page.close();
  }
}

/**
 * @param {puppeteer.Page} page
 * @param {object} job
 * @param {Record<"username" | "password", string>} options.auth
 * @param {Record<string, string>} options.headers
 * @param {string} options.url
 */
async function executeTests(page, job) {
  await page.setDefaultNavigationTimeout(job.maxTimeoutPerPage * 1000);
  await page.setExtraHTTPHeaders(job.headers);
  await page.setViewport({width: 1280, height: 720});

  if (job.username && job.password) {
    await page.authenticate({username: job.username, password: job.password});
  }

  page.on("error", error => {
    throw error;
  });

  const url = job.baseURL.replace(/:(\w+)\b/g, (_, key) => job[key]);
  await page.goto(url, {
    waitUntil: `networkidle${job.networkIdleLevel}`
  });

  // Wait for the Profile to load completely
  await page.waitForSelector("#Profile", {timeout: 3000});

  const results = await Promise.all([
    // Look for N/A in the content
    naTestHandler(page),
  ]);

  return {
    url: page.url(),
    test_na: results[0],
  };
}
