const libs = require("./libs");

const formatters = {
  dollar,
  date,
  list,
  stripHTML,
  abbreviate,
  salary,
  growth,
  growthWord,
  grewWord,
  increaseWord,
  moreWord,
  commas,
  gINI,
  growthPct,
  moreLess,
  bucket,
  plural,
  highWord,
  olderWord,
  olderYounger,
  increasing,
  grewTo,
  longWord,
  largerThan,
  growing,
  increasedWord,
  moreFewerWord,
  abs
};

module.exports = formatters;

/**
 * Adds a US dollar sign to the beginning of a String or Number.
 */
function dollar(n) {
  if (typeof n === "number") n = formatters.abbreviate(n);       
  return n.charAt(0) === "-" ? n.replace("-", "-$") : `$${n}`;
}

/**
 * Formats a date into "%B %d, %Y" format.
 */
function date(n) {
  if (typeof n === "string") n = libs.d3plus.date(n);
  return libs.d3.timeFormat("%B %d, %Y")(n);
}  

/**
 * Joins an array of strings together, adding commas and "and" when necessary.
 */
function list(n) {
  return n.reduce((str, item, i) => {   
    if (!i) str += item;   
    else if (i === n.length - 1 && i === 1) str += ` and ${item}`;   
    else if (i === n.length - 1) str += `, and ${item}`;   
    else str += `, ${item}`;   
    return str; 
  }, "");
}

/**
 * Removes all HTML tags from a string.
 */
function stripHTML(n) {
  return n.replace(/<[^>]+>/g, "");
}

/**
 * Abbreviates a number into a smaller more human-readible number.
 */
function abbreviate(n) {
  if (typeof n !== "number") return "N/A";

  const length = n.toString().split(".")[0].length;
  let val;

  if (n === 0) val = "0";
  else if (length >= 3) {
    const f = libs.d3.format(".3s")(n).replace("G", "B");
    const num = f.slice(0, -1);
    const char = f.slice(f.length - 1);
    val = `${parseFloat(num)}${char}`;
  }
  else if (length === 3) val = libs.d3.format(",f")(n);
  else val = libs.d3.format(".3g")(n);

  return val
    .replace(/(\.[0-9]*[1-9])[0]*$/g, "$1") /* removes any trailing zeros */
    .replace(/[.][0]*$/g, ""); /* removes any trailing decimal point */
} 

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

/**
 * Calculates the growth percentage between two numbers provided the following object format: {curr, prev}. Also supports calculating the growth between two margin of errors using this format: {curr, currMoe, prev, prevMoe}.
 */
function growth(n) {
  const {curr, currMoe = 0, prev, prevMoe = 0} = n;       
  let value;       
  if (currMoe || prevMoe) {         
    const f1 = Math.pow(-prev / Math.pow(curr, 2), 2) * Math.pow(currMoe, 2);         
    const f2 = Math.pow(1 / curr, 2) * Math.pow(prevMoe, 2);         
    value = Math.sqrt(f1 + f2);       
  }       
  else value = (curr - prev) / prev;       
  return value * 100;
}

/**
 * Returns either "growth" or "decline" depending on the provided number's sign.
 */
function growthWord(n) {
  return n < 0 ? "decline" : "growth";
}

/**
 * Returns either "grew", "declined", or "stayed" depending on the provided number's sign.
 */
function grewWord(n) {  
  return n < 0 ? "declined" : n > 0 ? "grew" : "stayed";
}

/**
 * Returns either "increase", "decrease", or "change" depending on the provided number's sign.
 */
function increaseWord(n) {
  return n < 0 ? "decrease" : n > 0 ? "increase" : "change";
}

/**
 * Returns either "more than", "less than", or "approximately the same" depending on the provided number's sign.
 */
function moreWord(n) { 
  return n < 0 ? "less than" : n > 0 ? "more than" : "approximately the same";
}

/**
 * Rounds to nearest whole number and adds commas.
 */
function commas(n) {
  return libs.d3.format(",")(Math.round(n));
}   

/**
 * Calculates GINI growth given an array of data and string keys to access the following: bucket, value, weight.
 */
function gINI(n) {
  const {data, bucket, value, weight} = n;
  const sum = libs.d3.sum;
  const newData = [];
  const weightTotal = sum(data, d => d[weight]);
  data.forEach(function(d, i) {
    const bucketName = `${d[bucket]}`
      .replace(/^[\s\<\>\$A-z]*/g, "")
      .replace(/[A-z0-9]+\-/g, "");
    const mod = d[bucket].includes(">") || d[bucket].includes("+")
      || d[bucket].includes("more") || d[bucket].includes("over") || d[bucket].includes("greater")
      ? 1 : 0;
    newData.push({
      data: d,
      bucket: parseFloat(bucketName, 10) + mod,
      total: d[value] * d[weight]
    });
  });
  newData.sort((a, b) => a.bucket - b.bucket);
  const total = sum(newData, d => d.total);
  newData.forEach(function(d, i) {
    d.pctTotal = d.total / total;
    d.pctWeight = d.data[weight] / weightTotal;
  });
  newData.forEach(function(d, i) {
    d.pctBetter = i === newData.length - 1 ? 0 : sum(newData.slice(i + 1), n => n.pctWeight);
    d.score = d.pctTotal * (d.pctWeight + (2 * d.pctBetter));
  });
  return 1 - sum(newData, d => d.score);
}

/**
 * Abbreviates a growth value, turns it absolute, and adds a percent sign.
 */
function growthPct(n) { 
  return `${formatters.abbreviate(Math.abs(n))}%`;
}

/**
 * Returns either "more" or "less" depending on the provided number's sign.
 */
function moreLess(n) {
  return n < 0 ? "less" : "more";
}

/**
 * Sanitizes bucket strings to "< n", "n1 - n2", and "n+"
 */
function bucket(n) {    
  const re = new RegExp(/([\$0-9\,]+)[A-z\-\s\&]*([\$0-9\,]*)/g); 
  let nums = re.exec(n); 
  if (nums) {   
    nums = nums.slice(1)     
      .filter(d => d.length)     
      .map(d => {       
        if (d.includes(",")) {         
          if (d.indexOf(",") === d.length - 4) {           
            d = d
              .replace(/,000$/g, "k")             
              .replace(/([0-9]+)(,999$)/g, n => `${parseInt(n) + 1}k`);         
          }         
          else if (d.indexOf(",") === d.length - 8) {           
            d = d
              .replace(/,000,000$/g, "M")             
              .replace(/([0-9]+)(,999,999$)/g, n => `${parseInt(n) + 1}M`);         
          }       
        }        
        return d;     
      });   
    if (nums.length === 2) return nums.join(" - ");   
    else if (n.toLowerCase().match(/under|less|\</g)) return `< ${nums[0]}`;   
    else if (n.toLowerCase().match(/over|more|\+|\>/g)) return `${nums[0]}+`;   
    else return `${nums[0]}`; 
  } 
  else return "None";
}

/**
 * Pluralizes a word.
 */
function plural(n) {
  return n.replace(/\w$/g, chr => chr === "y" ? "ies" : `${chr}s`)
}

/**
 * Returns either "higher than", "lower than", or "approximately the same as" depending on the provided number's sign.
 */
function highWord(n) {  
  return n < 0 ? "lower than" : n > 0 ? "higher than" : "approximately the same as";
}

/**
 *
 */
function olderWord(n) {  
  return n < 0 ? "getting younger" : n > 0 ? "getting older" : "staying the same age";
}

/**
 *
 */
function olderYounger(n) {   
  return n < 0 ? "younger than" : n > 0 ? "older than" : "the same age as";
}

/**
 *
 */
function increasing(n) {   
  return n < 0 ? "decreasing" : n > 0 ? "increasing" : "maintaining";
}

/**
 *
 */
function grewTo(n) {   
  return n < 0 ? "declined from" : n > 0 ? "grew to" : "stayed at";
}

/**
 *
 */
function longWord(n) {    
  return n < 0 ? "shorter" : n > 0 ? "longer" : "similar";
}

/**
 *
 */
function largerThan(n) {    
  return n < 0 ? "smaller than" : n > 0 ? "larger than" : "the same as";
}

/**
 *
 */
function growing(n) {  
  return n < 0 ? "declining" : "growing"; 
}

/**
 *
 */
function increasedWord(n) {  
  return n < 0 ? "decreased" : n > 0 ? "increased" : "remained the same";
}

/**
 *
 */
function moreFewerWord(n) {  
  return n < 0 ? "fewer" : "more";
}

/**
 * Simple Absolute Value
 */
function abs(n) {
  return Math.abs(n);
}