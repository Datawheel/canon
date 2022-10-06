const Sequelize = require("sequelize");

module.exports = {
  hydrateModelsProfile
};

/**
 * Creates a new sequelize connection, and imports the needed models into it.
 *
 * @param {import(".").WarmupCliOptions} options
 */
async function hydrateModelsProfile(sequelize) {
  const Op = Sequelize.Op;

  const Story = sequelize.story;
  const Profile = sequelize.profile;
  const ProfileMeta = sequelize.profile_meta;
  const Search = sequelize.search;
  const SearchContent = sequelize.search_content;

  Profile.getAllVisible = function() {
    return Profile
      .findAll({
        where: {
          visible: true
        },
        include: "meta"
      })
      .then(profiles => profiles);
  };

  ProfileMeta.findAllIn = function(profileId) {
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
          visible: true,
          profile_id: profileId
        },
        include: "profile",
        order: [["ordering", "ASC"]]
      })
      .then(profilesMetas => profilesMetas);
  };

  Search.findAllFromProfile = function(profile) {
    return Search.findAll({
      include: "content",
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
      const {content} = search;
      return !content || !content.some(cnt => cnt.attr && cnt.attr.show === false);
    }));
  };

  Story.findAllPublicStories = function() {
    const now = Date.now();
    return Story
      .findAll({
        include: "content"
      })
      .then(stories => stories.filter(story => story.visible && story.date < now));
  };

  return {Story, Profile, ProfileMeta, Search, SearchContent};
}
