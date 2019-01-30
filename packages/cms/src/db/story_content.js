module.exports = function(sequelize, db) {

  const s = sequelize.define("story_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true
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
      }, 
      ordering: db.INTEGER,
      slug: {
        type: db.STRING,
        defaultValue: "new-story-slug"
      },
      date: {
        type: db.DATE,
        defaultValue: "2018-01-01 00:00:00"
      },
      parent_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "story",
          key: "id"
        }
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  ); 

  return s;

};
