module.exports = function(sequelize, db) {

  const search = sequelize.define("search",
    {
      id: {
        primaryKey: true,
        type: db.TEXT
      },
      zvalue: db.DOUBLE,
      dimension: {
        primaryKey: true,
        type: db.TEXT
      },
      hierarchy: {
        primaryKey: true,
        type: db.TEXT
      },
      stem: db.INTEGER,
      slug: db.TEXT
    },
    {
      tableName: "canon_cms_search",
      freezeTableName: true,
      timestamps: false
    }
  );

  return search;

};
