/** check if the current browser is internet explorer */
let isIE = false;

// make sure the browser window exists
if (typeof window !== "undefined") {
  // will only return true for internet explorer
  if (/*@cc_on!@*/false || !!document.documentMode) { // eslint-disable-line spaced-comment
    isIE = true;
  }
}

module.exports = isIE;
