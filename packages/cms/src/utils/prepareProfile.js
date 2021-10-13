/**
 * prepareProfile is part of an effort to move varSwap local. A great deal of "profile preparation" was occuring serverside,
 * including the sql get, bubbling up language content, sorting, and varswapping. In order for profiles to be able to varswap
 * locally, they need to do all this themselves.
 */

const validateDynamic = require("./selectors/validateDynamic");
const scaffoldDynamic = require("./selectors/scaffoldDynamic");
const varSwapRecursive = require("./varSwapRecursive");
const deepClone = require("../utils/deepClone");

const sorter = (a, b) => a.ordering - b.ordering;
const selectsorter = (a, b) => a.section_selector && b.section_selector ? a.section_selector.ordering - b.section_selector.ordering : 0;

const sortProfile = profile => {
  profile.meta.sort(sorter);
  if (profile.sections) {
    profile.sections.sort(sorter);
    profile.sections.forEach(section => {
      if (section.subtitles) section.subtitles.sort(sorter);
      if (section.selectors) section.selectors.sort(selectsorter);
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
module.exports = (rawProfile, variables, formatterFunctions, locale, query = {}) => {
  let profile = sortProfile(extractLocaleContent(rawProfile, locale, "profile"));

  profile.sections.forEach(section => {
    section.selectors = section.selectors.map(selector => selector.dynamic ? fixSelector(selector, variables[selector.dynamic]) : selector);
  });

  // Before sending the profiles down to be varswapped, remember that some sections have groupings. If a grouping
  // has been set to NOT be visible, then its "virtual children" should not be visible either. Copy the outer grouping's
  // visible prop down to the child sections so they get hidden in the same manner.
  let latestGrouping = {};
  profile.sections.forEach(section => {
    if (section.type === "Grouping") {
      latestGrouping = section;
    }
    else {
      // Get the visibility of the parent group
      const parentGroupingAllowed = !latestGrouping.allowed || latestGrouping.allowed === "always" || variables[latestGrouping.allowed];
      // If the parent group is invisible, copy its allowed setting down into this section.
      if (!parentGroupingAllowed) {
        section.allowed = latestGrouping.allowed;
      }
    }
  });

  profile = varSwapRecursive(profile, formatterFunctions, variables, query);
  // If the user provided selectors in the query, then the user has changed a dropdown.
  // This means that OTHER dropdowns on the page need to be set to match. To accomplish
  // this, hijack the "default" property on any matching selector so the dropdowns "start"
  // where we want them to.
  profile.sections.forEach(section => {
    section.selectors.forEach(selector => {
      const {name, options} = selector;
      // Parse out the queries into arrays. Though they should be strings like "state25,state36", also support
      // when the query is already an array, which happens when it comes from Selector.jsx
      const selections = query[name] !== undefined ? typeof query[name] === "string" ? query[name].split(",") : Array.isArray(query[name]) ? query[name] : false : false;
      // If the user provided a selector in the query, AND if it's actually an option
      // However, remember that a multi-select with a blank query param is valid
      const isBlankMulti = selector.type === "multi" && selections.length === 1 && selections[0] === "";
      if (selections && (selections.every(sel => options.map(o => o.option).includes(sel)) || isBlankMulti)) {
        selector.default = query[name];
      }
    });
  });
  profile.variables = variables;
  // By cloning rawProfile, allSelectors and allMaterializers have needlessly made their way out to the main, swapped profile.
  // remove these from the top-level objects before returning the profile (remember, they are kept down in _rawProfile)
  delete profile.allSelectors;
  delete profile.allMaterializers;
  return profile;
};
