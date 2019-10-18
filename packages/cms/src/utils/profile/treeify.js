const stripHTML = require("../formatters/stripHTML");
const sectionIconLookup = require("../sectionIconLookup");
const toKebabCase = require("../formatters/toKebabCase");

module.exports = (profiles, localeDefault) => 
  profiles.map(p => ({
    id: `profile${p.id}`,
    hasCaret: true,
    label: p.meta.length > 0 ? p.meta.map(d => d.slug).join("_") : "Add Dimensions",
    itemType: "profile",
    masterPid: p.id,
    masterMeta: p.meta,
    data: p,
    childNodes: p.sections.map(t => {
      const defCon = t.content.find(c => c.locale === localeDefault);
      const title = defCon && defCon.title ? defCon.title : t.slug;
      return {
        id: `section${t.id}`,
        hasCaret: false,
        label: stripHTML(title),
        itemType: "section",
        masterPid: p.id,
        masterMeta: p.meta,
        data: t,
        icon: sectionIconLookup(t.type, t.position),
        className: `${toKebabCase(t.type)}-node`
      };
    })
  }));

