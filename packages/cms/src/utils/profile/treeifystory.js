const stripHTML = require("../formatters/stripHTML");
const sectionIconLookup = require("../sectionIconLookup");

module.exports = (stories, localeDefault) => 
  stories.map(s => {
    const defCon = s.content.find(c => c.locale === localeDefault);
    const title = defCon && defCon.title ? defCon.title : s.slug;
    return {
      id: `story${s.id}`,
      hasCaret: true,
      label: stripHTML(title),
      itemType: "story",
      data: s,
      childNodes: s.storysections.map(t => {
        const defCon = t.content.find(c => c.locale === localeDefault);
        const title = defCon && defCon.title ? defCon.title : t.slug;
        return {
          id: `storysection${t.id}`,
          hasCaret: false,
          label: stripHTML(title),
          icon: sectionIconLookup(t.type, t.position),
          itemType: "storysection",
          data: t
        };
      })
    };
  });

