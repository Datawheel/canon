const validateDynamic = require("./selectors/validateDynamic");
const scaffoldDynamic = require("./selectors/scaffoldDynamic");
const varSwapRecursive = require("./varSwapRecursive");
const libs = require("../utils/libs"); 
const deepClone = require("../utils/deepClone");

const sorter = (a, b) => a.ordering - b.ordering;

const sortProfile = profile => {
  profile.meta.sort(sorter);
  if (profile.sections) {
    profile.sections.sort(sorter);
    profile.sections.forEach(section => {
      if (section.subtitles) section.subtitles.sort(sorter);
      if (section.selectors) section.selectors.sort(sorter);
      if (section.stats) section.stats.sort(sorter);
      if (section.descriptions) section.descriptions.sort(sorter);
      if (section.visualizations) section.visualizations.sort(sorter);
    });
  }
  return profile;
};

/**
 * Lang-specific content is stored in secondary tables, and are part of profiles as an
 * array called "content," which contains objects of region-specific translated keys.
 * We don't want the front end to have to even know about this sub-table or sub-array.
 * Therefore, bubble up the appropriate content to the top-level of the object
 */

const bubbleUp = (obj, locale) => {
  const fieldSet = [];
  obj.content.forEach(c => {
    Object.keys(c).forEach(k => {
      if (!fieldSet.includes(k)) fieldSet.push(k);
    });
  });
  const defCon = obj.content.find(c => c.locale === "en");
  const thisCon = obj.content.find(c => c.locale === locale);
  fieldSet.forEach(k => {
    if (k !== "id" && k !== "locale") {
      thisCon && thisCon[k] ? obj[k] = thisCon[k] : obj[k] = defCon ? defCon[k] : "";
    }
  });
  delete obj.content;
  return obj;
};

const extractLocaleContent = (sourceObj, locale, mode) => {
  let obj = deepClone(sourceObj);
  obj = bubbleUp(obj, locale);
  if (mode === "story") {
    ["footnotes", "descriptions", "authors"].forEach(type => {
      if (obj[type]) obj[type] = obj[type].map(o => bubbleUp(o, locale));
    });
  }
  if (mode === "profile" || mode === "story") {
    const children = mode === "story" ? "storysections" : "sections";
    if (obj[children]) {
      obj[children] = obj[children].map(child => {
        child = bubbleUp(child, locale);
        ["subtitles", "descriptions", "stats"].forEach(type => {
          if (child[type]) child[type] = child[type].map(o => bubbleUp(o, locale));
        });
        return child;
      });
    }
  }
  if (mode === "section") {
    ["subtitles", "descriptions", "stats"].forEach(type => {
      if (obj[type]) obj[type] = obj[type].map(o => bubbleUp(o, locale));
    });
  }
  return obj;
};

/* Some of the section-level selectors are dynamic. This means that their "options" field isn't truly
 * populated, it's just a reference to a user-defined variable. Scaffold out the dynamic selectors
 * into "real ones" so that all the ensuing logic can treat them as if they were normal. */
const fixSelector = (selector, dynamic) => {
  if (validateDynamic(dynamic) === "valid") {
    selector.options = scaffoldDynamic(dynamic);
  }
  else {
    selector.options = [];
  }
  return selector;
};

// Perform a local varswap
module.exports = (profile, variables, formatters, locale, query) => {
  profile = sortProfile(extractLocaleContent(variables._rawProfile, locale, "profile"));
  const formatterFunctions = formatters.reduce((acc, d) => {
    const f = Function("n", "libs", "locale", "formatters", d.logic);
    const fName = d.name.replace(/^\w/g, chr => chr.toLowerCase());
    acc[fName] = n => f(n, libs, locale, acc);
    return acc;
  }, {});
  
  profile.sections.forEach(section => {
    section.selectors = section.selectors.map(selector => selector.dynamic ? fixSelector(selector, variables[selector.dynamic]) : selector);
  });
  
  profile = varSwapRecursive(profile, formatterFunctions, variables, query);
  // If the user provided selectors in the query, then the user has changed a dropdown.
  // This means that OTHER dropdowns on the page need to be set to match. To accomplish
  // this, hijack the "default" property on any matching selector so the dropdowns "start"
  // where we want them to.
  profile.sections.forEach(section => {
    section.selectors.forEach(selector => {
      const {name} = selector;
      // If the user provided a selector in the query, AND if it's actually an option
      if (query[name] && selector.options.map(o => o.option).includes(query[name])) {
        selector.default = query[name];
      }
    });
  });
  profile.variables = variables;
  return profile;   
};
