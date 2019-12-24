import {format} from "d3-format";
import {timeFormat} from "d3-time-format";

export const FORMATTERS = {
  commasDecimal: format(",.2f"),
  date: timeFormat("%B %d, %Y"),
  ordinal: n => {
    if (n > 3 && n < 21) return `${n}th`; // thanks kennebec
    switch (n % 10) {
      case 1:
        return `${n}st`;
      case 2:
        return `${n}nd`;
      case 3:
        return `${n}rd`;
      default:
        return `${n}th`;
    }
  },
  sm: format(".2"),
  rca: format(".2f"),
  round: format(",.0f"),
  share: format(".2%"),
  growth: format("+,.1%"),
  dollar: format("$,.0f"),
  dollarDecimal: format("$,.2f"),
  shareWhole: format(",.0%"),
  year: y => y < 0 ? `${Math.abs(y)} BC` : y,
  titleCase: s => {
    let str = s.replace(/([^\W_]+[^\s-]*) */g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

    // Certain minor words should be left lowercase unless
    // they are the first or last words in the string
    const lowers = ["A", "An", "The", "And", "But", "Or", "For", "Nor", "As", "At", "By", "For", "From", "In", "Into", "Near", "Of", "On", "Onto", "To", "With"];
    for (let i = 0, j = lowers.length; i < j; i++) {
      str = str.replace(new RegExp(`\\s${lowers[i]}\\s`, "g"), txt => txt.toLowerCase());
    }

    // Certain words such as initialisms or acronyms should be left uppercase
    const uppers = ["Id", "Tv"];
    for (let i = 0, j = uppers.length; i < j; i++) {
      str = str.replace(new RegExp(`\\b${uppers[i]}\\b`, "g"), uppers[i].toUpperCase());
    }

    return str;
  }
};



/** Check if is an ID Col Name */
export const isIDColName = colName => colName.toLowerCase().startsWith("id ") || colName.toLowerCase().endsWith(" id");

/** Check if is an MOE Col Name */
export const isMOEColName = colName => colName.toLowerCase().startsWith("moe ") || colName.toLowerCase().endsWith(" moe");
