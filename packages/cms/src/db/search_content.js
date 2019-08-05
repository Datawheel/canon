module.exports = function(sequelize, db) {

  const s = sequelize.define("search_content",
    {
      id: {
        type: db.TEXT,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_cms_search",
          key: "id"
        }
      },
      lang: {
        type: db.STRING,
        primaryKey: true
      },
      name: {
        primaryKey: true,
        type: db.TEXT
      },
      display: db.TEXT,
      keywords: db.ARRAY(db.TEXT),
      imageId: db.INTEGER
    },
    {
      tableName: "canon_cms_search_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
