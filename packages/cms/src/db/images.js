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
      meta: db.TEXT,
      license: db.INTEGER,
      link: db.TEXT
    },
    {
      tableName: "canon_cms_images",
      freezeTableName: true
    }
  );

  return images;

};
