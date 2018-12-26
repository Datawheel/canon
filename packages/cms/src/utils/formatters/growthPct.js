/**
 * Abbreviates a growth value, turns it absolute, and adds a percent sign.
 */
function growthPct(n) { 
  return `${formatters.abbreviate(Math.abs(n))}%`;
}

module.exports = growthPct;
