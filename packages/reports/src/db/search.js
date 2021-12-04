module.exports = function(sequelize, db) {

  const search = sequelize.define("search",
    {
      id: {
        primaryKey: true,
        type: db.TEXT
      },
      zvalue: db.DOUBLE,
      slug: db.TEXT,
      imageId: db.INTEGER,
      contentId: {
        autoIncrement: true,
        type: db.INTEGER,
        unique: true
      },
      properties: {
        type: db.JSONB,
        defaultValue: {}
      },
      namespace: db.TEXT,
      visible: {
        type: db.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: "canon_reports_search",
      freezeTableName: true,
      timestamps: false
    }
  );

  search.associate = models => {
    search.belongsTo(models.image, {as: "image"});
    search.hasMany(models.search_content, {foreignKey: "id", sourceKey: "contentId", as: "contentByLocale"});
  };

  return search;

};
