module.exports = function(sequelize, db) {

  const a = sequelize.define("author_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true
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
      parent_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "author",
          key: "id"
        }
      },
      bio: {
        type: db.TEXT, 
        defaultValue: "New Bio"
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return a;

};
