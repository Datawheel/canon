// adapted from http://www.math.ucla.edu/~tom/distributions/binomial.html
/** */
function logGamma(Z) {
  const S = 1 + 76.18009173 / Z - 86.50532033 / (Z + 1) + 24.01409822 / (Z + 2) - 1.231739516 / (Z + 3) + .00120858003 / (Z + 4) - .00000536382 / (Z + 5);
  return (Z - .5) * Math.log(Z + 4.5) - (Z + 4.5) + Math.log(S * 2.50662827465);
}

/** */
function betinc(X, A, B) {
  let A0 = 0;
  let B0 = 1;
  let A1 = 1;
  let B1 = 1;
  let M9 = 0;
  let A2 = 0;
  let C9;
  while (Math.abs((A1 - A2) / A1) > .00001) {
    A2 = A1;
    C9 = -(A + M9) * (A + B + M9) * X / (A + 2 * M9) / (A + 2 * M9 + 1);
    A0 = A1 + C9 * A0;
    B0 = B1 + C9 * B0;
    M9 += 1;
    C9 = M9 * (B - M9) * X / (A + 2 * M9 - 1) / (A + 2 * M9);
    A1 = A0 + C9 * A1;
    B1 = B0 + C9 * B1;
    A0 /= B1;
    B0 /= B1;
    A1 /= B1;
    B1 = 1;
  }
  return A1 / A;
}

/** */
function binomialCdf(X, N, P) {
  let betacdf, bincdf;
  if (X < 0) bincdf = 0;
  else if (X >= N) bincdf = 1;
  else {
    X = Math.floor(X);
    const Z = P;
    const A = X + 1;
    const B = N - X;
    const S = A + B;
    const BT = Math.exp(logGamma(S) - logGamma(B) - logGamma(A) + A * Math.log(Z) + B * Math.log(1 - Z));
    if (Z < (A + 1) / (S + 2)) {
      betacdf = BT * betinc(Z, A, B);
    }
    else {
      betacdf = 1 - BT * betinc(1 - Z, B, A);
    }
    bincdf = 1 - betacdf;
  }
  return Math.round(bincdf * 100000) / 100000;
}

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

/**
 * Adapted from JogoShugh's SMR https://github.com/JogoShugh/OpenEpi.com/blob/master/OpenEpi/SMR/SMR.js
 * @param {*} observedVal
 * @param {*} expectedVal
 */
function smr(observedVal, expectedVal) {

  /* Calculates standard morbidity ratio given observed and expected values */
  let vx = observedVal;
  const vN = expectedVal;

  // Byar method approximation;
  if (vx > vN) {
    vx = vx;
  }
  else {
    vx += 1;
  }

  // Fisher's exact test for poisson distribution ;
  const Obs = vx;
  const Exp = vN;

  const ci = 95; // currently hard-wired to 95% CI

  // Mid-P exact test;
  // Lower tail;
  let v = 0.5;
  let dv = 0.5;
  const vTL = (100 - ci) / 2;
  let p = vTL / 100;

  const vZ = Obs;
  while (dv > 1e-5) {
    dv /= 2; if (poisP((1 + vZ) * v / (1 - v), vZ + 1, 1e10) + 0.5 * poisP((1 + vZ) * v / (1 - v), vZ, vZ) > p) {
      v -= dv;
    }
    else {
      v += dv;
    }
  }

  const QL = (1 + vZ) * v / (1 - v) / Exp;

  // Upper tail;
  v = 0.5;
  dv = 0.5;
  const vTU = (100 - ci) / 2;
  p = vTU / 100;

  while (dv > 1e-5) {
    dv /= 2; if  (poisP((1 + vZ) * v / (1 - v), 0, vZ - 1)    +  0.5 * poisP((1 + vZ) * v / (1 - v), vZ, vZ) < p) {
      v -= dv;
    }
    else {
      v += dv;
    }
  }
  const QU = (1 + vZ) * v / (1 - v) / Exp;
  return {lci: QL, uci: QU};
}


/**
 * Poisson iteration;
 * @param {*} Z
 * @param {*} x1
 * @param {*} x2
 */
function poisP(Z, x1, x2) {
  let q = 1; let tot = 0; let s = 0; let k = 0;
  while (k < Z || q > tot * 1e-10) {
    tot += q;
    if (k >= x1 & k <= x2) {
      s += q;
    }
    if (tot > 1e30) {
      s /= 1e30; tot /= 1e30; q /= 1e30;
    }
    k += 1; q = q * Z / k;
  }
  return s / tot;
}

module.exports = {
  binomialCdf,
  binP,
  computeMidP,
  criticalValue,
  smr
};
