const sequelize = require("sequelize");

let checkedUnaccent,
    unaccentExtensionInstalled;

const unaccentCheck = async dbQuery => {
  const [_unaccentResult, unaccentMetadata] = await dbQuery(
    "SELECT * FROM pg_extension WHERE extname = 'unaccent';"
  );
  unaccentExtensionInstalled = unaccentMetadata.rowCount >= 1;
  if (!unaccentExtensionInstalled) {
    console.log(
      "WARNING: For better search results, Consider installing the 'unaccent' extension in Postgres by running: CREATE EXTENSION IF NOT EXISTS unaccent;"
    );
    console.log(
      "Do not forget to restart the web application after installation."
    );
  }
};

const maybeGenerateUnaccentQuery = async(dbQuery, term) => {
  if (!checkedUnaccent) {
    await unaccentCheck(dbQuery);
    checkedUnaccent = true;
  }
  const orArray = [];
  if (unaccentExtensionInstalled) {
    // Where by name
    orArray.push(
      sequelize.where(sequelize.fn("unaccent", sequelize.col("name")), {
        [sequelize.Op.iLike]: sequelize.fn(
          "concat",
          "%",
          sequelize.fn("unaccent", term),
          "%"
        )
      })
    );

    // Where by keywords
    orArray.push(
      sequelize.where(
        sequelize.fn(
          "unaccent",
          sequelize.fn(
            "array_to_string",
            sequelize.col("keywords"),
            " ",
            ""
          )
        ),
        {
          [sequelize.Op.iLike]: sequelize.fn(
            "concat",
            "%",
            sequelize.fn("unaccent", term),
            "%"
          )
        }
      )
    );
  }
  return orArray;
};

module.exports = {maybeGenerateUnaccentQuery};
