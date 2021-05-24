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

  parentPort.on("message", async message => {
    if (message.type === "TERMINATE") {
      await browser.close();
      parentPort.postMessage("terminated");
    }
    if (message.type === "NEXT_JOB") {
      await jobHandler(message);
    }
  });
  parentPort.postMessage("ready");

  /**
   * @param {object} param
   * @param {any} param.job
   * @param {MessagePort} param.port
   */
  async function jobHandler({job, port}) {
    const page = await browser.newPage();
    const jobResult = {status: "ERROR"};

    try {
      const result = await executeTests(page, job);
      jobResult.data = result;
      jobResult.status = result.test_na.length === 0 ? "SUCCESS" : "FAILURE";
    }
    catch (error) {
      jobResult.error = error.message;
      jobResult.status = "ERROR";
    }
    finally {
      await page.close();
    }
    port.postMessage(jobResult);
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
