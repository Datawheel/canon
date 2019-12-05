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
        type: db.STRING,
        defaultValue: ""
      },
      title: {
        type: db.STRING,
        defaultValue: ""
      },
      image: {
        type: db.STRING,
        defaultValue: ""
      },
      twitter: {
        type: db.STRING,
        defaultValue: ""
      },
      bio: {
        type: db.TEXT,
        defaultValue: ""
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
