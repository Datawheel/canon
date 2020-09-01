module.exports = function(sequelize, db) {

  const keywordsType = process.env.CANON_DB_ENGINE === "sqlite" ? db.JSON : db.ARRAY(db.TEXT);

  const s = sequelize.define("search_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_cms_search",
          key: "contentId"
        }
      },
      locale: {
        type: db.STRING,
        primaryKey: true
      },
      name: db.TEXT,
      attr: db.JSONB,
      keywords: keywordsType
    },
    {
      tableName: "canon_cms_search_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
