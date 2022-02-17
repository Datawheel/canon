const localeDefault = process.env.CANON_LANGUAGE_DEFAULT;

/**
 * Many data structures in canon-reports have their content hashed out into languages, keyed by locale.
 * When the front end requests these, it has no need for other languages. Bubble up all contentByLocale into 
 * the top-level content key, so all blocks can access them the same way - via .content
 * @param {*} obj 
 * @param {*} locale 
 * @returns 
 */
const bubbleUpLocaleContent = (obj, locale = localeDefault) => {
  if (obj.contentByLocale) {
    const localeContent = obj.contentByLocale.find(d => d.locale === locale);
    const defaultContent = obj.contentByLocale.find(d => d.locale === localeDefault);
    obj.content = localeContent ? localeContent.content : defaultContent.content;
    delete obj.contentByLocale;
    delete obj.content.simple;
    delete obj.content.simpleEnabled;
  }
  return obj;
};

module.exports = bubbleUpLocaleContent;
