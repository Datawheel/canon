let profiles;

const extractProfiles = router => {
  const routes = router.routes[0].childRoutes;
  if (routes) {
    profiles = [];  
    routes.forEach(route => {
      const re = /\:((slug|id)[1-9]{0,})/g;
      let match = re.exec(route.path);
      let slugidLength = 0;
      while (match !== null) {
        slugidLength++;
        match = re.exec(route.path);
      }
      if (slugidLength >= 2) profiles[slugidLength / 2] = route.path;
    });
  }
};

// Given a router object, create a link to a CMS profile that respects custom routes.jsx configurations
module.exports = (router, profile) => {
  if (!profiles) {
    extractProfiles(router);
  }
  if (profiles) {
    let link = profiles[profile.length];
    if (link) {
      profile.forEach((p, i) => {
        const reSlug = new RegExp(`:slug${i === 0 ? "" : i + 1}`);
        const reId = new RegExp(`:id${i === 0 ? "" : i + 1}`);
        link = link.replace(reSlug, p.slug).replace(reId, p.memberSlug ? p.memberSlug : p.id);
      });
      return link;  
    }
    else return "#";
  }
  else {
    return "#";
  }  
};
