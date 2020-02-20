let profiles;

const extractProfiles = router => {
  const routes = router.routes[0].childRoutes;
  if (routes) {
    profiles = [];  
    routes.forEach(route => {
      const allMatches = route.path.match(/([\(\/]{0,}\:(slug|id)[1-9]{0,}[\)\/]{0,})/g);
      if (allMatches && allMatches.length > 1) {
        
        for (let i = allMatches.length / 2; i > 0; i--) {
          let newPath = route.path;
          allMatches.slice(i * 2).forEach(r => {
            newPath = newPath.replace(r, "");
          });
          profiles[i] = newPath.replace(/\(|\)/g, "");
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
