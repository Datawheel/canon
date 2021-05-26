const {default: axios} = require("axios");

module.exports = {
  naApiTest,
  naTestHandler
};

/**
 * This test looks for N/A in the page content.
 *
 * @param {import("puppeteer").Page} page
 * @returns {Promise<string[]>}
 */
async function naTestHandler(page) {
  return page.evaluate(textContentWalker);

  /**
   * This function is serialized and sent for evaluation to the page context.
   */
  function textContentWalker() {
    const target = document.querySelector("#Profile");
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, {
      acceptNode: node => (/\bN\/A\b|undefined/g).test(node.wholeText)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP
    });

    const selectorList = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const currentNode = walker.nextNode();
      if (!currentNode) break;
      selectorList.push(cssSelector(currentNode.parentNode));
    }

    return selectorList;

    /**
     * This function comes from Firefox Devtools, it's the equivalent to get
     * from devtools inspector > Copy > CSS Selector.
     * Small modifications/simplifications to match canon's Profile tree.
     * @param {Element} ele The node you want a CSS selector for
     * @returns {string} A CSS selector matching the node containing the N/A.
     */
    function cssSelector(ele) {
      let index, matches, selector;

      // document.querySelectorAll("#id") returns multiple if elements share an ID
      if (ele.id) {
        selector = `#${CSS.escape(ele.id)}`;
        if (document.querySelectorAll(selector).length === 1) {
          return selector;
        }
      }

      // Inherently unique by tag name
      const tagName = ele.localName;

      // We might be able to find a unique class name
      if (ele.classList.length > 0) {
        for (let i = 0; i < ele.classList.length; i++) {
          // Is this className unique by itself?
          selector = `.${CSS.escape(ele.classList.item(i))}`;
          matches = document.querySelectorAll(selector);
          if (matches.length === 1) {
            return selector;
          }
          // Maybe it's unique with a tag name?
          selector = tagName + selector;
          matches = document.querySelectorAll(selector);
          if (matches.length === 1) {
            return selector;
          }
          // Maybe it's unique using a tag name and nth-child
          index = positionInNodeList(ele) + 1;
          selector = `${selector}:nth-child(${index})`;
          matches = document.querySelectorAll(selector);
          if (matches.length === 1) {
            return selector;
          }
        }
      }

      // Not unique enough yet.  As long as it's not a child of the document,
      // continue recursing up until it is unique enough.
      if (ele.parentNode !== document) {
        index = positionInNodeList(ele) + 1;
        selector = `${cssSelector(ele.parentNode)} > ${tagName}:nth-child(${index})`;
      }

      return selector;
    }

    /**
     * @param {Element} element
     * @returns {number}
     */
    function positionInNodeList(element) {
      return [...element.parentNode.children].indexOf(element);
    }
  }
}

/**
 *
 * @param {string} baseURL
 * @param {string} profile
 * @param {string} page
 * @param {string} [locale]
 */
async function naApiTest(baseURL, profile, page, locale) {
  const response = await axios.get({
    baseURL,
    url: "api/profile/",
    params: {slug: profile, id: page, locale}
  });

  return {
    url: response.config.url,
    paths: traverseValues([], response.data)
  };

  /**
   * @param {any} object
   * @returns {string[]}
   */
  function traverseValues(parentKeys, object) {
    const list = [];
    const keys = Object.keys(object);
    for (const key of keys) {
      const value = object[key];
      if (Array.isArray(value) || typeof value === "object") {
        const failing = traverseValues(parentKeys.concat(key), value);
        list.push(...failing);
        continue;
      }
      if ((/\bN\/A\b/g).test(`${value}`)) {
        const fullKey = parentKeys.concat(key).map(token =>
          token == parseInt(token, 10) ? `[${token}]` : `["${token}"]`
        ).join("");
        list.push(fullKey);
      }
    }
    return list;
  }
}
