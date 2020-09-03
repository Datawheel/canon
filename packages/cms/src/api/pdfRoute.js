const puppeteer = require("puppeteer");
const {assign} = require("d3plus-common");

const style = `
<style>
  .container {
    color: #444;
    font-family: 'Helvetica', 'Arial', sans-serif;
    font-size: 7px;
    text-align: center;
    width: 100%;
  }
  .pageNumber,
  .totalPages,
  .title {
    font-size: 7px;
  }
  .url {
    font-size: 5px;
  }
</style>
`;

const defaultOptions = {
  displayHeaderFooter: true,
  footerTemplate: `
${style}
<div class="container">
  <span class="pageNumber"></span> of <span class="totalPages"></span>
</div>`,
  headerTemplate: `
${style}
<div class="container">
  <div class="title"></div>
  <div class="url"></div>
</div>`,
  margin: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  },
  printBackground: true
};

const generate = async(path, userOptions = {}) => {

  const width = 1200;
  const height = Math.round(width / 8.5 * 11);

  const browser = await puppeteer.launch({
    args: [
      `--window-size=${width},${height}`
    ],
    defaultViewport: null,
    headless: true
  });

  const page = await browser.newPage();

  await page.goto(path, {waitUntil: "networkidle2"});
  const pdf = await page.pdf(assign({width, height}, defaultOptions, userOptions));

  await browser.close();

  return pdf;
};

module.exports = function(app) {

  app.post("/api/pdf", async(req, res) => {
    res.connection.setTimeout(1000 * 60 * 5);
    const path = `${req.protocol}://${req.headers.host}/${req.body.path}`;
    const pdf = await generate(path, req.body.pdfOptions);
    res.set({"Content-Type": "application/pdf", "Content-Length": pdf.length});
    return res.send(pdf);
  });
};
