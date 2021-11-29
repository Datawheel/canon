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

module.exports = growth;
