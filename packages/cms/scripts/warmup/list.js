const {hydrateModels} = require("./database");
const {Reporter} = require("./common");

const reporter = new Reporter();

/**
 * Generates a list of the URLs for profiles on the app CMS instance.
 *
 * @param {import(".").WarmupCliOptions} options
 */
module.exports = async function(options) {
  reporter.setOutput(options.output);
  reporter.printLine();

  const urlTemplate = options.base || "";

  const {ProfileMeta, Search} = await hydrateModels(options, reporter);

  const profiles = await ProfileMeta.findAllIn([]);

  for (const profile of profiles) {
    const pages = await Search.findAllFromProfile(profile);

    for (const page of pages) {
      const jobParams = {
        page: page.slug,
        profile: profile.slug
      };
      const url = urlTemplate.replace(/:(\w+)\b/g, (_, key) => jobParams[key]);
      reporter.log(url);
    }
  }
};
