module.exports = {
  pageAutoScroll,
  xhrTestHandler
};

/**
 * This test monitors the requests done after loading and logs error status codes.
 *
 * @param {import("puppeteer").Page} page
 * @returns {Promise<{url: string, code?: number, error: string}>}
 */
async function xhrTestHandler(page) {
  return new Promise(resolve => {
    const failedRequests = [];

    page.on("requestfinished", async request => {
      const failure = request.failure();
      if (failure) {
        failedRequests.push({url: request.url(), error: failure.errorText});
      }
      const response = request.response();
      if (response && !response.ok()) {
        failedRequests.push({
          url: response.url(),
          code: response.status(),
          error: await response.text()
        });
      }
    });

    page.evaluate(pageAutoScroll).then(() => {
      resolve(failedRequests);
    });
  });
}

/**
 * This function is serialized and sent for evaluation to the page context.
 *
 * @returns {Promise<void>}
 */
function pageAutoScroll() {
  return new Promise(resolve => {
    let totalHeight = 0;
    const distance = 400;
    const timer = setInterval(() => {
      const scrollHeight = document.body.scrollHeight;
      window.scrollBy(0, distance);
      totalHeight += distance;

      if (totalHeight >= scrollHeight) {
        clearInterval(timer);
        resolve();
      }
    }, 200);
  });
}
