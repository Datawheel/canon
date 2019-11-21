module.exports = function(sequelize, db) {

  const a = sequelize.define("author_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_cms_author",
          key: "id"
        }
      },
      locale: {
        type: db.STRING,
        primaryKey: true
      },
      name: {
        type: db.STRING
      },
      title: {
        type: db.STRING
      },
      image: {
        type: db.STRING
      },
      twitter: {
        type: db.STRING
      },
      bio: {
        type: db.TEXT
      }
    }, 
    {
      tableName: "canon_cms_author_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return a;

};
