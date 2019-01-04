const readline = require("readline");

module.exports = (percentage, msg, current, active, modulepath) => {
  if (process.stdout.isTTY && percentage < 1) {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    modulepath = modulepath ? ` …${modulepath.substr(modulepath.length - 30)}` : "";
    current = current ? ` ${current}` : "";
    active = active ? ` ${active}` : "";
    process.stdout.write(`${(percentage * 100).toFixed(0)}% ${msg}${current}${active}${modulepath} `);
  }
  else if (percentage === 1) {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
  }
};
