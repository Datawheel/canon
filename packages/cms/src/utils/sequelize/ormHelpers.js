/**
 * The CMS makes large, hierarchical gets, necessitating complex include-trees. Stubs for those trees are included here,
 * Along with some helper arrays that feed into cmsRoute to help dynamically define CRUD actions.
 */

const profileReqFull = {
  include: [
    {association: "meta", separate: true},
    {association: "contentByLocale", separate: true},
    {
      association: "sections", separate: true,
      include: [
        {association: "contentByLocale", separate: true},
        {association: "blocks", include: [
          {association: "contentByLocale", separate: true},
          {association: "inputs"}
        ], separate: true}
      ]
    }
  ]
};

const sectionReqFull = {
  include: [
    {association: "contentByLocale", separate: true},
    {association: "blocks", include: [
      {association: "contentByLocale", separate: true},
      {association: "inputs"}
    ], separate: true}
  ]
};

/**
 * API paths are dynamically generated by folding over this list in the get/post methods that follow.
 * IMPORTANT: When new tables are added to the CMS, adding their exact tablename to this list will
 * automatically generate Create, Update, and Delete Routes (as specified later in the get/post methods)
 */
const cmsTables = [
  "block", "block_input", "profile", "profile_meta", "section"
];

/**
 * Some tables are translated to different languages using a corresponding "content" table, like "profile_content".
 * As such, some of the following functions need to take compound actions, e.g., insert a metadata record into
 * profile, THEN insert the "real" data into "profile_content." This list (subset of cmsTables) represents those
 * tables that need corresponding _content updates.
 */

const contentTables = [
  "block", "profile", "section"
];

/**
 * Some tables need to know their own parents, for help with ordering. This lookup table allows
 * a given id to find its "siblings" and know where it belongs, ordering-wise
 */

const parentOrderingTables = {
  block: "section_id",
  block_input: "block_id",
  profile_meta: "profile_id",
  section: "profile_id"
};

module.exports = {profileReqFull, sectionReqFull, cmsTables, contentTables, parentOrderingTables};