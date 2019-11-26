module.exports = function(sequelize, db) {

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
      keywords: db.ARRAY(db.TEXT)
    },
    {
      tableName: "canon_cms_search_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
