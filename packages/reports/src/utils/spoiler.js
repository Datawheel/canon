module.exports = obj => Object.keys(obj)
  .reduce((acc, d) => (
    {
      ...acc,
      [d]: typeof obj[d] === "string"
        ? obj[d].replace(/[A-z0-9]*\{\{[^\}]+\}\}/g, `<span class="cr-block-skeleton ${d}">&nbsp;</span>`)
        : obj[d]
    }), {});
