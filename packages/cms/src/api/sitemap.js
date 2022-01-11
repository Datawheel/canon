const path = require('path');
const Sequelize = require("sequelize");
const d3Collection = require('d3-collection');
const {hydrateModels} = require("../../src/utils/sequelize/profiles");

const {
  CANON_API
} = process.env;

const getCustomPaths = () => {

}

const getProfileList = async (database, sitePath, profilePath = "/profile", storyPath = "/story") => {
  const {ProfileMeta, Search} = await hydrateModels(database);

  const profiles = await ProfileMeta.findAllIn([]);

  const profilesNested = d3Collection
    .nest()
    .key(item => item.profile_id)
    .entries(profiles);

  const profileList = [];
  // TO DO
  for (const profile of profiles) {
    console.log(profile.slug);
    const pages = await Search.findAllFromProfile(profile);

    for (const page of pages) {
      profileList.push(new URL(path.join(profilePath, profile.slug, page.slug), sitePath))
    }
  }
  return profileList;
}

// Validate and iterate over every profile and return a final list of urls
const getFullProfileList = async (database, sitePath, profilePath = "/profile", storyPath = "/story") => {

  const queryList = [
    //Profile Meta query
    database.profile_meta.findAll({
      attributes: ['id', 'profile_id', 'dimension', 'slug'],
      where: {
        visible: true
      },
      raw: true
    }),

    //ValidProfiles
    database.search_content.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('id')), 'id']
      ],
      where: {
        attr: {
          [Sequelize.Op.is]: null
        }
      },
      raw: true
    }).map(item => item.id),

    //Stories
    database.story.findAll({
      attributes: ['slug'],
      raw: true
    })
  ];

  const [profilesMeta, validProfiles, stories] = await Promise.all(queryList);

  const profilesMetaNested = d3Collection
    .nest()
    .key(item => item.profile_id)
    .entries(profilesMeta);

  //Profile information
  const profiles = await database.search.findAll({
    attributes: ['dimension', 'hierarchy', 'slug'],
    raw: true,
    where: {
      contentId: validProfiles
    }
  });

  const finalPaths = [];

  //Iterate over profile types
  profilesMetaNested.forEach(profileType => {
    console.log(`--- Generating links for profile id: ${profileType.key} on ${profileType.values.map(item => item.dimension).join(',')} with slug "${profileType.values.map(item => item.slug).join('/')}"`);

    const profileItems = []
    profileType.values.forEach(profileDimension => {
      profileItems.push({slug: profileDimension.slug, profiles: profiles.filter(item => item.dimension === profileDimension.dimension)});
    });

    if (profileItems.length === 1) { //Single entity profile
      const singleProfileSlug = profileItems[0].slug;
      profileItems[0].profiles.forEach(item => {
        finalPaths.push(new URL(path.join(profilePath, singleProfileSlug, item.slug), sitePath))
      });
    } else { //Multilateral profiles
      /*const multi1ProfileSlug = profileItems[0].slug;
      const multi2ProfileSlug = profileItems[1].slug;
      profileItems[0].profiles.forEach(item1 => {
        profileItems[1].profiles.forEach(item2 => {
          //if ([item1.hierarchy, item2.hierarchy].indexOf("Institution Type") === -1 && item1.slug !== item2.slug) {
          if (item1.slug !== item2.slug) { //Non simetric bilateral
            finalPaths.push(
              new URL(path.join(
                profilePath,
                multi1ProfileSlug,
                item1.slug,
                multi2ProfileSlug,
                item2.slug)
                , sitePath));
          }
        });
      });*/
    }

  });

  //Iterate over stories
  stories.forEach(story => {
    finalPaths.push(new URL(path.join(storyPath, story.slug), sitePath))
  });

  return finalPaths;
}

module.exports = function (app) {

  const {db} = app.settings;

  app.get("/api/sitemap.:format", async (req, res) => {

    const data = {sitemap: true, format: req.params.format}

    //data.list = await getFullProfileList(db, CANON_API, "/profile", "/story");
    data.list = await getProfileList(db, CANON_API, "/profile", "/story");

    res.send(data).end();

  });

};
