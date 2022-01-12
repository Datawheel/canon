const path = require('path');
const {hydrateModelsProfile} = require("../../src/utils/sequelize/profiles");

const {
  CANON_API,
  CANON_LANGUAGES
} = process.env;

//Defaults
const languages = CANON_LANGUAGES ? CANON_LANGUAGES.split(',') : ["en"];
const sitePath = CANON_API || "http://localhost:3300";

//Get canon data
const canonConfigPath = path.resolve("canon.js");
const canon = require(canonConfigPath);

const sitemapConfig = canon && canon.sitemap ? canon.sitemap : {
  paths: {
    profiles: '/:lang/profile/:profile/:page',
    stories: '/:lang/story/:page'
  },
  rss: {
    blogName: "My Datawheel blog",
    blogDescription: "This is a fantastic blog based on data."
  },
  getMainPaths: async (app) => {
    //You can run queries in here and return an array of paths
    return [
      "/"
    ]
  }
};

const profilePath = sitemapConfig.paths.profiles;
const storyPath = sitemapConfig.paths.stories;

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

const getAllPublicStories = async (database) => {
  const {Story} = await hydrateModelsProfile(database);
  const stories = await Story.findAllPublicStories();
  return stories;
};

const generateOutput = (format, data, res) => {

  let content = [];

  // Limit 50k links per sitemap TODO: split the files, paginated
  const filteredData = data.slice(0, 50000);

  //Formats
  switch (format) {

    case "txt":
      res.setHeader('Content-type', 'text/plain');
      content = filteredData.map(d => d.url);
      break;

    case "xml":
      res.header('Content-Type', 'text/xml');

      content = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
      ];

      for (const link of filteredData) {
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

    case "rss":
      res.header('Content-Type', 'text/xml');

      const sitemapStoriesRSS = new URL(path.join("/api/sitemap/stories.rss"), sitePath)

      content = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '  <channel>',
        `  <title>${sitemapConfig.rss.blogName}</title>`,
        `  <link>${sitePath}</link>`,
        `  <description>${sitemapConfig.rss.blogDescription}</description>`,
        `  <atom:link href="${sitemapStoriesRSS}" rel="self" type="application/rss+xml" />`
      ];

      for (const link of filteredData) {
        content = content.concat(
          [
            '  <item>',
            `    <title>${link.title}</title> `,
            `    <pubDate>${link.date}</pubDate> `,
            `    <link>${link.url}</link> `,
            `    <guid>${link.url}</guid> `,
            `    <description>${link.subtitle}</description> `,
            '  </item>'
          ]
        );
      }

      content.push('  </channel>');
      content.push('</rss>');

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

  app.get("/api/sitemap.:format", async (req, res) => {

    const format = req.params.format;
    const list = await getAllProfilesTypes(db);

    if (["txt", "xml", "json"].indexOf(format) === -1) { //Validate format
      return res.status(404).send('Sitemap Not Found: Wrong format');
    } else {
      const sitemapCustomUrl = new URL(path.join("/api/sitemap/main"), sitePath);
      const sitemapStoriesUrl = new URL(path.join("/api/sitemap/stories"), sitePath);

      let content = [];

      switch (format) {
        case 'txt':
          res.setHeader('Content-type', 'text/plain');
          content = content.concat([
            `${sitemapCustomUrl}.txt`,
            `${sitemapCustomUrl}.xml`,
            `${sitemapStoriesUrl}.txt`,
            `${sitemapStoriesUrl}.xml`,
            `${sitemapStoriesUrl}.rss`
          ]);

          for (const profileType of list) {
            const sitemapProfileUrl = new URL(path.join("/api/sitemap", `profiles/${profileType.id}`), sitePath);
            content.push(`${sitemapProfileUrl}.txt`);
            content.push(`${sitemapProfileUrl}.xml`);
          }

          content = content.join('\n');

          break;

        case 'xml':
          res.header('Content-Type', 'text/xml');

          content = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
          ];

          content = content.concat([
            `  <sitemap><loc>${sitemapCustomUrl}.xml</loc></sitemap>`,
            `  <sitemap><loc>${sitemapStoriesUrl}.xml</loc></sitemap>`
          ]);

          for (const profileType of list) {
            const sitemapProfileUrl = new URL(path.join("/api/sitemap", `profiles/${profileType.id}`), sitePath);
            content.push(`  <sitemap><loc>${sitemapProfileUrl}.xml</loc></sitemap>`);
          }

          content.push('</sitemapindex>');

          content = content.join('\n');

          break;

        case 'json':
          res.setHeader('Content-Type', 'application/json');
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
          content = data;
          break;

        default:
          break;
      }

      res.send(content).end();
    }

  });

  app.get("/api/sitemap/main.:format", async (req, res) => {

    const list = await sitemapConfig.getMainPaths(app);

    const format = req.params.format;

    const urlList = list.map(url => {
      return {
        url: new URL(path.join(url), sitePath)
      }
    });

    return generateOutput(format, urlList, res);

  });

  app.get("/api/sitemap/stories.:format", async (req, res) => {

    const format = req.params.format;

    if (["txt", "xml", "rss"].indexOf(format) === -1) { //Validate format
      return res.status(404).send('Sitemap Not Found: Wrong format');
    } else {

      const stories = await getAllPublicStories(db);

      const urlTemplate = new URL(path.join(storyPath), sitePath).toString();

      const urlList = [];

      let jobParams;
      let langParams;
      let urlObj;
      for (const story of stories) {
        jobParams = {
          page: story.slug
        };
        languages.forEach(lang => {
          jobParams.lang = lang;
          urlObj = {
            title: story.slug, //Default, replaced later
            subtitle: story.slug, //Default, replaced later
            url: urlTemplate.replace(/:(\w+)\b/g, (_, key) => jobParams[key] ? jobParams[key] : _),
            date: story.date.toUTCString()
          };

          langParams = story.content.find(content => content.locale === lang);
          if (langParams) {
            urlObj.title = langParams.title.replace(/<\/?[^>]+(>|$)/g, "");
            urlObj.subtitle = langParams.subtitle.replace(/<\/?[^>]+(>|$)/g, "");
          }

          urlList.push(urlObj);
        });
      }

      return generateOutput(format, urlList, res);
    }

  });

  app.get("/api/sitemap/profiles/:profileId.:format", async (req, res) => {

    const profileId = parseInt(req.params.profileId, 10);

    const format = req.params.format;

    const profilesMeta = await getAllProfilesMetaByType(db, profileId);

    if (profilesMeta.length === 0) { //Validate profile id
      return res.status(404).send('Sitemap Not Found: Wrong profile number');
    } else if (["txt", "xml"].indexOf(format) === -1) { //Validate format
      return res.status(404).send('Sitemap Not Found: Wrong format');
    } else { //Generate sitemap

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
              page: `${page1.slug}/${profile2.slug}/${page2.slug}`,
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

      return generateOutput(format, urlList, res);
    }

  });

};
