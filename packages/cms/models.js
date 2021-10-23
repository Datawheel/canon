const models = {
  block: require.resolve("./src/db/block.js"),
  block_content: require.resolve("./src/db/block_content.js"),
  block_input: require.resolve("./src/db/block_input.js"),
  formatter: require.resolve("./src/db/formatter.js"),
  image: require.resolve("./src/db/image.js"),
  image_content: require.resolve("./src/db/image_content.js"),
  profile: require.resolve("./src/db/profile.js"),
  profile_content: require.resolve("./src/db/profile_content.js"),
  profile_meta: require.resolve("./src/db/profile_meta.js"),
  search: require.resolve("./src/db/search.js"),
  search_content: require.resolve("./src/db/search_content.js"),
  section: require.resolve("./src/db/section.js"),
  section_content: require.resolve("./src/db/section_content.js")
};

module.exports = {
  modelPaths: models
};
