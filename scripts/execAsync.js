// modified from https://gist.github.com/davidrleonard/2962a3c40497d93c422d1269bcd38c8f
const shell = require("shelljs");

/**
 * Asynchronously executes a shell command and returns a promise that resolves
 * with the result.
 *
 * The `opts` object will be passed to shelljs's `exec()` and then to Node's native
 * `child_process.exec()`. The most commonly used opts properties are:
 *
 * - {String} cwd - A full path to the working directory to execute the `cmd` in
 * - {Boolean} silent - If `true`, the process won't log to `stdout`
 *
 * See shell.js docs: https://github.com/shelljs/shelljs#execcommand--options--callback
 * See Node docs: https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
 *
 * @param {string} cmd - The shell command to execute
 * @param {import("shelljs").ExecOptions} opts - Any opts to pass in to exec (see shell.js docs and Node's native `exec` documentation)
 * @returns {Promise<string>} - Resolves with the command results from `stdout`
 * @example
 *   const execAsync = require('execAsync');
 *   execAsync('ls -al', { silent: true, cwd: '/Users/admin/' });
 **/
function execAsync(cmd, opts = {}) {
  return new Promise((resolve, reject) => {
    shell.exec(cmd, opts, (code, stdout, stderr) => {
      if (code !== 0) {
        const error = new Error(stderr.length ? stderr : stdout);
        error.exitCode = code;
        return reject(error);
      }
      return resolve(stdout);
    });
  });
}

module.exports = execAsync;
