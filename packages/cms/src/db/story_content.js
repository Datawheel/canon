module.exports = function(sequelize, db) {

  const s = sequelize.define("story_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_cms_story",
          key: "id"
        }
      },
      locale: {
        type: db.STRING,
        primaryKey: true
      },
      title: {
        type: db.STRING,
        defaultValue: "New Story"
      },
      subtitle: {
        type: db.TEXT,
        defaultValue: ""
      },
      image: {
        type: db.STRING,
        defaultValue: ""
      }
    }, 
    {
      tableName: "canon_cms_story_content",
      freezeTableName: true,
      timestamps: false
    }
  ); 

  return s;

};
