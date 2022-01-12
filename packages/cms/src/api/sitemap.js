const path = require('path');
const Sequelize = require("sequelize");
const d3Collection = require('d3-collection');
const {hydrateModelsProfile} = require("../../src/utils/sequelize/profiles");

const {
  CANON_API,
  CANON_LANGUAGES,
  CANON_SITEMAP_PROFILE_PATH,
  CANON_SITEMAP_STORY_PATH
} = process.env;

//Defaults
const languages = CANON_LANGUAGES ? CANON_LANGUAGES.split(',') : ["en"];
const sitePath = CANON_API || "http://localhost:3300";
const profilePath = CANON_SITEMAP_PROFILE_PATH || "/:lang/profile/:profile/:page";
const storyPath = CANON_SITEMAP_STORY_PATH || "/:lang/story/:page";

const getCustomPaths = () => {

}

const getAllProfilesTypes = async (database) => {
  const {Profile} = await hydrateModelsProfile(database);
  const profilesTypes = await Profile.getAllVisible();
  return profilesTypes;
};

const getAllProfilesMetaByType = async (database, profileType) => {
  const {ProfileMeta} = await hydrateModelsProfile(database);
  const profilesMetas = await ProfileMeta.findAllIn(profileType);
  return profilesMetas;
};

const getAllSearchByProfile = async (database, profile) => {
  const {Search} = await hydrateModelsProfile(database);
  const profilesMembers = await Search.findAllFromProfile(profile);
  return profilesMembers;
};

const getProfileList = async (database, sitePath, profilePath = "/profile", storyPath = "/story") => {

  const {ProfileMeta, Search} = await hydrateModelsProfile(database);

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

const generateOutput = (format, data, res) => {

  let content = [];

  //Formats
  switch (format) {
    case "txt":
      res.setHeader('Content-type', 'text/plain');

      content = data.map(d => d.url);

      break;

    case "xml":
      res.header('Content-Type', 'text/xml');

      content = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
      ];

      for (const link of data) {
        content = content.concat(
          [
            '  <url>',
            `    <loc>${link.url}</loc>`,
            //'    <lastmod>2005-01-01</lastmod>',
            //'    <changefreq>monthly</changefreq>',
            //'    <priority>0.4</priority>',
            '  </url>'
          ]
        );
      }

      content.push('</urlset>');

      break;

    default:
      break;
  }

  //Response
  res.charset = 'UTF-8';
  res.send(content.join('\n')).end();

}

module.exports = function (app) {

  const {db} = app.settings;

  app.get("/api/sitemap/list", async (req, res) => {

    const list = await getAllProfilesTypes(db);

    const sitemapCustomUrl = new URL(path.join("/api/sitemap/main"), sitePath)
    const sitemapStoriesUrl = new URL(path.join("/api/sitemap/stories"), sitePath)

    const data = {
      title: "Sitemap list",
      main: {
        formats: {
          txt: `${sitemapCustomUrl}.txt`,
          xml: `${sitemapCustomUrl}.xml`
        }
      },
      stories: {
        formats: {
          txt: `${sitemapStoriesUrl}.txt`,
          xml: `${sitemapStoriesUrl}.xml`,
          rss: `${sitemapStoriesUrl}.rss`
        }
      },
      profiles: list.map(profileType => {
        const sitemapProfileUrl = new URL(path.join("/api/sitemap", `profiles/${profileType.id}`), sitePath)
        return {
          id: profileType.id,
          formats: {
            txt: `${sitemapProfileUrl}.txt`,
            xml: `${sitemapProfileUrl}.xml`
          },
          includes: profileType.meta
            .filter(profileMeta => profileMeta.visible)
            .map(profileMeta => {
              return profileMeta.slug;
            })
        }
      })
    };

    res.send(data).end();
  });

  app.get("/api/sitemap/main.:format", async (req, res) => {

    const data = {custom: true, format: req.params.format}

    res.send(data).end();

  });

  app.get("/api/sitemap/stories.:format", async (req, res) => {

    const data = {stories: true, format: req.params.format}

    res.send(data).end();

  });

  app.get("/api/sitemap/profiles/:profileId.:format", async (req, res) => {

    const profileId = parseInt(req.params.profileId, 10);

    const format = req.params.format;

    const profilesMeta = await getAllProfilesMetaByType(db, profileId);

    const metaSize = profilesMeta.length;

    const urlTemplate = new URL(path.join(profilePath), sitePath).toString();

    const urlList = [];

    if (metaSize === 2) { // Bilateral

      const profile1 = profilesMeta[0];
      const profile2 = profilesMeta[1];

      const pages1 = await getAllSearchByProfile(db, profile1);
      const pages2 = await getAllSearchByProfile(db, profile2);

      for (const page1 of pages1) {
        for (const page2 of pages2) {
          const jobParams = {
            page: new URL(path.join(page1.slug, profile2.slug, page2.slug), sitePath).pathname,
            profile: profile1.slug
          };
          languages.forEach(lang => {
            if (page1.slug !== page2.slug) {
              jobParams.lang = lang;
              urlList.push({url: urlTemplate.replace(/:(\w+)\b/g, (_, key) => jobParams[key] ? jobParams[key] : _)});
            }
          });
        }
      }

    } else if (metaSize === 1 || metaSize > 2) { // Treat them as single member
      for (const profile of profilesMeta) {
        const pages = await getAllSearchByProfile(db, profile);
        for (const page of pages) {
          const jobParams = {
            page: page.slug,
            profile: profile.slug
          };
          languages.forEach(lang => {
            jobParams.lang = lang;
            urlList.push({url: urlTemplate.replace(/:(\w+)\b/g, (_, key) => jobParams[key] ? jobParams[key] : _)});
          });
        }
      }
    }

    console.log(urlList.length);

    return generateOutput(format, urlList, res);

  });

};
