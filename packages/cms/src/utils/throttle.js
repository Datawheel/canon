/**
 * Throttle functions to improve performance. Pasted in from:
 * https://blog.bitsrc.io/improve-your-react-app-performance-by-using-throttling-and-debouncing-101afbe9055
 */
function throttle(
  func,   // the function to throttle
  ms = 60 // the delay
) {
  let timeout;

  /** execute the function */
  function exec() {
    func.apply();
  }

  /** clear the timeout */
  function clear() {
    timeout === undefined ? null : clearTimeout(timeout);
  }

  if (func !== undefined) {
    timeout = setTimeout(exec, ms);
  }
  else console.error("missing function argument in `throttle.js`");

  // API to clear the timeout
  throttle.clearTimeout = function() {
    clear();
  };
}

module.exports = throttle;
