const puppeteer = require("puppeteer");

const style = `
<style>
  .container {
    color: #444;
    font-family: 'Helvetica', 'Arial', sans-serif;
    font-size: 8px;
    text-align: center;
    width: 100%;
  }
  .pageNumber,
  .totalPages,
  .title {
    font-size: 8px;
  }
  .url {
    font-size: 6px;
  }
</style>
`;

const pdfOptions = {
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
  format: "Letter",
  margin: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  },
  printBackground: true,
  scale: 1
};

const generate = async path => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.setViewport({
    deviceScaleFactor: 1,
    height: Math.floor(1100 * 0.75),
    width: Math.floor(850 * 0.75)
  });
  await page.emulateMediaType("print");
  await page.goto(path, {waitUntil: "networkidle2"});
  const pdf = await page.pdf(pdfOptions);
  await browser.close();
  return pdf;
};

module.exports = function(app) {

  app.post("/api/pdf", async(req, res) => {
    res.connection.setTimeout(1000 * 60 * 5);
    const path = `${req.protocol}://${req.headers.host}/${req.body.path}`;
    const pdf = await generate(path);
    res.set({"Content-Type": "application/pdf", "Content-Length": pdf.length});
    return res.send(pdf);
  });
};
