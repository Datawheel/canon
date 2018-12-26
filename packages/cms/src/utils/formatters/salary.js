const libs = require("./libs");

/**
 * Displays salary values with proper precision (ie. "$74,200" instead of "$74.2k") 
 */         
function salary(n) {
  let str; 
  if (n < 1000000) {   
    str = libs.d3.format(",")(n.toFixed(0)); 
  } 
  else str = formatters.abbreviate(n); 
  return formatters.dollar(str);
}

module.exports = salary;
