let profiles;
const slugMatch = /([\(\/]{0,}\:(slug|id)[1-9]{0,}[\)\/]{0,})/g;

const extractProfiles = router => {
  let routes = router.routes[0].childRoutes;
  if (routes) {
    // Sort routes from longest to shortest, which in this case, will be "general" to "most specific"
    routes = routes.slice().sort((a, b) => {
      const aPairs = a.path.match(slugMatch);
      const bPairs = b.path.match(slugMatch);
      const aLength = aPairs ? aPairs.length : 0;
      const bLength = bPairs ? bPairs.length : 0;
      return bLength - aLength;
    });
    profiles = [];  
    // for each route in routes.jsx
    routes.forEach(route => {
      // turn its id/slug pattern into an array like ["/:slug/", ":id/", ":slug2/", ":id2"]
      const allMatches = route.path.match(slugMatch);
      if (allMatches && allMatches.length > 1) {
        // routes may have use optional parenthetical pathing, like /:slug/:id(/:slug2)(/:id2). To accommodate this,
        // start from the outside and work inwards, building a profile route for each pair.
        for (let i = allMatches.length / 2; i > 0; i--) {
          let newPath = route.path;
          allMatches.slice(i * 2).forEach(r => {
            newPath = newPath.replace(r, "");
          });
          // Do not overwrite a profile style that's already set - unless the user has marked the override default
          if (!profiles[i] || route.isProfile) profiles[i] = newPath.replace(/\(|\)/g, "");
        }
      }
    });
  }
};

// Given a router object, create a link to a CMS profile that respects custom routes.jsx configurations
module.exports = (router, profile, locale = "en") => {
  if (!profiles) {
    extractProfiles(router);
  }
  if (profiles) {
    let link = profiles[profile.length];
    if (link) {
      profile.forEach((p, i) => {
        const reSlug = new RegExp(`:slug${i === 0 ? "" : i + 1}`);
        const reId = new RegExp(`:id${i === 0 ? "" : i + 1}`);
        link = link
          .replace(reSlug, p.slug)
          .replace(reId, p.memberSlug ? p.memberSlug : p.id)
          .replace(/\:(lang|language|locale|lng)/g, locale);
      });
      return link;  
    }
    else return "#";
  }
  else {
    return "#";
  }  
};
