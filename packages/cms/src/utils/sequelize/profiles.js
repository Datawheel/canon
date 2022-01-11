const Sequelize = require("sequelize");

module.exports = {
  hydrateModels
};

/**
 * Creates a new sequelize connection, and imports the needed models into it.
 *
 * @param {import(".").WarmupCliOptions} options
 */
async function hydrateModels(sequelize) {
  const Op = Sequelize.Op;

  const ProfileMeta = sequelize.profile_meta;
  const Search = sequelize.search;
  const SearchContent = sequelize.search_content;

  ProfileMeta.findAllIn = function () {
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
          slug: {[Op.ne]: ""},
          visible: true
        },
        include: "profile"
      })
      .then(profilesMetas => {
        return profilesMetas.filter(profileMeta => {
          return !profileMeta.profile || profileMeta.profile.visible;
        })
      });
  };

  Search.hasMany(SearchContent, {
    foreignKey: "id",
    sourceKey: "contentId",
    as: "relatedContent"
  });

  Search.findAllFromProfile = function (profile) {
    return Search.findAll({
      include: [{association: "relatedContent"}],
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
      const {relatedContent} = search;
      return !relatedContent || !relatedContent.some(cnt => cnt.attr && cnt.attr.show === false);
    }));
  };

  return {ProfileMeta, Search, SearchContent};
}
