/**
 * prepareStory is part of an effort to move varSwap local. A great deal of "profile preparation" was occuring serverside,
 * including the sql get, bubbling up language content, sorting, and varswapping. In order for profiles to be able to varswap
 * locally, they need to do all this themselves. TODO: Make the server-side version use this too (deduplicate)
 */

const validateDynamic = require("./selectors/validateDynamic");
const scaffoldDynamic = require("./selectors/scaffoldDynamic");
const varSwapRecursive = require("./varSwapRecursive");
const deepClone = require("../utils/deepClone");

const sorter = (a, b) => a.ordering - b.ordering;
const selectsorter = (a, b) => a.storysection_selector && b.storysection_selector ? a.storysection_selector.ordering - b.storysection_selector.ordering : 0;

const sortStory = story => {
  if (story.storysections) {
    story.storysections.sort(sorter);
    story.storysections.forEach(storysection => {
      if (storysection.subtitles) storysection.subtitles.sort(sorter);
      if (storysection.selectors) storysection.selectors.sort(selectsorter);
      if (storysection.stats) storysection.stats.sort(sorter);
      if (storysection.descriptions) storysection.descriptions.sort(sorter);
      if (storysection.visualizations) storysection.visualizations.sort(sorter);
    });
  }
  return story;
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
module.exports = (rawStory, variables, formatterFunctions, locale, query = {}) => {
  let story = sortStory(extractLocaleContent(rawStory, locale, "story"));

  story.storysections.forEach(storysection => {
    storysection.selectors = storysection.selectors.map(selector => selector.dynamic ? fixSelector(selector, variables[selector.dynamic]) : selector);
  });

  story = varSwapRecursive(story, formatterFunctions, variables, query);
  // If the user provided selectors in the query, then the user has changed a dropdown.
  // This means that OTHER dropdowns on the page need to be set to match. To accomplish
  // this, hijack the "default" property on any matching selector so the dropdowns "start"
  // where we want them to.
  story.storysections.forEach(storysection => {
    storysection.selectors.forEach(selector => {
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
  story.variables = variables;
  // By cloning rawStory, allSelectors and allMaterializers have needlessly made their way out to the main, swapped story.
  // remove these from the top-level objects before returning the story (remember, they are kept down in _rawStory)
  delete story.allSelectors;
  delete story.allMaterializers;
  return story;
};
