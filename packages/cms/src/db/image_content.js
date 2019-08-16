module.exports = function(sequelize, db) {

  const i = sequelize.define("image_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_cms_images",
          key: "id"
        }
      },
      locale: {
        type: db.STRING,
        primaryKey: true
      },
      meta: db.TEXT
    },
    {
      tableName: "canon_cms_image_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return i;

};
