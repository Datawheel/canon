/**
 * Top-level entity types - every "entity" in the CMS is one of these,
 * and has CRUD operations accordingly.
 */
const ENTITY_TYPES = {
  REPORT: "report",
  SECTION: "section",
  BLOCK: "block",
  BLOCK_INPUT: "block_input"
};

/**
 * For each ENTITY_TYPE, store a pretty name for window titles, etc.
 */
const ENTITY_PRETTY_NAMES = {
  report: "Report",
  section: "Section",
  block: "Block",
  block_input: "Input"
};

/**
 * Reports and stories are nearly identical, but stories have a
 * publish date, and support for footnotes / authors
 */
const REPORT_TYPES = {
  REPORT: "report",
  STORY: "story"
};

/**
 * Selectors have two types, single and and multi
 */
const SELECTOR_TYPES = {
  SINGLE: "single",
  MULTI: "multi"
};

/**
 * NOTE ON FIELDS, MAPS, AND SETTINGS
 * Many elements of the CMS are stored as JSON blobs in the database, to allow
 * easy addition of new or custom keys without a database migration. However, the
 * standard keys for any given entity or settings element are contained here.
 * FIELDS - all available fields for a given entity, regardless of type
 * MAP - what subset of those fields belong to which type of that entity
 * SETTINGS - a list of settings keys expected in the settings object
 */

const REPORT_FIELDS = {
  TITLE: "title",
  SUBTITLE: "subtitle",
  LABEL: "label"
};

const REPORT_MAP = {
  [REPORT_TYPES.REPORT]: Object.values(REPORT_FIELDS),
  [REPORT_TYPES.STORY]: Object.values(REPORT_FIELDS)
};

const REPORT_SETTINGS = {
  ALLOWED: "allowed",
  LOGIC_ALLOWED: "logicAllowed",
  LOGIC_ALLOWED_ENABLED: "logicAllowedEnabled"
};

const SECTION_FIELDS = {
  TITLE: "title",
  SHORT: "short"
};

const SECTION_SETTINGS = {
  POSITION: "position",
  ICON: "icon",
  ALLOWED: "allowed",
  LOGIC_ALLOWED: "logicAllowed",
  LOGIC_ALLOWED_ENABLED: "logicAllowedEnabled"
};

const BLOCK_CONTENT_TYPES = {
  AUTHOR: "author",
  FOOTNOTE: "footnote",
  PARAGRAPH: "paragraph",
  SELECTOR: "selector",
  STAT: "stat",
  SUBTITLE: "subtitle",
  TITLE: "title"
  // todo1.0, how to put custom blocks in here?
};

const BLOCK_LOGIC_TYPES = {
  GENERATOR: "generator",
  VIZ: "visualization"
};

const BLOCK_TYPES = {...BLOCK_CONTENT_TYPES, ...BLOCK_LOGIC_TYPES};

const BLOCK_FIELDS = {
  AUTHOR: "author",
  FOOTNOTE: "footnote",
  BIO: "bio",
  IMAGE: "image",
  LOGIC: "logic",
  LOGIC_ENABLED: "logicEnabled",
  LOGIC_SIMPLE: "logicSimple",
  LOGIC_SIMPLE_ENABLED: "logicSimpleEnabled",
  PARAGRAPH: "paragraph",
  SELECTOR_DEFAULT: "selectorDefault",
  SELECTOR_DYNAMIC: "selectorDynamic",
  SELECTOR_NAME: "selectorName",
  SELECTOR_TYPE: "selectorType",
  SLUG: "slug",
  SUBTITLE: "subtitle",
  TITLE: "title",
  TOOLTIP: "tooltip",
  TWITTER: "twitter",
  VALUE: "value"
};

/**
 * When exporting content variables for use by other blocks, skip over the following fields
 */
const BLOCK_FIELDS_EXCLUDE = [
  BLOCK_FIELDS.LOGIC,
  BLOCK_FIELDS.LOGIC_ENABLED,
  BLOCK_FIELDS.LOGIC_SIMPLE,
  BLOCK_FIELDS.LOGIC_ENABLED
];

const BLOCK_MAP = {
  [BLOCK_TYPES.AUTHOR]: [
    BLOCK_FIELDS.AUTHOR,
    BLOCK_FIELDS.BIO,
    BLOCK_FIELDS.IMAGE,
    BLOCK_FIELDS.TITLE
  ],
  [BLOCK_TYPES.FOOTNOTE]: [
    BLOCK_FIELDS.FOOTNOTE
  ],
  [BLOCK_TYPES.PARAGRAPH]: [
    BLOCK_TYPES.PARAGRAPH
  ],
  [BLOCK_TYPES.SELECTOR]: [
    BLOCK_FIELDS.SELECTOR_DEFAULT,
    BLOCK_FIELDS.SELECTOR_DYNAMIC,
    BLOCK_FIELDS.SELECTOR_NAME,
    BLOCK_FIELDS.SELECTOR_TYPE
  ],
  [BLOCK_TYPES.STAT]: [
    BLOCK_FIELDS.TITLE,
    BLOCK_FIELDS.SUBTITLE,
    BLOCK_FIELDS.VALUE,
    BLOCK_FIELDS.TOOLTIP
  ],
  [BLOCK_TYPES.SUBTITLE]: [
    BLOCK_FIELDS.SUBTITLE
  ],
  [BLOCK_TYPES.TITLE]: [
    BLOCK_FIELDS.TITLE,
    BLOCK_FIELDS.SLUG
  ],
  [BLOCK_TYPES.GENERATOR]: [],
  [BLOCK_TYPES.VIZ]: []
};

/*
Object.keys(BLOCK_MAP).forEach(k => {
  BLOCK_MAP[k] = BLOCK_MAP[k].concat([
    BLOCK_FIELDS.LOGIC,
    BLOCK_FIELDS.LOGIC_ENABLED,
    BLOCK_FIELDS.LOGIC_SIMPLE,
    BLOCK_FIELDS.LOGIC_SIMPLE_ENABLED
  ]);
});
*/

const BLOCK_SETTINGS = {
  NAME: "name",
  DESCRIPTION: "description",
  ALLOWED: "allowed",
  LOGIC_ALLOWED: "logicAllowed",
  LOGIC_ALLOWED_ENABLED: "logicAllowedEnabled"
};

module.exports = {
  BLOCK_FIELDS,
  BLOCK_FIELDS_EXCLUDE,
  BLOCK_MAP,
  BLOCK_SETTINGS,
  BLOCK_TYPES,
  ENTITY_TYPES,
  ENTITY_PRETTY_NAMES,
  REPORT_FIELDS,
  REPORT_MAP,
  REPORT_SETTINGS,
  REPORT_TYPES,
  SECTION_FIELDS,
  SECTION_SETTINGS,
  SELECTOR_TYPES
};
