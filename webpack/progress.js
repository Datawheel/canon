const readline = require("readline");

module.exports = build => (percentage, msg, current) => {
  if (process.stdout.isTTY && percentage < 1) {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`${build} webpack: ${(percentage * 100).toFixed(0)}% ${msg} ${current}`);
  }
  else if (percentage === 1) {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
  }
};
