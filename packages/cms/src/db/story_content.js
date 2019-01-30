module.exports = function(sequelize, db) {

  const s = sequelize.define("story_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "story",
          key: "id"
        }
      },
      lang: {
        type: db.STRING,
        primaryKey: true
      },
      title: {
        type: db.STRING,
        defaultValue: "New Story"
      },
      subtitle: {
        type: db.TEXT,
        defaultValue: "New Subtitle"
      },
      image: {
        type: db.STRING,
        defaultValue: "New Image"
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  ); 

  return s;

};
