
/**
Compute mid-p confidence interval around single ratio
Credit to @JogoShugh
Sourced from: https://github.com/JogoShugh/OpenEpi.com/blob/8c90dc075c6a9b8e2a8de8ff26d7cd0b1987762a/OpenEpi/Proportion/Proportion.js
*/

/**
 *
 */
function criticalValue(confLevel) {
  // Returns z value for various levels of confidence and 1 degree
  // of freedom.  OEConfLevel must be expressed as
  // a string with two digits, then two optional digits, without a % sign.
  const critMap = {
    .99999: 15.137,
    .99: 6.635,
    .95: 3.841,
    .9: 2.706
  };
  // TODO: check if confLevel in critMap
  return critMap[confLevel];
}

/**
 *
 */
function binP(N, p, x1, x2) {
  const q = p / (1 - p);
  let k = 0;
  let v = 1;
  let s = 0;
  let tot = 0;
  while (k <= N) {
    tot += v;
    if (k >= x1 & k <= x2) {
      s += v;
    }
    if (tot > 1e30) {
      s /= 1e30;
      tot /= 1e30;
      v /= 1e30;
    }
    k += 1;
    v = v * q * (N + 1 - k) / k;
  }
  return s / tot;
}

/**
 *
 */
function computeMidP(vx, vN, confLevel) {
  // TODO check vx and vN are >= 0
  // TODO check vx not larger than n
  const vP = vx / vN;
  // const npq = vN * vP * (1 - vP);
  // const crit = criticalValue(confLevel);
  // const zL = Math.sqrt(crit);
  // const zSquare = Math.pow(zL, 2);
  const prob = confLevel * 100;
  const vTL = (100 - prob) / 2;

  let T1, T2;
  if (vx === 0)   {
    T1 = 0;
  }
  else {
    let v = vP / 2;
    let vsL = 0;
    let vsH = vP;
    const p = vTL / 100;
    while (vsH - vsL > 1e-5) {
      if (binP(vN, v, vx, vx) * 0.5 + binP(vN, v, vx + 1, vN) > p) {
        vsH = v;
        v = (vsL + v) / 2;
      }
      else {
        vsL = v;
        v = (vsH + v) / 2;
      }
    }
    T1 = v;
  }
  if (vx === vN)  {
    T2 = 0;
  }
  else {
    let v = (1 + vP) / 2;
    let vsL = vP;
    let vsH = 1;
    const p = vTL / 100;
    while (vsH - vsL > 1e-5) {
      if (binP(vN, v, vx, vx) * 0.5 + binP(vN, v, 0, vx - 1) < p) {
        vsH = v;
        v = (vsL + v) / 2;
      }
      else {
        vsL = v;
        v = (vsH + v) / 2;
      }
    }
    T2 = v;
  }

  return {lci: T1, uci: T2};
}

module.exports = {
  computeMidP,
  binP,
  criticalValue
};
