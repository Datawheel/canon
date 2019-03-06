module.exports = function(sequelize, db) {

  const s = sequelize.define("story_footnote_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "story_footnote",
          key: "id"
        }
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
      }
    }, 
    {
      tableName: "canon_cms_story_footnote_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
