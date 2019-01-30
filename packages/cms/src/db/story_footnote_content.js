module.exports = function(sequelize, db) {

  const s = sequelize.define("story_footnote_content",
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
        defaultValue: "New Title"
      },
      description: {
        type: db.TEXT,
        defaultValue: "New Footnote"
      }, 
      parent_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "story_footnote",
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
