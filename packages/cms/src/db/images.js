
module.exports = function(sequelize, db) {

  const images = sequelize.define("images",
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
      tableName: "canon_cms_images",
      freezeTableName: true
    }
  );

  images.associate = models => {
    images.hasMany(models.image_content, {foreignKey: "id", sourceKey: "id", as: "content"});
  };

  return images;

};
