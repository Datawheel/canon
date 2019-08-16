module.exports = function(sequelize, db) {

  const image = sequelize.define("image",
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: db.INTEGER
      },
      url: {
        type: db.TEXT,
        unique: true
      },
      author: db.TEXT,
      license: db.INTEGER
    },
    {
      tableName: "canon_cms_image",
      freezeTableName: true
    }
  );

  image.associate = models => {
    image.hasMany(models.image_content, {foreignKey: "id", sourceKey: "id", as: "content"});
  };

  return image;

};
