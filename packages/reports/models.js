const models = {
  block: require.resolve("./src/db/block.js"),
  block_content: require.resolve("./src/db/block_content.js"),
  block_input: require.resolve("./src/db/block_input.js"),
  formatter: require.resolve("./src/db/formatter.js"),
  image: require.resolve("./src/db/image.js"),
  image_content: require.resolve("./src/db/image_content.js"),
  report: require.resolve("./src/db/report.js"),
  report_content: require.resolve("./src/db/report_content.js"),
  report_meta: require.resolve("./src/db/report_meta.js"),
  search: require.resolve("./src/db/search.js"),
  search_content: require.resolve("./src/db/search_content.js"),
  section: require.resolve("./src/db/section.js"),
  section_content: require.resolve("./src/db/section_content.js")
};

module.exports = {
  modelPaths: models
};