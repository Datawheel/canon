const chalk = require("chalk"),
      shell = require("shelljs");

/**
 * @name title
 * @param {String} str The string used as the title.
 * @param {String} [icon] An optional Unicode character or Emoji to use in the title.
 */
module.exports = function title(str, icon = "") {
  shell.echo(chalk.bold(`\n\n${icon.length ? `${icon}  ` : ""}${str}`));
  shell.echo(chalk.gray("\n——————————————————————————————————————————————\n"));
};
