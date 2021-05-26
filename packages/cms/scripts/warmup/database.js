const Sequelize = require("sequelize");

module.exports = {
  hydrateModels
};

/**
 * Creates a new sequelize connection, and imports the needed models into it.
 *
 * @param {import(".").WarmupCliOptions} options
 */
async function hydrateModels(options, reporter) {
  const Op = Sequelize.Op;
  const dbConnection = options.db || "postgresql://".concat(
    options["db-user"], ":", options["db-pass"],
    "@", options["db-host"],
    "/", options["db-name"]
  );
  reporter.print(`Database Connection: ${dbConnection}`);

  let step;

  step = reporter.step("Creating new sequelize instance");
  const sequelize = new Sequelize(dbConnection, {
    logging: false,
    operatorsAliases: false
  });
  step.resolve();

  step = reporter.step("Testing connection");
  await sequelize.authenticate().then(step.resolve, step.reject);

  step = reporter.step("Retrieving database models");
  const {modelPaths} = require("../../models");

  const ProfileMeta = sequelize.import(modelPaths.profile_meta);
  const Search = sequelize.import(modelPaths.search);
  const SearchContent = sequelize.import(modelPaths.search_content);
  step.resolve();

  ProfileMeta.findAllIn = function(limitedProfiles = []) {
    const step = reporter.step("Requesting configured profiles");
    return ProfileMeta
      .findAll({
        where: {
          cubeName: {[Op.ne]: ""},
          dimension: {[Op.ne]: ""},
          [Op.and]: Sequelize.where(
            Sequelize.fn("array_length", Sequelize.col("levels"), 1),
            {[Op.gt]: 0}
          ),
          measure: {[Op.ne]: ""},
          slug: limitedProfiles.length > 0
            ? {[Op.in]: limitedProfiles}
            : {[Op.ne]: ""},
          visible: true
        }
      })
      .then(step.resolve, step.reject)
      .then(profiles => {
        if (limitedProfiles.length > 0) {
          reporter.print(`User requested for profiles: ${limitedProfiles.join(", ")}`);
        }
        reporter.print(`Profiles found: ${profiles.map(p => p.slug).join(", ")}`);
        return profiles.sort((a, b) =>
          limitedProfiles.indexOf(a.slug) - limitedProfiles.indexOf(b.slug)
        );
      });
  };

  Search.hasMany(SearchContent, {
    foreignKey: "id",
    sourceKey: "contentId",
    as: "contents"
  });

  Search.findAllFromProfile = function(profile) {
    return Search.findAll({
      include: [{association: "contents"}],
      where: {
        cubeName: profile.cubeName,
        dimension: profile.dimension
      },
      order: [
        ["zvalue", "DESC"],
        ["hierarchy", "ASC"],
        ["slug", "ASC"]
      ]
    }).then(pages => pages.filter(search => {
      const {contents} = search;
      return !contents || !contents.some(cnt => cnt.attr && cnt.attr.show === false);
    }));
  };

  return {ProfileMeta, Search, SearchContent};
}
