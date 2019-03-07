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
      lang: {
        type: db.STRING,
        primaryKey: true
      },
      name: {
        type: db.STRING, 
        defaultValue: "New Author"
      },
      title: {
        type: db.STRING, 
        defaultValue: "New Title"
      },
      image: {
        type: db.STRING, 
        defaultValue: "New Image"
      },
      twitter: {
        type: db.STRING, 
        defaultValue: "New Twitter"
      },
      bio: {
        type: db.TEXT, 
        defaultValue: "New Bio"
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
