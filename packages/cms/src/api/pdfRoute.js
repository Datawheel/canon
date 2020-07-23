const puppeteer = require("puppeteer");

const pdfOptions = {
  printBackground: true
};

const generate = async path => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto(path, {waitUntil: "networkidle2"});
  page.emulateMediaType("print");
  const pdf = await page.pdf(pdfOptions);
  await browser.close();
  return pdf;
};

module.exports = function(app) {

  app.post("/api/pdf", async(req, res) => {
    const path = `${req.protocol}://${req.headers.host}/${req.body.path}`;
    const pdf = await generate(path);
    res.set({"Content-Type": "application/pdf", "Content-Length": pdf.length});
    return res.send(pdf);
  });
};
