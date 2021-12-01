module.exports = function(sequelize, db) {

  const tesseract = sequelize.define("tesseract",
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
      slug: db.TEXT,
      imageId: db.INTEGER,
      contentId: {
        autoIncrement: true,
        type: db.INTEGER,
        unique: true
      },
      cubeName: {
        primaryKey: true,
        type: db.TEXT
      },
      visible: {
        type: db.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: "canon_cms_tesseract",
      freezeTableName: true,
      timestamps: false
    }
  );

  tesseract.associate = models => {
    tesseract.belongsTo(models.image, {as: "image"});
    tesseract.hasMany(models.tesseract_content, {foreignKey: "id", sourceKey: "contentId", as: "contentByLocale"});
  };

  return tesseract;

};
