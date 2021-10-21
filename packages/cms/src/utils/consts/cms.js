const PARENT_TYPES = {
  PROFILE: "profile",
  STORY: "story"
};

const GENERATOR_TYPES = {
  GENERATOR: "generator",
  MATERIALIZER: "materializer",
  STORY_GENERATOR: "story_generator",
  STORY_MATERIALIZER: "story_materializer"
};

const SELECTOR_TYPES = {
  SECTION_SELECTOR: "section_selector",
  STORYSECTION_SELECTOR: "storysection_selector"
};

const BLOCK_CONTENT_TYPES = {
  AUTHOR: "author",
  FOOTNOTE: "footnote",
  PARAGRAPH: "paragraph",
  SELECTOR: "selector",
  STAT: "stat",
  SUBTITLE: "subtitle",
  TITLE: "title"
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
  SHORT: "short",
  SUBTITLE: "subtitle",
  TITLE: "title",
  TOOLTIP: "tooltip",
  TWITTER: "twitter",
  VALUE: "value"
};

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
    BLOCK_FIELDS.SUBTITLE,
    BLOCK_FIELDS.TITLE,
    BLOCK_FIELDS.TOOLTIP,
    BLOCK_FIELDS.VALUE
  ],
  [BLOCK_TYPES.SUBTITLE]: [
    BLOCK_FIELDS.SUBTITLE
  ],
  [BLOCK_TYPES.TITLE]: [
    BLOCK_FIELDS.TITLE
  ]
};

Object.values(BLOCK_MAP).forEach(d => [...new Set([...d,
  BLOCK_FIELDS.LOGIC,
  BLOCK_FIELDS.LOGIC_ENABLED,
  BLOCK_FIELDS.LOGIC_SIMPLE,
  BLOCK_FIELDS.LOGIC_SIMPLE_ENABLED
])]);

const BLOCK_SETTINGS = {
  NAME: "name",
  DESCRIPTION: "description",
  ALLOWED: "allowed",
  LOGIC_ALLOWED: "logicAllowed",
  LOGIC_ALLOWED_ENABLED: "logicAllowedEnabled",
  POSITION: "position",
  ICON: "icon"
};


module.exports = {
  PARENT_TYPES,
  GENERATOR_TYPES,
  SELECTOR_TYPES,
  BLOCK_TYPES,
  BLOCK_FIELDS,
  BLOCK_MAP,
  BLOCK_SETTINGS
};
